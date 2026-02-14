import {
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
});

export const todos = sqliteTable('todos', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  text: text('text').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: integer('completed_at', { mode: 'number' }),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
});

export const personFacts = sqliteTable('person_facts', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  category: text('category'),
});
