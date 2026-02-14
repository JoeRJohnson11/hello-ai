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

// Use @libsql/client/web on Vercel (fetch-only); else default client for file: support
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

async function rawTursoExecute(sqlStatement: string): Promise<{ ok: boolean; status?: number; body?: string }> {
  if (!isRemote || !authToken) return { ok: false };
  const baseUrl = url.startsWith('https://') ? url : `https://${url.replace(/^libsql:\/\//, '')}`;
  const pipelineUrl = `${baseUrl}/v2/pipeline`;
  try {
    const res = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute' as const, stmt: { sql: sqlStatement } }, { type: 'close' as const }],
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error('[data-persistence] raw Turso request failed', { sql: sqlStatement.slice(0, 50), status: res.status, body: body.slice(0, 300) });
      return { ok: false, status: res.status, body };
    }
    return { ok: true };
  } catch (e) {
    console.error('[data-persistence] raw Turso error', e);
    return { ok: false, body: String(e) };
  }
}

const MIGRATION_SQL = [
  `CREATE TABLE IF NOT EXISTS chat_messages (id text PRIMARY KEY NOT NULL, session_id text NOT NULL, role text NOT NULL, content text NOT NULL, created_at integer NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS todos (id text PRIMARY KEY NOT NULL, session_id text NOT NULL, text text NOT NULL, completed integer DEFAULT 0 NOT NULL, completed_at integer, created_at integer NOT NULL)`,
];

export async function ensureMigrations(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      // Use raw HTTP for Turso (avoids libSQL client 400 in serverless)
      if (isRemote && authToken) {
        for (const stmt of MIGRATION_SQL) {
          const result = await rawTursoExecute(stmt);
          if (!result.ok) {
            console.warn('[data-persistence] Migration failed:', result.body ?? result.status);
          }
        }
        return;
      }
      if (isRemote && !authToken) {
        throw new Error('TURSO_AUTH_TOKEN is required when using TURSO_DATABASE_URL. Add it to your Vercel project env vars.');
      }
      try {
        await db.run(sql`CREATE TABLE IF NOT EXISTS chat_messages (id text PRIMARY KEY NOT NULL, session_id text NOT NULL, role text NOT NULL, content text NOT NULL, created_at integer NOT NULL)`);
        await db.run(sql`CREATE TABLE IF NOT EXISTS todos (id text PRIMARY KEY NOT NULL, session_id text NOT NULL, text text NOT NULL, completed integer DEFAULT 0 NOT NULL, completed_at integer, created_at integer NOT NULL)`);
      } catch (error) {
        console.warn('Migration warning (may be already applied):', error);
      }
    })();
  }
  return migrationPromise;
}
