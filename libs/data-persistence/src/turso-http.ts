/**
 * Raw Turso HTTP client - bypasses @libsql/client to avoid 400 in Vercel serverless.
 * Uses Turso's v2/pipeline API directly.
 */

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function getConfig() {
  const url = (process.env.TURSO_DATABASE_URL ?? '').trim().replace(/^["']|["']$/g, '');
  const authToken = (process.env.TURSO_AUTH_TOKEN ?? '').trim().replace(/^["']|["']$/g, '');
  const isRemote = url.startsWith('libsql://') || url.startsWith('https://');
  const baseUrl = url.startsWith('https://') ? url : url.startsWith('libsql://') ? url.replace(/^libsql:\/\//, 'https://') : '';
  return { baseUrl, authToken, isRemote };
}

async function execute(sql: string, args?: Record<string, string | number | null>): Promise<{ rows: Array<Record<string, unknown>>; ok: boolean; error?: string }> {
  const { baseUrl, authToken, isRemote } = getConfig();
  if (!isRemote || !authToken || !baseUrl) {
    return { rows: [], ok: false, error: 'Turso config missing' };
  }
  const pipelineUrl = `${baseUrl}/v2/pipeline`;
  const stmt: { sql: string; named_args?: Array<{ name: string; value: { type: string; value: string } }> } = { sql };
  if (args && Object.keys(args).length > 0) {
    stmt.named_args = Object.entries(args).map(([name, val]) => {
      if (val === null) return { name, value: { type: 'null' as const, value: '' } };
      if (typeof val === 'number') return { name, value: { type: 'integer' as const, value: String(val) } };
      return { name, value: { type: 'text' as const, value: String(val) } };
    });
  }
  try {
    const res = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute' as const, stmt }, { type: 'close' as const }],
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      return { rows: [], ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = JSON.parse(body) as { results?: Array<{ type?: string; response?: { result?: { cols?: string[]; rows?: Array<{ value: unknown }[]> } } }> };
    const result = data.results?.[0]?.response?.result;
    if (!result?.rows) return { rows: [], ok: true };
    const cols = (result.cols ?? []).map((c) => (typeof c === 'string' ? c : (c as { name?: string }).name ?? ''));
    const rows = (result.rows ?? []).map((row) => {
      const obj: Record<string, unknown> = {};
      cols.forEach((colName, i) => {
        const cell = row[i];
        const val = cell && typeof cell === 'object' && 'value' in cell ? (cell as { value: unknown }).value : cell;
        if (colName) obj[colName] = val;
      });
      return obj;
    });
    return { rows, ok: true };
  } catch (e) {
    return { rows: [], ok: false, error: String(e) };
  }
}

export type ChatRow = { id: string; session_id: string; role: string; content: string; created_at: number };

export async function tursoGetChatMessages(sessionId: string): Promise<ChatRow[]> {
  const { rows } = await execute(
    'SELECT id, session_id, role, content, created_at FROM chat_messages WHERE session_id = :sid ORDER BY created_at ASC',
    { sid: sessionId }
  );
  return rows as ChatRow[];
}

export async function tursoInsertChatMessage(id: string, sessionId: string, role: string, content: string, createdAt: number): Promise<{ ok: boolean; error?: string }> {
  return execute(
    'INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES (:id, :sid, :role, :content, :ts)',
    { id, sid: sessionId, role, content, ts: createdAt }
  );
}

export async function tursoDeleteChatMessages(sessionId: string): Promise<boolean> {
  const { ok } = await execute('DELETE FROM chat_messages WHERE session_id = :sid', { sid: sessionId });
  return ok;
}

export async function tursoDeleteOldChatMessages(): Promise<boolean> {
  const cutoff = Date.now() - NINETY_DAYS_MS;
  const { ok } = await execute('DELETE FROM chat_messages WHERE created_at < :cutoff', { cutoff });
  return ok;
}

export async function tursoEnsureMigrations(): Promise<void> {
  const migrations = [
    'CREATE TABLE IF NOT EXISTS chat_messages (id text PRIMARY KEY NOT NULL, session_id text NOT NULL, role text NOT NULL, content text NOT NULL, created_at integer NOT NULL)',
    'CREATE TABLE IF NOT EXISTS todos (id text PRIMARY KEY NOT NULL, session_id text NOT NULL, text text NOT NULL, completed integer DEFAULT 0 NOT NULL, completed_at integer, created_at integer NOT NULL)',
  ];
  for (const sql of migrations) {
    const r = await execute(sql);
    if (!r.ok) console.error('[data-persistence] Migration failed:', r.error);
  }
}

export function useTursoHttp(): boolean {
  const { baseUrl, authToken, isRemote } = getConfig();
  return process.env.VERCEL === '1' && isRemote && !!authToken && !!baseUrl;
}
