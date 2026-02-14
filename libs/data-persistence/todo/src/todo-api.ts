/**
 * Todo API - abstracts over Drizzle (local) vs raw Turso HTTP (Vercel).
 */

import {
  asc,
  db,
  drizzleDeleteOldCompletedTodos,
  ensureMigrations,
  eq,
  todos,
  tursoDeleteOldCompletedTodos,
  tursoDeleteTodo,
  tursoEnsureMigrations,
  tursoGetTodoById,
  tursoGetTodos,
  tursoInsertTodo,
  tursoUpdateTodo,
  useTursoHttp,
} from '@hello-ai/data-persistence-core';

export type TodoItem = { id: string; text: string; completed: boolean; createdAt: number };

export async function getTodos(sessionId: string): Promise<TodoItem[]> {
  if (useTursoHttp()) {
    const rows = await tursoGetTodos(sessionId);
    return rows.map((r) => ({
      id: r.id,
      text: r.text,
      completed: Boolean(r.completed),
      createdAt: r.created_at,
    }));
  }
  const rows = await db.select().from(todos).where(eq(todos.sessionId, sessionId)).orderBy(asc(todos.createdAt));
  return rows.map((r) => ({ id: r.id, text: r.text, completed: r.completed, createdAt: r.createdAt }));
}

export async function createTodo(
  id: string,
  sessionId: string,
  text: string,
  createdAt: number
): Promise<TodoItem> {
  if (useTursoHttp()) {
    const result = await tursoInsertTodo(id, sessionId, text, 0, createdAt);
    if (!result.ok) throw new Error(result.error ?? 'Failed to create todo');
    return { id, text, completed: false, createdAt };
  }
  await db.insert(todos).values({ id, sessionId, text, completed: false, createdAt });
  return { id, text, completed: false, createdAt };
}

export async function getTodoById(id: string): Promise<{ id: string; text: string; completed: boolean; createdAt: number; sessionId: string } | null> {
  if (useTursoHttp()) {
    const row = await tursoGetTodoById(id);
    if (!row) return null;
    return {
      id: row.id,
      text: row.text,
      completed: Boolean(row.completed),
      createdAt: row.created_at,
      sessionId: row.session_id,
    };
  }
  const rows = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
  const r = rows[0];
  if (!r) return null;
  return { id: r.id, text: r.text, completed: r.completed, createdAt: r.createdAt, sessionId: r.sessionId };
}

export async function updateTodo(
  id: string,
  updates: { text?: string; completed?: boolean; completedAt?: number | null }
): Promise<TodoItem> {
  if (useTursoHttp()) {
    const dbUpdates: { text?: string; completed?: number; completedAt?: number | null } = {};
    if (updates.text !== undefined) dbUpdates.text = updates.text;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed ? 1 : 0;
    if (updates.completedAt !== undefined) dbUpdates.completedAt = updates.completedAt;
    const result = await tursoUpdateTodo(id, dbUpdates);
    if (!result.ok) throw new Error(result.error ?? 'Failed to update todo');
    const row = await tursoGetTodoById(id);
    if (!row) throw new Error('Todo not found after update');
    return { id: row.id, text: row.text, completed: Boolean(row.completed), createdAt: row.created_at };
  }
  const dbUpdates: Partial<{ text: string; completed: boolean; completedAt: number | null }> = {};
  if (updates.text !== undefined) dbUpdates.text = updates.text;
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.completedAt !== undefined) dbUpdates.completedAt = updates.completedAt;
  const [updated] = await db.update(todos).set(dbUpdates).where(eq(todos.id, id)).returning();
  if (!updated) throw new Error('Todo not found');
  return { id: updated.id, text: updated.text, completed: updated.completed, createdAt: updated.createdAt };
}

export async function deleteTodo(id: string): Promise<void> {
  if (useTursoHttp()) {
    const result = await tursoDeleteTodo(id);
    if (!result.ok) throw new Error(result.error ?? 'Failed to delete todo');
    return;
  }
  await db.delete(todos).where(eq(todos.id, id));
}

export async function ensureTodoMigrations(): Promise<void> {
  if (useTursoHttp()) {
    await tursoEnsureMigrations();
    return;
  }
  await ensureMigrations();
}

export async function deleteOldCompletedTodos(): Promise<void> {
  if (useTursoHttp()) {
    await tursoDeleteOldCompletedTodos();
    return;
  }
  await drizzleDeleteOldCompletedTodos();
}
