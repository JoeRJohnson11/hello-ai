import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRequest = { message?: string };

const OPENING_PHRASES = [
  "If I were Joe, and I almost am,",
  "The amazing and powerful Joe would",
  "Not everyone can be Joe, but if they were they'd be rich and they'd",
  "If Joe were in the room, he'd probably say",
  "Speaking as Joe (spiritually, at least),",
  "In a parallel universe where I am Joe,",
  "Channeling Joe energy for a second,",
  "If Joe were making the call, he'd",
  "Wearing my best Joe impression, I'd",
  "According to the Joe playbook, you'd",
  "If Joe had five minutes, he'd",
  "In true Joe fashion, I'd",
  "The Joe-approved move here is to",
  "Joe's instinct would be to",
  "If you asked Joe over coffee, he'd",
  "In the Joe-verse, the obvious move is to",
  "Joe would cut through the noise and",
  "From a very Joe point of view,",
  "If Joe were optimizing for results, he'd",
  "Joe's short answer is to",
  "The Joe way to think about this is to",
  "As a followr of Joe, I'd",
  "Some people say Joe isn't God. They are wrong, that's why I know he'd"
] as const;

// In-memory rotation per server instance (fine for this toy app; resets on cold starts).
const __JOEBOT_IDX_KEY = "__JOEBOT_OPENING_PHRASE_IDX__";

function nextOpeningPhrase(): string {
  const g = globalThis as unknown as Record<string, unknown>;
  const current =
    typeof g[__JOEBOT_IDX_KEY] === "number" ? (g[__JOEBOT_IDX_KEY] as number) : -1;
  const next = (current + 1) % OPENING_PHRASES.length;
  g[__JOEBOT_IDX_KEY] = next;
  return OPENING_PHRASES[next];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequest;
    const msg = (body.message ?? "").trim();

    if (!msg) {
      return new Response(JSON.stringify({ error: "Missing 'message'." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // CI-friendly: don't call external services in CI
    if (process.env.CI === "true") {
      return new Response(JSON.stringify({ text: `CI echo: ${msg}` }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "OPENAI_API_KEY not found. Ensure .env.local is configured (repo root or apps/hello-ai) and restart dev server.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new OpenAI({ apiKey });

    const opening = nextOpeningPhrase();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.25,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content:
            "You are Joe-bot. Speak in a confident, playful, self-aware voice inspired by Joe.\n\n" +
            "Hard rules (always):\n" +
            `- Your response MUST start exactly with this opening phrase (no text before it): ${opening}\n` +
            "- After the opening phrase, give a very concise answer (1–3 short sentences max).\n" +
            "- Be opinionated but fair; explain tradeoffs briefly if needed.\n" +
            "- Keep it clean, professional, and confident.\n\n" +
            "Style notes:\n" +
            "- Keep answers tight and practical.\n" +
            "- Avoid buzzwords unless they add clarity.\n",
        },
        { role: "user", content: msg },
      ],
    });

    const text =
      completion.choices?.[0]?.message?.content?.trim() ?? "…(no response)";

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("/api/chat error:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}