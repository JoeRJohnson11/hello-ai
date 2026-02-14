import {
  getOrCreateSessionId,
  sessionCookieHeader,
  ensureChatMigrations,
  getChatMessages,
  deleteChatMessagesForSession,
  deleteOldChatMessages,
} from '@hello-ai/data-persistence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET() {
  await ensureChatMigrations();
  const sessionId = await getOrCreateSessionId();

  await deleteOldChatMessages();

  const rows = await getChatMessages(sessionId);

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
  await ensureChatMigrations();
  const sessionId = await getOrCreateSessionId();
  await deleteChatMessagesForSession(sessionId);
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookieHeader(sessionId),
    },
  });
}
