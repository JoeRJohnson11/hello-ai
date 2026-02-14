import { cookies } from 'next/headers';

const SESSION_COOKIE = '__hello_ai_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function uuid(): string {
  return crypto.randomUUID();
}

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    sessionId = uuid();
  }

  return sessionId;
}

export function sessionCookieHeader(sessionId: string): string {
  return `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; SameSite=Lax`;
}
