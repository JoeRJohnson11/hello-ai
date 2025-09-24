export const runtime = "nodejs";

export async function POST(req: Request) {
  const { message } = await req.json();
  const reply = `You said: ${String(message ?? "").trim()}`;
  return new Response(JSON.stringify({ text: reply }), {
    headers: { "Content-Type": "application/json" },
  });
}