import {
  db,
  todos,
  asc,
  eq,
  getOrCreateSessionId,
  sessionCookieHeader,
  deleteOldCompletedTodos,
} from '@hello-ai/data-persistence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cookieHeader = (sessionId: string) => ({
  'Content-Type': 'application/json',
  'Set-Cookie': sessionCookieHeader(sessionId),
});

export async function GET() {
  const sessionId = await getOrCreateSessionId();
  await deleteOldCompletedTodos();

  const rows = await db
    .select()
    .from(todos)
    .where(eq(todos.sessionId, sessionId))
    .orderBy(asc(todos.createdAt));

  const todosList = rows.map((r) => ({
    id: r.id,
    text: r.text,
    completed: r.completed,
  }));

  return new Response(JSON.stringify({ todos: todosList }), {
    headers: cookieHeader(sessionId),
  });
}

export async function POST(req: Request) {
  const sessionId = await getOrCreateSessionId();
  const body = (await req.json()) as { text?: string };
  const text = (body.text ?? '').trim();
  if (!text) {
    return new Response(JSON.stringify({ error: 'Missing text.' }), {
      status: 400,
      headers: cookieHeader(sessionId),
    });
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  await db.insert(todos).values({
    id,
    sessionId,
    text,
    completed: false,
    createdAt: now,
  });

  return new Response(
    JSON.stringify({
      todo: { id, text, completed: false, createdAt: now },
    }),
    { headers: cookieHeader(sessionId) }
  );
}
