'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppHeader, Button } from '@hello-ai/shared-ui';
import { tokens } from '@hello-ai/shared-design';

type Status = { google: boolean; slack: boolean };

const joeBotUrl = process.env.NEXT_PUBLIC_JOE_BOT_URL || 'http://localhost:3010';

export function AdminConnectUI() {
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const success = params.get('success');
    const error = params.get('error');
    if (success === 'google') setMessage('Google Calendar connected successfully.');
    if (success === 'slack') setMessage('Slack connected successfully.');
    if (error === 'google_denied') setMessage('Google authorization was denied.');
    if (error === 'google_no_code') setMessage('Google did not return an authorization code.');
    if (error === 'google_failed') setMessage('Failed to connect Google Calendar.');
    if (error === 'slack_denied') setMessage('Slack authorization was denied.');
    if (error === 'slack_no_code') setMessage('Slack did not return an authorization code.');
    if (error === 'slack_failed') setMessage('Failed to connect Slack.');
  }, []);

  useEffect(() => {
    fetch('/api/connect/status')
      .then((res) => res.json())
      .then((data: Status) => setStatus(data))
      .catch(() => setStatus({ google: false, slack: false }));
  }, [message]);

  return (
    <main
      className="flex min-h-[100dvh] flex-col bg-zinc-950 text-zinc-100"
      style={{ borderRadius: tokens.radius.md }}
    >
      <div className="px-4 py-4">
        <AppHeader appName="admin" />
      </div>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-8">
        <div className="flex items-center gap-3">
          <Image
            src="/joe-head.png"
            alt="Joe"
            width={48}
            height={48}
            className="rounded-full border border-zinc-800"
          />
          <div>
            <h1 className="text-xl font-semibold">Connect accounts</h1>
            <p className="text-sm text-zinc-400">
              Connect Google Calendar and Slack so Joe-bot can answer questions about availability.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              message.includes('successfully')
                ? 'border-emerald-900/40 bg-emerald-950/40 text-emerald-200'
                : 'border-amber-900/40 bg-amber-950/40 text-amber-200'
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-medium">Google Calendar</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Joe-bot can see calendar events to answer &quot;What is Joe up to?&quot; and similar.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {status?.google ? (
                  <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-sm text-emerald-200">
                    Connected
                  </span>
                ) : (
                  <a href="/api/connect/google">
                    <Button variant="primary" size="sm">
                      Connect
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-medium">Slack</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Joe-bot can read your status and presence for availability context.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {status?.slack ? (
                  <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-sm text-emerald-200">
                    Connected
                  </span>
                ) : (
                  <a href="/api/connect/slack">
                    <Button variant="primary" size="sm">
                      Connect
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <Link
          href={joeBotUrl}
          className="text-sm text-zinc-400 underline underline-offset-2 hover:text-zinc-200"
        >
          ← Back to Joe-bot
        </Link>
      </div>
    </main>
  );
}
