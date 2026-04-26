// Atlas — channel-agnostic chapter orchestrator.
//
// Both /api/chat (browser /player) and /api/wa/webhook (Twilio Sandbox) call
// `runChapter()`. The function takes a normalized input + context, runs scoring +
// (eventually) a Claude turn, and returns reply messages + an updated state.
//
// Phase 1 morning wires the actual Claude call inside `claude.ts`. For now,
// `runChapter()` returns deterministic stub replies so the WA pipeline can be
// smoke-tested end to end without burning Anthropic tokens.

import { getCountry } from "@/lib/config/schema";
import { WAGES } from "@/lib/data/wages";
import { ISCO_TITLES } from "@/lib/data/seed-cards";

export const CHAPTER_IDS = [
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
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export interface PlayerContext {
  /** Pseudonymous handle: `wa:<sha256(phone+salt).slice(0,16)>` or `web:<runId>`. */
  handle: string;
  country: string; // GH / BD
  iscoSeed?: string;
  aiTierProvisional?: 0 | 1 | 2 | 3 | 4;
  companion?: string;
  scores: Record<string, number>;
  channel: "wa" | "web";
}

export interface ChapterInput {
  chapter: ChapterId;
  body: string; // raw user text (or "" for system-driven kickoffs)
  mediaUrl?: string;
}

export interface ChapterReply {
  /** Each entry is one outbound message. WA sender splits with 1100ms delay. */
  text: string;
  /** Optional structured payload that the /player React surface can render
   * (e.g. companion choices, Atlas Card reveal data). The WA sender ignores
   * payloads and serializes meaningful state to plain text. */
  payload?: Record<string, unknown>;
}

export interface ChapterResult {
  replies: ChapterReply[];
  /** The chapter to advance to next. If equal to the current chapter, the
   * orchestrator is awaiting another user turn (e.g. multi-step inventory). */
  nextChapter: ChapterId;
  ctx: PlayerContext;
  /** Set true when the chapter "card" was reached: WA layer should append
   * the squad invite + share-link. */
  finished?: boolean;
}

/** Public entrypoint. Channel-agnostic. */
export async function runChapter(
  input: ChapterInput,
  ctx: PlayerContext,
): Promise<ChapterResult> {
  switch (input.chapter) {
    case "country":
      return handleCountry(input, ctx);
    case "inventory":
      return handleInventory(input, ctx);
    case "companion":
      return handleCompanion(input, ctx);
    case "drillin":
      return handleDrillIn(input, ctx);
    case "origin":
      return handleOrigin(input, ctx);
    case "forge":
      return handleForge(input, ctx);
    case "mind":
      return handleMind(input, ctx);
    case "heart":
      return handleHeart(input, ctx);
    case "oracle":
      return handleOracle(input, ctx);
    case "future":
      return handleFuture(input, ctx);
    case "tribe":
      return handleTribe(input, ctx);
    case "card":
      return handleCard(input, ctx);
    default:
      return {
        replies: [{ text: "I lost the thread — reply RESTART to start over." }],
        nextChapter: "country",
        ctx,
      };
  }
}

// ---------------------------------------------------------------------------
// Chapter handlers (skeleton — real Claude scoring lands in Phase 1 morning)
// ---------------------------------------------------------------------------

function handleCountry(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const code = input.body.trim().toUpperCase().slice(0, 2);
  const known = ["GH", "BD"];
  if (!known.includes(code)) {
    return {
      replies: [
        {
          text: "Atlas is currently in Ghana 🇬🇭 and Bangladesh 🇧🇩 only — reply *GH* or *BD*.",
        },
      ],
      nextChapter: "country",
      ctx,
    };
  }
  const country = getCountry(code);
  const next: PlayerContext = { ...ctx, country: code };
  return {
    replies: [
      {
        text: `${country.flag} ${country.name}. Got it.\n\nQuick check — which of these are part of your daily life? Reply with the numbers, comma-separated.\n\n1. Phone repair / electronics\n2. Tailoring / hand crafts\n3. Coding / software\n4. Selling / shopkeeping\n5. None of these — type your own`,
      },
    ],
    nextChapter: "inventory",
    ctx: next,
  };
}

function handleInventory(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const picks = input.body
    .split(/[, ]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const ISCO_BY_SLOT: Record<string, string> = {
    "1": "7421",
    "2": "7531",
    "3": "2519",
    "4": "5223",
  };
  const isco = picks.map((p) => ISCO_BY_SLOT[p]).find(Boolean) ?? "7421";
  const next: PlayerContext = { ...ctx, iscoSeed: isco };
  return {
    replies: [
      {
        text:
          "🎮 Pick your companion — this is your first AI capability check.\n\n" +
          "1. 🦉 *Owl* — careful, plans first\n" +
          "2. 🦊 *Fox* — quick, tries things, learns by doing\n" +
          "3. 🐢 *Turtle* — steady, finishes everything\n" +
          "4. 🦅 *Eagle* — sees the whole map, jumps far\n\n" +
          "Reply 1-4.",
      },
    ],
    nextChapter: "companion",
    ctx: next,
  };
}

function handleCompanion(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const map: Record<string, string> = { "1": "Owl", "2": "Fox", "3": "Turtle", "4": "Eagle" };
  const choice = input.body.trim().charAt(0);
  const companion = map[choice] ?? "Fox";
  const next: PlayerContext = { ...ctx, companion };
  return {
    replies: [
      {
        text: `${companion}. Solid pick.\n\nQuick one before we start — *what's the last new tool or app you tried this month?* (one line is fine)`,
      },
    ],
    nextChapter: "drillin",
    ctx: next,
  };
}

function handleDrillIn(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const tier = guessAITier(input.body);
  const next: PlayerContext = { ...ctx, aiTierProvisional: tier };
  return {
    replies: [
      {
        text:
          "💎 *Chapter 1 — The Origin*\n\n" +
          "Tell me about something you spent more than 2 hours on yesterday. Anything — work, family, building, fixing, learning. Just talk.",
      },
    ],
    nextChapter: "origin",
    ctx: next,
  };
}

function handleOrigin(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  // Phase 1 morning: call claude.classifyOccupation(input.body) -> ISCO.
  // For now, keep the seed and advance.
  const scores = { ...ctx.scores, origin: scoreLength(input.body) };
  const next: PlayerContext = { ...ctx, scores };
  const country = getCountry(ctx.country);
  return {
    replies: [
      {
        text: `Got it — sounds like ${country.sampleCity} work. We'll lock the occupation code at the end.\n\n🏆 *Chapter 2 — The Forge*\n\nTell me about the hardest job you've ever pulled off in your line of work. What was at stake, what did you do, what worked?`,
      },
    ],
    nextChapter: "forge",
    ctx: next,
  };
}

function handleForge(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const scores = { ...ctx.scores, forge: scoreLength(input.body) };
  return {
    replies: [
      {
        text:
          "🧠 *Chapter 3 — The Mind*\n\nQuick numeracy check. A customer wants a fix. The part costs 30, you want 50 profit, work takes 25 minutes.\n\n*What do you charge, and what's your effective hourly rate?*",
      },
    ],
    nextChapter: "mind",
    ctx: { ...ctx, scores },
  };
}

function handleMind(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const numbers = input.body.match(/\d+/g) ?? [];
  const charge = Number(numbers[0] ?? 0);
  const score = charge >= 70 && charge <= 100 ? 1 : 0.4;
  const scores = { ...ctx.scores, mind: score };
  return {
    replies: [
      {
        text:
          "❤️ *Chapter 4 — The Storm*\n\n🎲 You rolled *The Wrong Customer*.\n\nTell me about a time someone was angry, upset, or wrong with you — and how you handled it.",
      },
    ],
    nextChapter: "heart",
    ctx: { ...ctx, scores },
  };
}

function handleHeart(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const scores = { ...ctx.scores, heart: scoreLength(input.body) };
  return {
    replies: [
      {
        text:
          "🐉 *Chapter 5 — The Oracle (boss fight)*\n\nThree phases. Phase 1 — *Intel*: in one line, what's the single most important fact someone needs to know to do your job well?",
      },
    ],
    nextChapter: "oracle",
    ctx: { ...ctx, scores },
  };
}

function handleOracle(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  // Phase 1 morning: 3-phase Boss Fight scoring (Intel + Loadout + Duel).
  // Skeleton compresses to one turn for WA brevity.
  const scores = { ...ctx.scores, oracle: scoreLength(input.body) };
  return {
    replies: [
      {
        text:
          "🌟 *Chapter 6 — The Future*\n\nThree doors. Pick one and tell me one skill you'd need that you don't have yet.\n\n🚪 1 — Same work, but bigger\n🚪 2 — Different but related\n🚪 3 — Something completely new",
      },
    ],
    nextChapter: "future",
    ctx: { ...ctx, scores },
  };
}

function handleFuture(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const scores = { ...ctx.scores, future: scoreLength(input.body) };
  return {
    replies: [
      {
        text:
          "🤝 *Chapter 7 — The Tribe*\n\nLast gem. Pick one person who's seen you work — forward them this card, ask them to reply *one* sentence about you.\n\nWhen you've sent it, reply *DONE*.",
      },
    ],
    nextChapter: "tribe",
    ctx: { ...ctx, scores },
  };
}

function handleTribe(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const scores = { ...ctx.scores, tribe: input.body.toUpperCase().includes("DONE") ? 1 : 0.5 };
  return {
    replies: [{ text: "Locking your Atlas Card…" }],
    nextChapter: "card",
    ctx: { ...ctx, scores },
  };
}

function handleCard(_input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const isco = ctx.iscoSeed ?? "7421";
  const tier = ctx.aiTierProvisional ?? 1;
  const wage = WAGES[ctx.country]?.[isco];
  const title = ISCO_TITLES[isco] ?? "Worker";
  const formal = wage ? `${wage.currency}${wage.formalMedian.toLocaleString()}` : "—";
  return {
    replies: [
      { text: `💰 *Verdict*: median formal wage for ${title} in your country: ${formal}/mo.` },
      { text: `🎭 *Class*: ${classFor(isco)}` },
      { text: `🤖 *AI Tier*: T${tier}` },
      // Squad reveal text is appended by the WA layer using `squad.ts`.
    ],
    nextChapter: "card",
    ctx,
    finished: true,
  };
}

// ---------------------------------------------------------------------------
// Heuristic placeholders — replaced by Claude calls in Phase 1 morning.
// ---------------------------------------------------------------------------

function guessAITier(body: string): 0 | 1 | 2 | 3 | 4 {
  const t = body.toLowerCase();
  if (/\b(api|fine[- ]?tune|claude|gpt|cursor|agent|n8n|workflow)\b/.test(t)) return 3;
  if (/\b(chatgpt|copilot|gemini|whatsapp ai|midjourney|stable diffusion)\b/.test(t)) return 2;
  if (/\b(youtube|tutorial|google|tiktok|whatsapp|telegram)\b/.test(t)) return 1;
  if (!t.trim()) return 0;
  return 1;
}

function scoreLength(body: string): number {
  const words = body.trim().split(/\s+/).length;
  if (words >= 60) return 1;
  if (words >= 25) return 0.7;
  if (words >= 8) return 0.4;
  return 0.2;
}

function classFor(isco: string): string {
  const map: Record<string, string> = {
    "1": "🧠 Solver",
    "2": "💻 Builder",
    "3": "🎨 Storyteller",
    "4": "🧠 Solver",
    "5": "🤝 Dealmaker",
    "6": "🌾 Grower",
    "7": "🔧 Artisan",
    "8": "🔧 Artisan",
    "9": "⚡ Hustler",
  };
  return map[isco.charAt(0)] ?? "⚡ Hustler";
}
