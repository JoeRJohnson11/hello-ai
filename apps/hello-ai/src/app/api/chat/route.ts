"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
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
      text: "Hey — I’m Joe-bot. What are you trying to ship?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const canSend = useMemo(() => !isSending && input.trim().length > 0, [isSending, input]);

  async function send() {
    const msg = input.trim();
    if (!msg || isSending) return;

    setError(null);
    setIsSending(true);
    setInput("");

    const userMsg: ChatMsg = { id: uid(), role: "user", ts: Date.now(), text: msg };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const payload = (await res.json().catch(() => ({}))) as { text?: string; error?: string };

      if (!res.ok) {
        throw new Error(payload?.error || `Request failed (${res.status})`);
      }

      const text = (payload?.text ?? "").trim();
      const assistantMsg: ChatMsg = {
        id: uid(),
        role: "assistant",
        ts: Date.now(),
        text: text || "…(no response)",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          ts: Date.now(),
          text: "⚠️ I hit an issue. Try again, or tell me what you were attempting and I’ll suggest a different approach.",
        },
      ]);
    } finally {
      setIsSending(false);
      // bring focus back for fast iteration
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

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">hello-ai</div>
            <h1 className="text-2xl font-semibold tracking-tight">Joe-bot</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Pragmatic answers. Concrete steps. Minimal fluff.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearChat}
              className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-700"
              title="Clear conversation"
            >
              Clear
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Local
            </span>
          </div>
        </header>

        <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50 shadow-sm">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] whitespace-pre-wrap rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-900 shadow"
                        : "max-w-[85%] whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm leading-relaxed text-zinc-100"
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
                    Joe-bot is thinking<span className="animate-pulse">…</span>
                  </div>
                </div>
              )}

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
                placeholder="Ask Joe-bot… (Enter to send, Shift+Enter for newline)"
                className="min-h-[44px] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              />

              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="rounded-xl bg-zinc-100 px-4 text-sm font-medium text-zinc-900 shadow disabled:opacity-40"
              >
                {isSending ? "…" : "Send"}
              </button>
            </div>

            <div className="mt-2 text-xs text-zinc-500">
              Tip: Ask for a plan, a quick draft, or a brutally practical tradeoff.
            </div>
          </div>
        </section>

        <footer className="mt-4 text-xs text-zinc-600">
          This is a learning project. Don’t paste secrets.
        </footer>
      </div>
    </main>
  );
}