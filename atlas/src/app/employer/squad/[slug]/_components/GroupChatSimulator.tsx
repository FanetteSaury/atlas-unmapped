"use client";

// Atlas — animated WhatsApp group chat simulator.
//
// Plays a scripted message exchange to show what happens after an employer
// posts a project: matched candidates land in the group, employer asks
// "who's free Friday?", workers reply, deal closes.
//
// Demo-grade. Real production = Twilio Conversations API + Meta WA Business.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface ProjectInfo {
  slug: string;
  title: string;
  ward: string;
  dayNeeded: string;
  iscoTitle: string;
  employerHandle: string;
  notes?: string;
}

interface Candidate {
  handle: string;
  ward: string;
  aiTier: 0 | 1 | 2 | 3 | 4;
}

interface Props {
  project: ProjectInfo;
  candidates: Candidate[];
}

interface Message {
  id: number;
  fromHandle: string;
  fromColor: string;
  text: string;
  delayMs: number;
  isEmployer?: boolean;
  reactions?: string[];
}

const PALETTE = ["#1f7a8c", "#a23b72", "#7d5fff", "#16a34a", "#d97706", "#0ea5e9"];

function buildScript(project: ProjectInfo, candidates: Candidate[]): Message[] {
  const headcount = 3;
  const employerColor = "#075e54";
  const palette = candidates.map((_, i) => PALETTE[i % PALETTE.length]);
  const messages: Message[] = [];
  let id = 0;

  messages.push({
    id: id++,
    fromHandle: "Atlas",
    fromColor: "#3b82f6",
    text: `🌍 *Atlas Squad room* — ${project.title}\nMatched: ${candidates.length} verified ${project.iscoTitle.toLowerCase()}s near ${project.ward}.`,
    delayMs: 600,
  });

  messages.push({
    id: id++,
    fromHandle: project.employerHandle,
    fromColor: employerColor,
    text: `Hi everyone 👋 — ${headcount} ${project.iscoTitle.toLowerCase()}s needed for ${project.dayNeeded}, in ${project.ward}.${project.notes ? `\n${project.notes}` : ""}`,
    delayMs: 2400,
    isEmployer: true,
  });

  if (candidates[0]) {
    messages.push({
      id: id++,
      fromHandle: candidates[0].handle,
      fromColor: palette[0],
      text: `I'm in for ${project.dayNeeded} ✅`,
      delayMs: 2200,
    });
  }
  if (candidates[1]) {
    messages.push({
      id: id++,
      fromHandle: candidates[1].handle,
      fromColor: palette[1],
      text: `Available too. I'm 5 min walk from ${project.ward}.`,
      delayMs: 1900,
    });
  }
  if (candidates[2]) {
    messages.push({
      id: id++,
      fromHandle: candidates[2].handle,
      fromColor: palette[2],
      text: `Confirming by 18h, very likely yes.`,
      delayMs: 2300,
    });
  }
  if (candidates[3]) {
    messages.push({
      id: id++,
      fromHandle: candidates[3].handle,
      fromColor: palette[3],
      text: `Booked already, sorry — next time 🙏`,
      delayMs: 2600,
    });
  }

  if (candidates.length >= 2) {
    const pickedNames = candidates.slice(0, 2).map((c) => c.handle.split("-")[0] + c.handle.split("-")[1]).join(" + ");
    messages.push({
      id: id++,
      fromHandle: project.employerHandle,
      fromColor: employerColor,
      text: `Locked: ${candidates[0].handle.slice(0, 12)} + ${candidates[1].handle.slice(0, 12)}. See you ${project.dayNeeded}, 7am at the shop. 🤝`,
      delayMs: 3100,
      isEmployer: true,
      reactions: ["👍", "🙌"],
    });
  }

  return messages;
}

