import {
  getOrCreateSessionId,
  sessionCookieHeader,
  ensureTodoMigrations,
  getTodoById,
  updateTodo,
  deleteTodo,
} from '@hello-ai/data-persistence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cookieHeader = (sessionId: string) => ({
  'Content-Type': 'application/json',
  'Set-Cookie': sessionCookieHeader(sessionId),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureTodoMigrations();
  const sessionId = await getOrCreateSessionId();
  const { id } = await params;

  const row = await getTodoById(id);
  if (!row) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: cookieHeader(sessionId),
    });
  }
  if (row.sessionId !== sessionId) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: cookieHeader(sessionId),
    });
  }

  const body = (await req.json()) as { text?: string; completed?: boolean };
  const updates: Partial<{ text: string; completed: boolean; completedAt: number | null }> = {};

  if (typeof body.text === 'string') {
    updates.text = body.text.trim() || row.text;
  }
  if (typeof body.completed === 'boolean') {
    updates.completed = body.completed;
    updates.completedAt = body.completed ? Date.now() : null;
  }

  if (Object.keys(updates).length === 0) {
    return new Response(
      JSON.stringify({
        todo: { id: row.id, text: row.text, completed: row.completed, createdAt: row.createdAt },
      }),
      { headers: cookieHeader(sessionId) }
    );
  }

  const updated = await updateTodo(id, updates);

  return new Response(
    JSON.stringify({
      todo: { id: updated.id, text: updated.text, completed: updated.completed, createdAt: updated.createdAt },
    }),
    { headers: cookieHeader(sessionId) }
  );
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureTodoMigrations();
  const sessionId = await getOrCreateSessionId();
  const { id } = await params;

  const row = await getTodoById(id);
  if (!row) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: cookieHeader(sessionId),
    });
  }
  if (row.sessionId !== sessionId) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: cookieHeader(sessionId),
    });
  }

  await deleteTodo(id);
  return new Response(JSON.stringify({ ok: true }), {
    headers: cookieHeader(sessionId),
  });
}
