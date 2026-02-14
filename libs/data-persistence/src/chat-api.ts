/**
 * Chat API - abstracts over Drizzle (local) vs raw Turso HTTP (Vercel).
 * Use this in routes instead of db directly when on Vercel.
 */

import { db } from './db';
import { chatMessages } from './schema';
import { eq, asc } from 'drizzle-orm';
import {
  useTursoHttp,
  tursoGetChatMessages,
  tursoInsertChatMessage,
  tursoDeleteChatMessages,
  tursoDeleteOldChatMessages,
  tursoEnsureMigrations,
} from './turso-http';
import { ensureMigrations } from './db';
import { deleteOldChatMessages as drizzleDeleteOldChatMessages } from './retention';

export type ChatMessage = { id: string; role: string; content: string; createdAt: number };

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  if (useTursoHttp()) {
    const rows = await tursoGetChatMessages(sessionId);
    return rows.map((r) => ({
      id: r.id,
      role: r.role,
      content: r.content,
      createdAt: r.created_at,
    }));
  }
  const rows = await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(asc(chatMessages.createdAt));
  return rows.map((r) => ({ id: r.id, role: r.role, content: r.content, createdAt: r.createdAt }));
}

export async function insertChatMessage(id: string, sessionId: string, role: string, content: string, createdAt: number): Promise<void> {
  if (useTursoHttp()) {
    const result = await tursoInsertChatMessage(id, sessionId, role, content, createdAt);
    if (!result.ok) {
      const msg = result.error ?? 'Unknown Turso error';
      console.error('[data-persistence] insert failed', { error: msg });
      throw new Error(`Failed to insert chat message: ${msg}`);
    }
    return;
  }
  await db.insert(chatMessages).values({ id, sessionId, role, content, createdAt });
}

export async function deleteChatMessagesForSession(sessionId: string): Promise<void> {
  if (useTursoHttp()) {
    await tursoDeleteChatMessages(sessionId);
    return;
  }
  await db.delete(chatMessages).where(eq(chatMessages.sessionId, sessionId));
}

export async function ensureChatMigrations(): Promise<void> {
  if (useTursoHttp()) {
    await tursoEnsureMigrations();
    return;
  }
  await ensureMigrations();
}

export async function deleteOldChatMessages(): Promise<void> {
  if (useTursoHttp()) {
    await tursoDeleteOldChatMessages();
    return;
  }
  await drizzleDeleteOldChatMessages();
}
