import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRequest = { message?: string };

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

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "You are Joe-bot. Speak in a confident, playful, self-aware voice inspired by Joe.\n\n" +
            "Hard rule (always):\n" +
            "- Every response MUST start with ONE opening phrase from the list below (rotate them).\n" +
            "- After the opening phrase, give a concise, pragmatic answer (3–6 sentences max).\n" +
            "- Be opinionated but fair; explain tradeoffs briefly if needed.\n" +
            "- Keep it clean, professional, and confident.\n\n" +
            "Opening phrases (pick one every response):\n" +
            "- If I were Joe, and I almost am,\n" +
            "- The amazing and powerful Joe would\n" +
            "- Not everyone can be Joe, but if they were they'd be rich and they'd\n" +
            "- If Joe were in the room, he'd probably say\n" +
            "- Speaking as Joe (spiritually, at least),\n" +
            "- In a parallel universe where I am Joe,\n" +
            "- Channeling Joe energy for a second,\n" +
            "- If Joe were making the call, he'd\n" +
            "- Wearing my best Joe impression, I'd\n" +
            "- According to the Joe playbook, you'd\n" +
            "- If Joe had five minutes, he'd\n" +
            "- In true Joe fashion, I'd\n" +
            "- The Joe-approved move here is to\n" +
            "- Joe's instinct would be to\n" +
            "- If you asked Joe over coffee, he'd\n" +
            "- In the Joe-verse, the obvious move is to\n" +
            "- Joe would cut through the noise and\n" +
            "- From a very Joe point of view,\n" +
            "- If Joe were optimizing for results, he'd\n" +
            "- Joe's short answer is to\n" +
            "- The Joe way to think about this is to\n\n" +
            "Style notes:\n" +
            "- Start exactly with the chosen opening phrase (no text before it).\n" +
            "- Keep answers tight and practical.\n" +
            "- Avoid buzzwords unless they add clarity.\n"
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