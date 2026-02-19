'use client';
/** nx-agents full-run test */

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AppHeader, Button, Loader } from '@hello-ai/shared-ui';
import { ImageAttachmentPicker } from '@hello-ai/image-attachment-picker';
import { tokens } from '@hello-ai/shared-design';

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  text: string | React.ReactNode;
  ts: number;
  kind?: 'normal' | 'thinking' | 'away' | 'error';
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    {
      id: uid(),
      role: 'assistant',
      ts: Date.now(),
      text: (
        <>
          Joe&apos;s <em>bot</em> here right now. Can I help?
        </>
      ),
      kind: 'away',
    },
  ]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data: { messages?: { id: string; role: string; text: string; ts: number }[] }) => {
        if (cancelled) return;
        const msgs = data.messages ?? [];
        if (msgs.length > 0) {
          setMessages(
            msgs.map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              text: m.text,
              ts: m.ts,
              kind: 'normal' as const,
            }))
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, isSending]);

  const canSend = useMemo(
    () =>
      !isSending && (input.trim().length > 0 || attachments.length > 0),
    [isSending, input, attachments.length],
  );

  async function send() {
    const msg = input.trim();
    if ((!msg && attachments.length === 0) || isSending) return;

    setError(null);
    setIsSending(true);
    setInput('');
    const filesToSend = [...attachments];
    setAttachments([]);

    const n = filesToSend.length;
    const displayText =
      n > 0 ? (msg ? `${msg} · ${n} photo${n > 1 ? 's' : ''}` : `${n} photo${n > 1 ? 's' : ''}`) : msg;
    const userMsg: ChatMsg = {
      id: uid(),
      role: 'user',
      ts: Date.now(),
      text: displayText,
    };

    const pendingId = uid();
    const pendingMsg: ChatMsg = {
      id: pendingId,
      role: 'assistant',
      ts: Date.now(),
      text: 'Thinking like Joe…',
      kind: 'thinking',
    };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);

    try {
      const body: RequestInit['body'] =
        filesToSend.length > 0
          ? (() => {
              const fd = new FormData();
              fd.append('message', msg);
              filesToSend.forEach((f) => fd.append('files', f));
              return fd;
            })()
          : JSON.stringify({ message: msg });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers:
          filesToSend.length > 0 ? {} : { 'Content-Type': 'application/json' },
        body,
      });

      const payload = (await res.json().catch(() => ({}))) as {
        text?: string;
        error?: string;
      };

      if (!res.ok)
        throw new Error(payload?.error || `Request failed (${res.status})`);

      const text = (payload?.text ?? '').trim();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, kind: 'normal', text: text || '…(no response)' }
            : m,
        ),
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? {
                ...m,
                kind: 'error',
                text: '⚠️ I hit an issue calling /api/chat. Check the server logs.',
              }
            : m,
        ),
      );
    } finally {
      setIsSending(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }

  async function clearChat() {
    setError(null);
    setInput('');
    setAttachments([]);
    setIsSending(false);
    try {
      await fetch('/api/messages', { method: 'DELETE' });
    } catch {
      // ignore
    }
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        ts: Date.now(),
        text: 'Fresh slate. What are you trying to ship?',
      },
    ]);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  return isLoading ? (
    <main
      className="flex min-h-[100dvh] flex-col bg-zinc-950 text-zinc-100"
      style={{ borderRadius: tokens.radius.md }}
    >
      <div className="px-4 py-4">
        <AppHeader appName="joe-bot" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Image
          src="/joe-head.png"
          alt="Loading Joe-bot"
          width={96}
          height={96}
          priority
          className="animate-spin"
        />
        <span className="text-sm text-zinc-400">Waking up Joe-bot…</span>
      </div>
    </main>
  ) : (
    <main
      className="w-full min-h-[100dvh] overflow-x-hidden bg-zinc-950 text-zinc-100"
      style={{ borderRadius: tokens.radius.md }}
    >
      <div className="mx-auto flex w-full min-h-[100dvh] max-w-3xl flex-col px-4 py-8">
        <AppHeader
          appName="joe-bot"
          actions={
            <Button
              onClick={clearChat}
              variant="secondary"
              size="sm"
              title="Clear conversation"
            >
              Clear
            </Button>
          }
        >
          <div>
            <div className="flex items-center gap-2">
              <Image
                src="/joe-head.png"
                alt="Joe headshot"
                width={28}
                height={28}
                priority
                className="rounded-full border border-zinc-800"
              />
              <h1 className="text-2xl font-semibold tracking-tight">Joe-bot</h1>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              It&apos;s like Joe, but its <em>bot</em>
            </p>
          </div>
        </AppHeader>

        <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50 shadow-sm">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === 'user'
                      ? 'flex justify-end'
                      : 'flex justify-start'
                  }
                >
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[85%] whitespace-pre-wrap rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-900 shadow'
                        : 'max-w-[85%] whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm leading-relaxed text-zinc-100'
                    }
                  >
                    {m.kind === 'thinking' ? (
                      <div className="flex items-center gap-2">
                        <Image
                          src="/joe-head.png"
                          alt="Joe-bot thinking"
                          width={18}
                          height={18}
                          className="animate-spin rounded-full border border-zinc-800"
                        />
                        <Loader
                          size={18}
                          label={
                            typeof m.text === 'string'
                              ? m.text
                              : 'Thinking like Joe…'
                          }
                        />
                      </div>
                    ) : (
                      <>
                        {m.kind === 'away' && (
                          <span className="mr-2 opacity-70" aria-hidden>
                            ⏳
                          </span>
                        )}
                        <span>{m.text}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div ref={endRef} />
            </div>
          </div>

          <div className="border-t border-zinc-800 p-4">
            {error && (
              <div className="mb-3 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mb-2 flex justify-start">
              <ImageAttachmentPicker
                files={attachments}
                onChange={(files) => {
                  setError(null);
                  setAttachments(files);
                }}
                maxCount={4}
                maxBytesPerFile={5 * 1024 * 1024}
                disabled={isSending}
                onConversionError={setError}
              />
            </div>
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything to see what Joe would say."
                className="min-h-[44px] flex-1 min-w-0 resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-base sm:text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              />

              <Button
                onClick={send}
                disabled={!canSend}
                variant="primary"
                size="md"
              >
                {isSending ? '…' : 'Send'}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
