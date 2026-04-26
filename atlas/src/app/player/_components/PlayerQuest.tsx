"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ChapterId, PlayerContext } from "@/lib/orchestrator";

interface ChatMsg {
  id: string;
  role: "bot" | "user";
  text: string;
  ts: number;
}

interface ServerReply {
  ctx: PlayerContext;
  chapter: ChapterId;
  replies: { text: string }[];
  finished: boolean;
}

const STORAGE_KEY = "atlas:player:state-v1";
const sid = () => Math.random().toString(36).slice(2, 10);

function freshCtx(country: string): PlayerContext {
  return {
    handle: `web:${sid()}${sid()}`,
    country,
    scores: {},
    channel: "web",
  };
}

export function PlayerQuest() {
  const search = useSearchParams();
  const initialCountry = (search.get("country") ?? "GH").toUpperCase();

  const [ctx, setCtx] = useState<PlayerContext>(() => freshCtx(initialCountry));
  const [chapter, setChapter] = useState<ChapterId>("country");
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const initRef = useRef(false);

  // Restore from localStorage on mount.
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          ctx: PlayerContext;
          chapter: ChapterId;
          history: ChatMsg[];
          finished: boolean;
        };
        if (parsed.ctx?.country === initialCountry) {
          setCtx(parsed.ctx);
          setChapter(parsed.chapter);
          setHistory(parsed.history);
          setFinished(parsed.finished);
          return;
        }
      }
    } catch {
      /* ignore parse errors */
    }
    // Fresh start: kick the bot off with an empty body to get the welcome.
    void send("", { ctx: freshCtx(initialCountry), chapter: "country" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCountry]);

  // Persist on every change.
  useEffect(() => {
    if (!initRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ctx, chapter, history, finished }));
    } catch {
      /* storage full / disabled */
    }
  }, [ctx, chapter, history, finished]);

  // Auto-scroll on new message.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [history, loading]);

  const send = useCallback(
    async (text: string, override?: { ctx: PlayerContext; chapter: ChapterId }) => {
      const useCtx = override?.ctx ?? ctx;
      const useChapter = override?.chapter ?? chapter;
      if (text) {
        setHistory((h) => [...h, { id: sid(), role: "user", text, ts: Date.now() }]);
      }
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ctx: useCtx, chapter: useChapter, body: text }),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`chat failed: ${res.status} ${err}`);
        }
        const data: ServerReply = await res.json();
        setCtx(data.ctx);
        setChapter(data.chapter);
        setFinished(data.finished);
        for (let i = 0; i < data.replies.length; i++) {
          const r = data.replies[i];
          await new Promise((res) => setTimeout(res, i === 0 ? 200 : 700));
          setHistory((h) => [...h, { id: sid(), role: "bot", text: r.text, ts: Date.now() }]);
        }
      } catch (err) {
        setHistory((h) => [
          ...h,
          {
            id: sid(),
            role: "bot",
            text: `⚠️ Atlas hit a snag: ${err instanceof Error ? err.message : String(err)}. Refresh to retry.`,
            ts: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [ctx, chapter],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v || loading) return;
    setInput("");
    void send(v);
  };

  const restart = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const fresh = freshCtx(initialCountry);
    setCtx(fresh);
    setChapter("country");
    setHistory([]);
    setFinished(false);
    void send("", { ctx: fresh, chapter: "country" });
  };

  const progress = chapterProgress(chapter);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-2 text-xs text-zinc-500 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Sage
          <span className="text-zinc-400">· step {progress}/8</span>
        </div>
        <button onClick={restart} className="rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-white/5">
          🔄 Restart
        </button>
      </div>
      <div ref={scrollerRef} className="flex h-[60vh] flex-col gap-2 overflow-y-auto bg-[#0b141a] p-4 text-sm">
        {history.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.text} />
        ))}
        {loading && <Bubble role="bot" text="…" typing />}
      </div>
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-zinc-100 bg-white p-2 dark:border-white/5 dark:bg-zinc-900"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            finished
              ? "Quest complete. Restart to play again."
              : chapter === "country"
                ? "Type GH or BD…"
                : "Type your reply…"
          }
          disabled={loading || finished}
          className="flex-1 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none disabled:opacity-60 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={loading || finished || !input.trim()}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, text, typing }: { role: "bot" | "user"; text: string; typing?: boolean }) {
  if (role === "user") {
    return (
      <div className="ml-auto max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-[#005c4b] px-3 py-2 text-zinc-50">
        {text}
      </div>
    );
  }
  return (
    <div className="mr-auto max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-[#202c33] px-3 py-2 text-zinc-100">
      {typing ? (
        <span className="inline-flex gap-1">
          <Dot /> <Dot delay={150} /> <Dot delay={300} />
        </span>
      ) : (
        text
      )}
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function chapterProgress(c: ChapterId): number {
  const order: ChapterId[] = [
    "country",
    "inventory",
    "companion",
    "drillin",
    "origin",
    "forge",
    "mind",
    "heart",
    "oracle",
    "future",
    "tribe",
    "card",
  ];
  const i = order.indexOf(c);
  if (i < 0) return 1;
  // Compress 12 chapters to 1-8 display
  return Math.min(8, Math.max(1, Math.ceil((i + 1) * (8 / 12))));
}
