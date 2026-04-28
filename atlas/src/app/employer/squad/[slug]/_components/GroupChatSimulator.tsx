"use client";

// Atlas — phone-mockup chat simulator.
//
// Plays a scripted message exchange so judges + the demo video see the moment
// the squad room "comes alive" after an employer posts a project.
//
// Phone-frame design (no WhatsApp branding) so the same simulator can sit
// next to /player's phone screen and read as one consistent product surface.

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

const PALETTE = ["#5eead4", "#fda4af", "#c4b5fd", "#86efac", "#fcd34d", "#7dd3fc"];

function buildScript(project: ProjectInfo, candidates: Candidate[]): Message[] {
  const headcount = 3;
  const employerColor = "#10b981";
  const palette = candidates.map((_, i) => PALETTE[i % PALETTE.length]);
  const messages: Message[] = [];
  let id = 0;

  messages.push({
    id: id++,
    fromHandle: "Atlas",
    fromColor: "#3b82f6",
    text: `🌍 Squad room opened — ${project.title}\nMatched: ${candidates.length} verified ${project.iscoTitle.toLowerCase()}s near ${project.ward}.`,
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
      text: `Available too. 5 min walk from ${project.ward}.`,
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
    messages.push({
      id: id++,
      fromHandle: project.employerHandle,
      fromColor: employerColor,
      text: `Locked: ${candidates[0].handle.slice(0, 14)} + ${candidates[1].handle.slice(0, 14)}. See you ${project.dayNeeded}, 7am at the shop. 🤝`,
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
  const [now, setNow] = useState<string>("12:34");

  useEffect(() => {
    // Hydration-safe: SSR renders the "12:34" placeholder, client swaps to real time post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

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
    <div className="min-h-screen bg-zinc-100 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/employer"
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
          >
            ← Back to dashboard
          </Link>
          <div className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
            Demo · scripted exchange
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[420px_1fr]">
          {/* Phone mock */}
          <div className="mx-auto flex w-full justify-center md:mx-0">
            <PhoneFrame statusTime={now} title={`Atlas Squad · ${project.ward}`} subtitle={`${totalMembers} members`}>
              <div className="space-y-2 px-3 py-3">
                {visible.map((m) => (
                  <Bubble key={m.id} msg={m} />
                ))}
                {typing && (
                  <TypingIndicator handle={typing.fromHandle} color={typing.fromColor} isEmployer={!!typing.isEmployer} />
                )}
              </div>
            </PhoneFrame>
          </div>

          {/* Right side: context + replay */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
              <div className="text-[11px] uppercase tracking-widest text-[#006EB5]">Squad room</div>
              <h1 className="mt-1 text-xl font-semibold text-[#002244] dark:text-zinc-50">{project.title}</h1>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <DT>Skill</DT>
                <DD>{project.iscoTitle}</DD>
                <DT>Ward</DT>
                <DD>{project.ward}</DD>
                <DT>Day needed</DT>
                <DD>{project.dayNeeded}</DD>
                <DT>Matched</DT>
                <DD>{candidates.length} verified candidates</DD>
              </dl>
              {project.notes && (
                <div className="mt-3 rounded-md bg-zinc-50 p-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  📝 {project.notes}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <strong>Why a simulation?</strong>
              <p className="mt-1 leading-snug">
                Multi-party group rooms can&apos;t be created programmatically from the Twilio Sandbox (Meta restriction).
                This screen replays a typical 6-message exchange so you can see how the wedge plays out for an LMIC
                employer. Production roadmap: Meta WA Business API + Twilio Conversations.
              </p>
            </div>

            {done && (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="text-2xl">🤝</div>
                <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  Squad locked in &lt; 6 minutes
                </div>
                <div className="text-xs text-emerald-900/80 dark:text-emerald-200/80">
                  No résumés, no calls, no app install. Same chat the worker already uses every day.
                </div>
                <button
                  onClick={replay}
                  className="mt-1 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100 dark:bg-zinc-900 dark:text-emerald-200"
                >
                  ↻ Replay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Phone mock primitives ---------------------------------------------------

function PhoneFrame({
  statusTime,
  title,
  subtitle,
  children,
}: {
  statusTime: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full max-w-[380px] rounded-[2.5rem] border border-zinc-300 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-black">
      <div className="overflow-hidden rounded-[2rem] bg-[#0b141a]">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-black px-5 pb-1 pt-2 text-[11px] font-medium text-zinc-300">
          <span>{statusTime} · 5G</span>
          <span className="text-zinc-500">Atlas · chat</span>
        </div>
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-[#111b21] px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-base">🌍</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-zinc-100">{title}</div>
            <div className="truncate text-[10px] text-zinc-400">{subtitle}</div>
          </div>
          <div className="text-zinc-500">⋮</div>
        </div>
        {/* Body — scrollable area, fixed height for a phone-like feel */}
        <div className="h-[520px] overflow-y-auto bg-[#0b141a]">{children}</div>
        {/* Composer */}
        <div className="flex items-center gap-2 border-t border-white/5 bg-[#111b21] px-2 py-2">
          <div className="flex-1 rounded-full bg-[#202c33] px-3 py-1.5 text-[12px] text-zinc-500">Message…</div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white" aria-label="Send">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Message }) {
  const align = msg.isEmployer ? "items-end" : "items-start";
  const bubbleClass = msg.isEmployer ? "bg-emerald-700/90 text-white" : "bg-[#202c33] text-zinc-100";
  return (
    <div className={`flex flex-col ${align}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] shadow-sm ${bubbleClass} animate-[fadeIn_0.3s_ease-in]`}
      >
        {!msg.isEmployer && (
          <div className="mb-0.5 text-[10px] font-semibold" style={{ color: msg.fromColor }}>
            {msg.fromHandle}
          </div>
        )}
        <div className="whitespace-pre-wrap leading-snug">{msg.text}</div>
        <div className="mt-1 text-right text-[9px] text-zinc-300/70">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {msg.isEmployer && " ✓✓"}
        </div>
      </div>
      {msg.reactions && msg.reactions.length > 0 && (
        <div className="-mt-1 ml-2 flex gap-0.5 rounded-full bg-[#202c33] px-1.5 py-0.5 text-[11px] shadow-sm">
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
  const bubbleClass = isEmployer ? "bg-emerald-700/70" : "bg-[#202c33]";
  return (
    <div className={`flex flex-col ${align}`}>
      <div className={`max-w-[60%] rounded-2xl px-3 py-2 shadow-sm ${bubbleClass}`}>
        {!isEmployer && (
          <div className="mb-0.5 text-[10px] font-semibold" style={{ color }}>
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

function DT({ children }: { children: React.ReactNode }) {
  return <dt className="text-[11px] uppercase tracking-wider text-zinc-500">{children}</dt>;
}
function DD({ children }: { children: React.ReactNode }) {
  return <dd className="text-zinc-800 dark:text-zinc-200">{children}</dd>;
}
