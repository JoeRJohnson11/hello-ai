"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button, Loader, tokens } from "@hello-ai/shared";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string | React.ReactNode;
  ts: number;
  kind?: "normal" | "thinking" | "away" | "error";
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    {
      id: uid(),
      role: "assistant",
      ts: Date.now(),
      text: (
        <>
          Joe&apos;s <em>bot</em> here right now. Can I help?
        </>
      ),
      kind: "away",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, isSending]);

  const canSend = useMemo(
    () => !isSending && input.trim().length > 0,
    [isSending, input]
  );

  async function send() {
    const msg = input.trim();
    if (!msg || isSending) return;

    setError(null);
    setIsSending(true);
    setInput("");

    const userMsg: ChatMsg = {
      id: uid(),
      role: "user",
      ts: Date.now(),
      text: msg,
    };

    const pendingId = uid();
    const pendingMsg: ChatMsg = {
      id: pendingId,
      role: "assistant",
      ts: Date.now(),
      text: "Thinking like Joe-bot…",
      kind: "thinking",
    };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        text?: string;
        error?: string;
      };

      if (!res.ok)
        throw new Error(payload?.error || `Request failed (${res.status})`);

      const text = (payload?.text ?? "").trim();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, kind: "normal", text: text || "…(no response)" }
            : m
        )
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? {
                ...m,
                kind: "error",
                text: "⚠️ I hit an issue calling /api/chat. Check the server logs.",
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }

  function clearChat() {
    setError(null);
    setInput("");
    setIsSending(false);
    setMessages([
      {
        id: uid(),
        role: "assistant",
        ts: Date.now(),
        text: "Fresh slate. What are you trying to ship?",
      },
    ]);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  return isLoading ? (
    <main
      className="flex min-h-[100dvh] items-center justify-center bg-zinc-950 text-zinc-100"
      style={{ borderRadius: tokens.radius.md }}
    >
      <div className="flex flex-col items-center gap-4">
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
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              HELLO-AI / test project
            </div>
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

          <div className="flex items-center gap-2">
            <Button
              onClick={clearChat}
              variant="secondary"
              size="sm"
              title="Clear conversation"
            >
              Clear
            </Button>
          </div>
        </header>

        <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50 shadow-sm">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] whitespace-pre-wrap rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-900 shadow"
                        : "max-w-[85%] whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm leading-relaxed text-zinc-100"
                    }
                  >
                    {m.kind === "thinking" ? (
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
                          label={typeof m.text === "string" ? m.text : "Thinking like Joe-bot…"}
                        />
                      </div>
                    ) : (
                      <>
                        {m.kind === "away" && (
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

            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything to see what Joe would say."
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-base sm:text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              />

              <Button onClick={send} disabled={!canSend} variant="primary" size="md">
                {isSending ? "…" : "Send"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}