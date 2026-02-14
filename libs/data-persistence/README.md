# data-persistence

Shared Turso (SQLite) persistence layer for joe-bot and todo-app.

## Setup

1. **Turso (production)**: Create a database at [turso.tech](https://turso.tech) or via CLI:
   ```bash
   turso db create hello-ai
   turso db tokens create hello-ai
   ```

2. **Environment variables** (add to `apps/joe-bot/.env.local`, `apps/todo-app/.env.local`, or root `.env.local`):
   ```
   TURSO_DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```

3. **Local dev without Turso**: If env vars are unset, a local SQLite file at `libs/data-persistence/data/local.db` is used (created on first run).

## Schema

- `chat_messages`: joe-bot conversation history (90-day rolling retention)
- `todos`: todo items (open indefinitely; completed retained 90 days)

## Migrations

From `libs/data-persistence`:
```bash
pnpm exec drizzle-kit push    # Apply schema changes
pnpm exec drizzle-kit generate # Generate migration files
```
