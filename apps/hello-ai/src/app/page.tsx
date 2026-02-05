"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const STORAGE_KEY = "chat_messages_v1";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  // Refs for UX
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Msg[] = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      // ignore parse errors
    }
    // autofocus input on mount
    inputRef.current?.focus();
  }, []);

  // Persist messages whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore write errors (e.g., private mode)
    }
    // Scroll to bottom when new messages arrive
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Msg = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();
      const assistant: Msg = {
        role: "assistant",
        text: data.text ?? "(no response)",
      };
      setMessages((m) => [...m, assistant]);
    } finally {
      setLoading(false);
    }
  }

  function onClear() {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    inputRef.current?.focus();
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Hello AI 👋</h1>

      <div className="w-full max-w-md bg-white shadow rounded-lg p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </p>
          <button
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
            title="Clear conversation"
          >
            Clear
          </button>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto border rounded p-2 bg-gray-100 h-64 space-y-2"
        >
          {messages.length === 0 && (
            <p className="text-gray-500 italic">
              Say something to get started…
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span
                className={`inline-block rounded-2xl px-3 py-2 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {m.text}
              </span>
            </div>
          ))}
          {loading && <p className="text-sm text-gray-500">Thinking…</p>}
        </div>

        <form className="flex gap-2" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}