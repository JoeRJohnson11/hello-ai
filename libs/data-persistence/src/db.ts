import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
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
