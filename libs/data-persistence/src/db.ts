import { drizzle } from 'drizzle-orm/libsql';
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

// Normalize env vars - Vercel often adds newlines when pasting; avoid surrounding quotes
let url = (process.env.TURSO_DATABASE_URL ?? getLocalDbPath()).trim().replace(/^["']|["']$/g, '');
const rawToken = process.env.TURSO_AUTH_TOKEN?.trim().replace(/^["']|["']$/g, '') ?? '';
const authToken = rawToken || undefined;

// Only pass authToken for remote URLs - file: URLs ignore it and can cause 400
const isRemote = url.startsWith('libsql://') || url.startsWith('https://');

// On Vercel: use https:// instead of libsql:// to force HTTP (avoid WebSocket 400 in serverless)
if (process.env.VERCEL === '1' && url.startsWith('libsql://')) {
  url = url.replace(/^libsql:\/\//, 'https://');
}

// Use @libsql/client/web on Vercel - fetch-only, no native deps
const isVercel = process.env.VERCEL === '1';
const useWebClient = isVercel && isRemote;

const { createClient } = useWebClient
  ? await import('@libsql/client/web')
  : await import('@libsql/client');

const client = createClient({
  url,
  ...(isRemote && authToken && { authToken }),
});

export const db = drizzle(client, { schema });

// Log config at load (helps debug Turso 400 - redacts secrets)
if (process.env.VERCEL === '1' && isRemote) {
  const hasToken = Boolean(authToken);
  const tokenLength = authToken?.length ?? 0;
  console.info(
    `[data-persistence] url=${url.slice(0, 40)}... auth=${hasToken} tokenLen=${tokenLength}`
  );
}

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
