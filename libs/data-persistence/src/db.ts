import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './schema';

function getLocalDbPath(): string {
  try {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const dataDir = path.join(dir, '..', 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    return `file:${path.join(dataDir, 'local.db')}`;
  } catch {
    return 'file:./data/local.db';
  }
}

const url = process.env.TURSO_DATABASE_URL ?? getLocalDbPath();
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  ...(authToken && { authToken }),
});

export const db = drizzle(client, { schema });

// Auto-run migrations on first import
let migrationPromise: Promise<void> | null = null;

export async function ensureMigrations(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      try {
        // Create tables if they don't exist (idempotent)
        await db.run(sql`
          CREATE TABLE IF NOT EXISTS chat_messages (
            id text PRIMARY KEY NOT NULL,
            session_id text NOT NULL,
            role text NOT NULL,
            content text NOT NULL,
            created_at integer NOT NULL
          )
        `);

        await db.run(sql`
          CREATE TABLE IF NOT EXISTS todos (
            id text PRIMARY KEY NOT NULL,
            session_id text NOT NULL,
            text text NOT NULL,
            completed integer DEFAULT 0 NOT NULL,
            completed_at integer,
            created_at integer NOT NULL
          )
        `);
      } catch (error) {
        // Silently continue if migrations fail (they may already be applied)
        console.warn('Migration warning (may be already applied):', error);
      }
    })();
  }
  return migrationPromise;
}
