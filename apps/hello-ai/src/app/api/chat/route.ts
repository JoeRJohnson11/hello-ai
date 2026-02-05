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
            "OPENAI_API_KEY not found. Ensure .env.local is at repo root and restart dev server.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a concise, helpful assistant for a learning project. Prefer short, clear answers.",
        },
        { role: "user", content: msg },
      ],
    });

    const text =
      completion.choices?.[0]?.message?.content?.trim() ?? "(no response)";

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("OpenAI route error:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}