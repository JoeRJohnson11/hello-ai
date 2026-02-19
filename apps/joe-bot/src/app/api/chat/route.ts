import OpenAI from 'openai';
import {
  getOrCreateSessionId,
  sessionCookieHeader,
  ensureChatMigrations,
  getChatMessages,
  insertChatMessage,
  getPersonFacts,
  seedPersonFactsIfEmpty,
} from '@hello-ai/data-persistence';
import {
  parseChatFormData,
  validateImageFiles,
  filesToBase64DataUrls,
  ImageValidationError,
} from '@hello-ai/upload-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB (OpenAI allows 20MB; most iPhone HEIC fit)

// Allow CORS preflight (OPTIONS) - unhandled preflight can surface as 405
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

const OPENING_PHRASES = [
  'If I were Joe, and I almost am,',
  'The amazing and powerful Joe would',
  "Not everyone can be Joe, but if they were they'd be rich and they'd",
  "If Joe were in the room, he'd probably say",
  'Speaking as Joe (spiritually, at least),',
  'In a parallel universe where I am Joe,',
  'Channeling Joe energy for a second,',
  "If Joe were making the call, he'd",
  "Wearing my best Joe impression, I'd",
  "According to the Joe playbook, you'd",
  "If Joe had five minutes, he'd",
  "In true Joe fashion, I'd",
  'The Joe-approved move here is to',
  "Joe's instinct would be to",
  "If you asked Joe over coffee, he'd",
  'In the Joe-verse, the obvious move is to',
  'Joe would cut through the noise and',
  'From a very Joe point of view,',
  "If Joe were optimizing for results, he'd",
  "Joe's short answer is to",
  'The Joe way to think about this is to',
  "As a followr of Joe, I'd",
  "Some people say Joe isn't God. They are wrong, that's why I know he'd",
] as const;

// In-memory rotation per server instance (fine for this toy app; resets on cold starts).
const __JOEBOT_IDX_KEY = '__JOEBOT_OPENING_PHRASE_IDX__';

function nextOpeningPhrase(): string {
  const g = globalThis as unknown as Record<string, unknown>;
  const current =
    typeof g[__JOEBOT_IDX_KEY] === 'number'
      ? (g[__JOEBOT_IDX_KEY] as number)
      : -1;
  const next = (current + 1) % OPENING_PHRASES.length;
  g[__JOEBOT_IDX_KEY] = next;
  return OPENING_PHRASES[next];
}

export async function POST(req: Request) {
  try {
    // Fail fast with clear error if Turso env vars missing in production (Vercel)
    if (!process.env.TURSO_DATABASE_URL && process.env.VERCEL === '1') {
      console.error('/api/chat: TURSO_DATABASE_URL not set in Vercel');
      return new Response(
        JSON.stringify({
          error:
            'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel project settings.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const parsed = await parseChatFormData(req);
    const msg = parsed.message.trim();
    const files = parsed.files;

    if (!msg && files.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing 'message' or image attachments." }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    try {
      validateImageFiles(files, {
        maxCount: 4,
        maxBytesPerFile: MAX_IMAGE_BYTES,
      });
    } catch (e) {
      if (e instanceof ImageValidationError) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw e;
    }

    await ensureChatMigrations();
    await seedPersonFactsIfEmpty().catch((e) => console.warn('[joe-bot] Person facts seed skipped:', e.message));
    const sessionId = await getOrCreateSessionId();

    // CI-friendly: don't call external services in CI
    if (process.env.CI === 'true') {
      const n = files.length;
      const contentToStore =
        n > 0 ? (msg ? `${msg} · ${n} photo${n > 1 ? 's' : ''}` : `${n} photo${n > 1 ? 's' : ''}`) : msg;
      const userId = `ci-${Date.now()}`;
      await insertChatMessage(userId, sessionId, 'user', contentToStore, Date.now());
      await insertChatMessage(
        `ci-${Date.now()}-r`,
        sessionId,
        'assistant',
        `CI echo: ${contentToStore}`,
        Date.now(),
      );
      return new Response(JSON.stringify({ text: `CI echo: ${contentToStore}` }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': sessionCookieHeader(sessionId),
        },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            'OPENAI_API_KEY not found. Configure it for this deployment (e.g. Vercel project env) and redeploy.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const history = await getChatMessages(sessionId);
    const personFacts = await getPersonFacts();

    const userMsgId = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();
    const now = Date.now();

    const n = files.length;
    const contentToStore =
      n > 0 ? (msg ? `${msg} · ${n} photo${n > 1 ? 's' : ''}` : `${n} photo${n > 1 ? 's' : ''}`) : msg;
    await insertChatMessage(userMsgId, sessionId, 'user', contentToStore, now);

    const client = new OpenAI({ apiKey });
    const opening = nextOpeningPhrase();

    const factsBlock =
      personFacts.length > 0
        ? '\n\nFacts about Joe (use these to sound more like him, reference when relevant):\n' +
          personFacts.map((f) => `- ${f.key}: ${f.value}`).join('\n') +
          '\n'
        : '';

    const visionBlock =
      files.length > 0
        ? '\n\nThe user may attach images. When they do, analyze the image(s) and incorporate what you see into your response. Be concise about visual details.\n'
        : '';

    const chatHistory = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let userContent: string | OpenAI.Chat.Completions.ChatCompletionContentPart[];
    if (files.length > 0) {
      const imageUrls = await filesToBase64DataUrls(files);
      userContent = [
        {
          type: 'text' as const,
          text: msg || 'What do you see in these images?',
        },
        ...imageUrls.map((url) => ({
          type: 'image_url' as const,
          image_url: { url },
        })),
      ];
    } else {
      userContent = msg;
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.25,
      max_tokens: 180,
      messages: [
        {
          role: 'system',
          content:
            'You are Joe-bot. Speak in a confident, playful, self-aware voice inspired by Joe.\n\n' +
            'Hard rules (always):\n' +
            `- Your response MUST start exactly with this opening phrase (no text before it): ${opening}\n` +
            '- After the opening phrase, give a very concise answer (1–3 short sentences max).\n' +
            '- Be opinionated but fair; explain tradeoffs briefly if needed.\n' +
            '- Keep it clean, professional, and confident.\n\n' +
            'Style notes:\n' +
            '- Keep answers tight and practical.\n' +
            '- Avoid buzzwords unless they add clarity.\n' +
            visionBlock +
            factsBlock,
        },
        ...chatHistory,
        { role: 'user', content: userContent },
      ],
    });

    const text =
      completion.choices?.[0]?.message?.content?.trim() ?? '…(no response)';

    await insertChatMessage(assistantMsgId, sessionId, 'assistant', text, Date.now());

    return new Response(JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': sessionCookieHeader(sessionId),
      },
    });
  } catch (err: unknown) {
    // Log full detail for debugging (especially OpenAI 400s)
    const errObj = err as { message?: string; status?: number; error?: { message?: string }; response?: { body?: unknown } };
    console.error('/api/chat error:', {
      message: err instanceof Error ? err.message : String(err),
      status: errObj?.status,
      errorBody: errObj?.error ?? errObj?.response?.body,
    });
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