export function GroupChatSimulator({ project, candidates }: Props) {
  const script = useMemo(() => buildScript(project, candidates), [project, candidates]);
  const [visible, setVisible] = useState<Message[]>([]);
  const [typing, setTyping] = useState<Message | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cumulative = 400;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    script.forEach((m) => {
      cumulative += m.delayMs;
      timeouts.push(
        setTimeout(() => {
          if (cancelled) return;
          setTyping(m);
        }, cumulative - 900),
      );
      timeouts.push(
        setTimeout(() => {
          if (cancelled) return;
          setVisible((v) => [...v, m]);
          setTyping(null);
        }, cumulative),
      );
    });

    timeouts.push(
      setTimeout(() => {
        if (!cancelled) setDone(true);
      }, cumulative + 500),
    );

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [script]);

  function replay() {
    setVisible([]);
    setTyping(null);
    setDone(false);
  }

  const totalMembers = candidates.length + 1;

  return (
    <div className="min-h-screen bg-[#e5ddd5] dark:bg-[#0b141a]">
      {/* WA-style header */}
      <header className="sticky top-0 z-30 border-b border-[#075e54]/30 bg-[#075e54] text-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link href="/employer" className="text-white/80 hover:text-white" aria-label="Back">
            ←
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg">🌍</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Atlas Squad · {project.title}</div>
            <div className="truncate text-[11px] text-white/70">
              {totalMembers} members · {project.iscoTitle} · {project.ward}
            </div>
          </div>
          <div className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            Demo
          </div>
        </div>
      </header>

      {/* Banner: this is a simulation */}
      <div className="border-b border-amber-300/60 bg-amber-50 px-4 py-2 text-[11px] text-amber-900">
        🎬 <strong>Simulation</strong> — real WA group creation requires the Meta WhatsApp Business API (post-hackathon
        roadmap). Twilio Sandbox can&apos;t programmatically create multi-party rooms. This page replays a typical
        exchange so you can see how the wedge plays out for a judge or an LMIC employer.
      </div>

      {/* Chat body */}
      <main className="mx-auto max-w-2xl px-3 py-4">
        <div className="mx-auto mb-4 inline-block rounded-md bg-yellow-100 px-2 py-1 text-[11px] text-zinc-700 shadow-sm">
          🔒 Messages and calls are end-to-end encrypted (simulated).
        </div>

        <div className="space-y-2">
          {visible.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          {typing && <TypingIndicator handle={typing.fromHandle} color={typing.fromColor} isEmployer={!!typing.isEmployer} />}
        </div>

        {done && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-center">
            <div className="text-2xl">🤝</div>
            <div className="text-sm font-semibold text-zinc-800">Squad locked in &lt; 6 minutes</div>
            <div className="max-w-md text-xs text-zinc-500">
              No résumés, no calls, no app install. Same WhatsApp the worker already uses every day. This is how the
              labour market actually clears in {project.ward}.
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={replay}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
              >
                ↻ Replay
              </button>
              <Link
                href="/employer"
                className="rounded-md bg-[#075e54] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#054d44]"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Bubble({ msg }: { msg: Message }) {
  const align = msg.isEmployer ? "items-end" : "items-start";
  const bubbleClass = msg.isEmployer
    ? "bg-[#dcf8c6] dark:bg-[#005c4b] dark:text-white"
    : "bg-white dark:bg-[#202c33] dark:text-white";
  return (
    <div className={`flex flex-col ${align}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm ${bubbleClass} animate-[fadeIn_0.3s_ease-in]`}
      >
        {!msg.isEmployer && (
          <div className="mb-0.5 text-[11px] font-semibold" style={{ color: msg.fromColor }}>
            {msg.fromHandle}
          </div>
        )}
        <div className="whitespace-pre-wrap leading-snug">{msg.text}</div>
        <div className="mt-1 text-right text-[10px] text-zinc-400">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {msg.isEmployer && " ✓✓"}
        </div>
      </div>
      {msg.reactions && msg.reactions.length > 0 && (
        <div className="-mt-1 ml-2 flex gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[11px] shadow-sm dark:bg-[#202c33]">
          {msg.reactions.map((r, i) => (
            <span key={i}>{r}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingIndicator({ handle, color, isEmployer }: { handle: string; color: string; isEmployer: boolean }) {
  const align = isEmployer ? "items-end" : "items-start";
  const bubbleClass = isEmployer ? "bg-[#dcf8c6]" : "bg-white";
  return (
    <div className={`flex flex-col ${align}`}>
      <div className={`max-w-[60%] rounded-lg px-3 py-2 shadow-sm ${bubbleClass}`}>
        {!isEmployer && (
          <div className="mb-0.5 text-[11px] font-semibold" style={{ color }}>
            {handle}
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
