import {
  db,
  chatMessages,
  getOrCreateSessionId,
  sessionCookieHeader,
  deleteOldChatMessages,
  asc,
  eq,
} from '@hello-ai/data-persistence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const sessionId = await getOrCreateSessionId();

  await deleteOldChatMessages();

  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt));

  const messages = rows.map((r) => ({
    id: r.id,
    role: r.role as 'user' | 'assistant',
    text: r.content,
    ts: r.createdAt,
    kind: 'normal' as const,
  }));

  return new Response(JSON.stringify({ messages }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookieHeader(sessionId),
    },
  });
}

export async function DELETE() {
  const sessionId = await getOrCreateSessionId();
  await db.delete(chatMessages).where(eq(chatMessages.sessionId, sessionId));
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookieHeader(sessionId),
    },
  });
}
