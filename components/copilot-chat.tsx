"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { ChatMessage, IncidentAnalysis } from "@/lib/types";
import { answerLocally, newMessage } from "@/lib/copilot-responder";

const SUGGESTIONS = [
  "Why is this rated at this severity?",
  "What should I do first?",
  "Could this be a false positive?",
  "Summarize this for my manager"
];

async function askCopilot(question: string, analysis: IncidentAnalysis, history: ChatMessage[]): Promise<{ content: string; source: "claude" | "engine" }> {
  try {
    const res = await fetch("/api/copilot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question,
        analysis,
        history: history.slice(-6).map((m) => ({ role: m.role, content: m.content }))
      })
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { answer?: string };
    if (!data.answer) throw new Error("empty answer");
    return { content: data.answer, source: "claude" };
  } catch {
    await new Promise((r) => setTimeout(r, 450));
    return { content: answerLocally(question, analysis), source: "engine" };
  }
}

export function CopilotChat({ analysis }: { analysis: IncidentAnalysis }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      newMessage(
        "assistant",
        `I'm scoped to this incident (${analysis.id}). Ask me why it's rated the way it is, what to do next, or whether it could be a false positive.`,
        "engine"
      )
    ]);
  }, [analysis.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    const userMsg = newMessage("user", trimmed);
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setBusy(true);
    const { content, source } = await askCopilot(trimmed, analysis, history);
    setMessages((prev) => [...prev, newMessage("assistant", content, source)]);
    setBusy(false);
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-card shadow-card">
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-muted">AI Copilot</h2>
          <p className="text-[10px] text-ink-faint">Ask questions about this incident</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={clsx("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}>
            <div
              className={clsx(
                "max-w-[92%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                m.role === "user" ? "bg-accent text-void" : "border border-line bg-surface text-ink-muted"
              )}
            >
              {m.content}
            </div>
            {m.role === "assistant" && m.source && (
              <span className="px-1 font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                {m.source === "claude" ? "⚡ Claude" : "🧠 Engine reasoning"}
              </span>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-1.5 px-1 font-mono text-[10px] text-ink-faint">
            <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <div className="border-t border-line p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-full border border-line px-2.5 py-1 text-[10px] text-ink-faint transition hover:border-accent/40 hover:text-accent disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this incident…"
            className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-void transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
