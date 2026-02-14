import { and, eq, isNotNull, lt } from 'drizzle-orm';
import { db } from './db';
import { chatMessages, todos } from './schema';

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export async function deleteOldChatMessages(): Promise<number> {
  const cutoff = Date.now() - NINETY_DAYS_MS;
  const result = await db
    .delete(chatMessages)
    .where(lt(chatMessages.createdAt, cutoff));
  return result.rowsAffected;
}

export async function deleteOldCompletedTodos(): Promise<number> {
  const cutoff = Date.now() - NINETY_DAYS_MS;
  const result = await db
    .delete(todos)
    .where(
      and(
        eq(todos.completed, true),
        isNotNull(todos.completedAt),
        lt(todos.completedAt!, cutoff)
      )
    );
  return result.rowsAffected;
}
