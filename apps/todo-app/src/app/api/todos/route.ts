import {
  getOrCreateSessionId,
  sessionCookieHeader,
  ensureTodoMigrations,
  getTodos,
  createTodo,
  deleteOldCompletedTodos,
} from '@hello-ai/data-persistence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cookieHeader = (sessionId: string) => ({
  'Content-Type': 'application/json',
  'Set-Cookie': sessionCookieHeader(sessionId),
});

export async function GET() {
  await ensureTodoMigrations();
  const sessionId = await getOrCreateSessionId();
  await deleteOldCompletedTodos();

  const rows = await getTodos(sessionId);
  const todosList = rows.map((r) => ({ id: r.id, text: r.text, completed: r.completed }));

  return new Response(JSON.stringify({ todos: todosList }), {
    headers: cookieHeader(sessionId),
  });
}

export async function POST(req: Request) {
  await ensureTodoMigrations();
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
  const todo = await createTodo(id, sessionId, text, now);

  return new Response(JSON.stringify({ todo: { id: todo.id, text: todo.text, completed: todo.completed, createdAt: todo.createdAt } }), {
    headers: cookieHeader(sessionId),
  });
}
