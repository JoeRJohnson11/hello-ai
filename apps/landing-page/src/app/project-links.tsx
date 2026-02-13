'use client';

import { useEffect, useState } from 'react';
import { tokens } from '@hello-ai/shared-design';

/**
 * Link URLs: env var > localhost heuristic > production fallback.
 * Local: when hostname is localhost or 127.0.0.1, uses ports from project.json.
 * Production: set NEXT_PUBLIC_JOE_BOT_URL and NEXT_PUBLIC_TODO_APP_URL in Vercel.
 */
const LOCAL_JOE_BOT_PORT = 3010;
const LOCAL_TODO_PORT = 3012;
// Update fallbacks if Vercel project names differ from these defaults
const FALLBACK_JOE_BOT_URL = 'https://joe-bot.vercel.app';
const FALLBACK_TODO_APP_URL = 'https://joes-todo-app.vercel.app';

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function ProjectLinks() {
  const [joeBotUrl, setJoeBotUrl] = useState(
    () =>
      process.env.NEXT_PUBLIC_JOE_BOT_URL ||
      FALLBACK_JOE_BOT_URL
  );
  const [todoAppUrl, setTodoAppUrl] = useState(
    () =>
      process.env.NEXT_PUBLIC_TODO_APP_URL ||
      FALLBACK_TODO_APP_URL
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && isLocalHost(window.location.hostname)) {
      const host = window.location.hostname;
      setJoeBotUrl(`http://${host}:${LOCAL_JOE_BOT_PORT}`);
      setTodoAppUrl(`http://${host}:${LOCAL_TODO_PORT}`);
    }
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <a href={joeBotUrl} className="group">
        <div
          className="bg-zinc-800 rounded-2xl p-8 hover:bg-zinc-750 transition-colors cursor-pointer h-full flex flex-col items-center justify-center gap-6"
          style={{
            borderRadius: tokens.radius.xl,
            boxShadow: tokens.shadow.md,
          }}
        >
          <div className="text-6xl">🤖</div>
          <h2 className="text-2xl font-semibold text-center">Joe-bot</h2>
          <p className="text-zinc-400 text-center text-sm">
            AI chatbot assistant
          </p>
        </div>
      </a>

      <a href={todoAppUrl} className="group">
        <div
          className="bg-zinc-800 rounded-2xl p-8 hover:bg-zinc-750 transition-colors cursor-pointer h-full flex flex-col items-center justify-center gap-6"
          style={{
            borderRadius: tokens.radius.xl,
            boxShadow: tokens.shadow.md,
          }}
        >
          <div className="text-6xl">✓</div>
          <h2 className="text-2xl font-semibold text-center">Todo App</h2>
          <p className="text-zinc-400 text-center text-sm">
            Task management
          </p>
        </div>
      </a>
    </div>
  );
}
