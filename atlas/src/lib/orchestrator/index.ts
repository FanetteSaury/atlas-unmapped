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
import { WAGES, AUTOMATION_RISK } from "@/lib/data/wages";
import { ISCO_TITLES } from "@/lib/data/seed-cards";
import { saveCard, generateSlug, type StoredCard } from "@/lib/storage/cards";
import { callSage } from "./claude";

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
  scores: Record<string, number | string>;
  channel: "wa" | "web";
  /** Lives left (3-heart mechanic). Lose 1 on dodge / non-substantive answers. */
  lives?: number;
  /** Gems collected (1 per substantive chapter completion). */
  gems?: number;
  /** Last chapter the player gave a substantive answer to (for story echo). */
  lastEcho?: string;
}

const STARTING_LIVES = 3;

/** Inputs that count as "dodge" — too short or filler. Lose a life. */
const DODGE_RE = /^(ok|okay|yes|no|yeah|nope|sure|skip|next|fine|good|whatever)\.?$/i;

function isDodge(body: string, minLen = 12): boolean {
  const t = body.trim();
  if (!t) return true;
  if (DODGE_RE.test(t)) return true;
  if (t.length < minLen) return true;
  return false;
}

/** Render the live game rail (hearts + gems) appended to the bot's first reply. */
function rail(ctx: PlayerContext): string {
  const lives = ctx.lives ?? STARTING_LIVES;
  const gems = ctx.gems ?? 0;
  const hearts = "❤️".repeat(Math.max(0, lives)) + "🖤".repeat(Math.max(0, STARTING_LIVES - lives));
  const gemRow = "💎".repeat(gems);
  return `${hearts}${gemRow ? "  " + gemRow : ""}`;
}

/** Award a gem + return a short "echo" reaction for use in the next chapter intro. */
function awardGem(ctx: PlayerContext, echo: string): PlayerContext {
  return { ...ctx, gems: (ctx.gems ?? 0) + 1, lastEcho: echo };
}

/** Lose a life. Returns updated ctx + a soft re-prompt message. */
function loseLife(ctx: PlayerContext): { ctx: PlayerContext; lostAll: boolean } {
  const next = (ctx.lives ?? STARTING_LIVES) - 1;
  return { ctx: { ...ctx, lives: next }, lostAll: next <= 0 };
}

/** Soft re-prompt when the player dodges. Stays on the same chapter. */
function dodgeReply(ctx: PlayerContext, currentChapter: ChapterId, hint: string): ChapterResult {
  const { ctx: next, lostAll } = loseLife(ctx);
  if (lostAll) {
    return {
      replies: [
        { text: `🖤🖤🖤  No lives left. Take a breath, come back when you're in the mood — your progress is saved.\n\nReply *RESTART* to start over, or pick this up later.` },
      ],
      nextChapter: currentChapter,
      ctx: { ...next, lives: 0 },
      finished: false,
    };
  }
  return {
    replies: [
      { text: `${rail(next)}\n\n💔 Lost a life. ${hint}\n\nTry again — I'm listening, even if it's messy.` },
    ],
    nextChapter: currentChapter,
    ctx: next,
  };
}

/** Call Claude with graceful fallback. Returns null if no API key / parse fails. */
async function tryCallSage(
  chapter: string,
  body: string,
  ctx: PlayerContext,
  injectedFacts?: Record<string, string | number>,
): Promise<import("./claude").SageOutput | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    return await callSage({
      chapter,
      countryCode: ctx.country,
      playerBody: body,
      injectedFacts,
    });
  } catch (err) {
    console.error(`[orchestrator/${chapter}] Claude call failed`, err);
    return null;
  }
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
  const next: PlayerContext = {
    ...ctx,
    country: code,
    lives: ctx.lives ?? STARTING_LIVES,
    gems: ctx.gems ?? 0,
  };
  return {
    replies: [
      {
        text: `${country.flag} ${country.name}. So that's where your story begins.\n\n${rail(next)}  ← three lives, seven gems to win. Lose all three and you respawn.`,
      },
      {
        text:
          "First mark on the map: *what does your hand know how to do?*\n\n" +
          "Reply with the numbers (comma-separated, pick all that fit):\n\n" +
          "1️⃣  Fix things — phones, electronics, broken stuff\n" +
          "2️⃣  Make things — fabric, thread, hand-craft\n" +
          "3️⃣  Code things — software, scripts, websites\n" +
          "4️⃣  Sell things — shop, market, kiosk\n" +
          "5️⃣  None of those — type your own in a sentence",
      },
    ],
    nextChapter: "inventory",
    ctx: next,
  };
}

/**
 * Inventory mapping — each slot is rooted in an ISCO-08 major group (1-digit)
 * and a default unit-code seed (4-digit). Origin chapter refines via Claude
 * to the actual unit code. This covers ~85% of LMIC informal-sector youth.
 */
const INVENTORY_CATEGORIES: Array<{
  slot: string;
  emoji: string;
  label: string;
  sub: string;
  iscoMajor: string;
  defaultUnit: string;
}> = [
  { slot: "1", emoji: "🔧", label: "Fix things", sub: "phones, electronics, machines", iscoMajor: "7", defaultUnit: "7421" },
  { slot: "2", emoji: "🧵", label: "Make by hand", sub: "fabric, wood, food, crafts", iscoMajor: "7", defaultUnit: "7531" },
  { slot: "3", emoji: "🌾", label: "Grow & raise", sub: "farm, fish, animals", iscoMajor: "6", defaultUnit: "6111" },
  { slot: "4", emoji: "🛒", label: "Sell things", sub: "shop, market, online", iscoMajor: "5", defaultUnit: "5223" },
  { slot: "5", emoji: "🤲", label: "Help people", sub: "care, teach, drive, host", iscoMajor: "5", defaultUnit: "5311" },
  { slot: "6", emoji: "💻", label: "Work with computers", sub: "code, design, content", iscoMajor: "2", defaultUnit: "2519" },
];

function handleInventory(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const picks = input.body
    .split(/[, ]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (isDodge(input.body, 1)) {
    return dodgeReply(ctx, "inventory", "Pick at least one — type the numbers (e.g. *1, 4*) for the kinds of work that match your life.");
  }

  // Map slot picks to ISCO unit codes; first pick wins as the seed.
  const matchedCats = picks
    .map((p) => INVENTORY_CATEGORIES.find((c) => c.slot === p))
    .filter((c): c is typeof INVENTORY_CATEGORIES[0] => Boolean(c));
  const isco = matchedCats[0]?.defaultUnit ?? "7421";
  const breadth = matchedCats.length;

  let updated: PlayerContext = {
    ...ctx,
    iscoSeed: isco,
    scores: {
      ...ctx.scores,
      inventoryBreadth: breadth,
    },
    lastEcho: matchedCats.length > 0
      ? matchedCats.map((c) => `${c.emoji} ${c.label}`).join(", ")
      : "your own craft",
  };
  if (matchedCats.length > 0) {
    (updated.scores as Record<string, unknown>).inventoryISCOMajors = JSON.stringify(
      Array.from(new Set(matchedCats.map((c) => c.iscoMajor))),
    );
  }
  updated = awardGem(updated, updated.lastEcho ?? "");

  return {
    replies: [
      {
        text: `${rail(updated)}\n\n${updated.lastEcho ?? "Noted"}. Now pick your guide.`,
      },
      {
        text:
          "🎮 *Pick your companion* — this is your first AI capability check.\n\n" +
          "1️⃣  🧙 *Sage* — careful, plans first, reasons with you\n" +
          "2️⃣  ⚡ *Spark* — quick, tries everything, learns by doing\n" +
          "3️⃣  🦅 *Scout* — sees the map, jumps far\n" +
          "4️⃣  🎯 *Kira* — no fluff, ships\n\n" +
          "Reply 1-4.",
      },
    ],
    nextChapter: "companion",
    ctx: updated,
  };
}

function handleCompanion(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const map: Record<string, { id: string; name: string; emoji: string; line: string }> = {
    "1": { id: "sage", name: "Sage", emoji: "🧙", line: "thoughtful — we'll think together." },
    "2": { id: "spark", name: "Spark", emoji: "⚡", line: "fast — we'll try things." },
    "3": { id: "scout", name: "Scout", emoji: "🦅", line: "panoramic — we'll see the whole map." },
    "4": { id: "kira", name: "Kira", emoji: "🎯", line: "ship-first — no fluff." },
  };
  const choice = input.body.trim().charAt(0);
  const c = map[choice] ?? map["2"];
  const next: PlayerContext = { ...ctx, companion: c.id };
  return {
    replies: [
      {
        text: `${rail(next)}\n\n${c.emoji} *${c.name}*. ${c.line}`,
      },
      {
        text:
          "Quick one before we start — *what's the last new tool, app, or AI you tried this month?*\n\nOne line is fine. Be specific (name + what you tried to do).",
      },
    ],
    nextChapter: "drillin",
    ctx: next,
  };
}

async function handleDrillIn(input: ChapterInput, ctx: PlayerContext): Promise<ChapterResult> {
  if (isDodge(input.body, 8)) {
    return dodgeReply(ctx, "drillin", "Tell me one *thing* you tried this month — a specific tool name + a specific use. 'Claude — wrote a customer message in Twi-English'.");
  }

  // Provisional AI Tier from heuristic + Claude refinement
  let tier = guessAITier(input.body);
  let echoLine = "";
  const sage = await tryCallSage("drillin", input.body, ctx);
  if (sage?.scoring) {
    const concretness = (sage.scoring.concreteness as number) ?? 0;
    const recency = (sage.scoring.recency as number) ?? 0;
    const iter = (sage.scoring.iteration as number) ?? 0;
    tier = Math.min(4, Math.max(0, Math.round((concretness + recency + iter) / 3 * 4))) as 0 | 1 | 2 | 3 | 4;
    echoLine = sage.reply_messages?.[0] ?? "";
  }

  let updated: PlayerContext = {
    ...ctx,
    aiTierProvisional: tier,
    scores: { ...ctx.scores, drillinTier: tier },
  };
  updated = awardGem(updated, input.body.slice(0, 80));

  return {
    replies: [
      {
        text: `${rail(updated)}\n\n${echoLine || `Got it — _${input.body.length > 60 ? input.body.slice(0, 60) + "…" : input.body}_`}\n\nProvisional AI Tier ${tier}/4. We'll refine in the boss fight.`,
      },
      {
        text:
          "💎 *Chapter 1 — The Origin*\n\n" +
          "Tell me about something you spent more than 2 hours on yesterday. Anything — work, family, building, fixing, learning. Just talk.\n\n" +
          "*The more specific you are, the better I can read you.*",
      },
    ],
    nextChapter: "origin",
    ctx: updated,
  };
}

async function handleOrigin(input: ChapterInput, ctx: PlayerContext): Promise<ChapterResult> {
  if (isDodge(input.body, 25)) {
    return dodgeReply(
      ctx,
      "origin",
      "I need a *story* — a real moment from yesterday. Even one paragraph. What did you wake up and do? What took the time?",
    );
  }

  const country = getCountry(ctx.country);

  let iscoUnit = ctx.iscoSeed ?? country.samplePlayer.iscoSeed;
  let iscoConfidence = 0.5;
  let detectedTitle = "";
  let claudeReply: string | null = null;

  const sage = await tryCallSage("origin", input.body, ctx, { sample_city: country.sampleCity });
  if (sage?.scoring?.iscoUnit) iscoUnit = String(sage.scoring.iscoUnit);
  if (typeof sage?.scoring?.iscoConfidence === "number") {
    iscoConfidence = sage.scoring.iscoConfidence;
  }
  claudeReply = sage?.reply_messages?.[0] ?? null;
  detectedTitle = ISCO_TITLES[iscoUnit] ?? "";

  // Heuristic fallback: keyword sniff for ISCO seeds.
  if (!detectedTitle) {
    const lower = input.body.toLowerCase();
    const hits: Array<[string, number]> = [
      ["7421", /(phone|repair|screen|battery|logic|solder|kiosk)/g.test(lower) ? 1 : 0],
      ["7531", /(sew|tailor|blouse|fabric|embroider|stitch|silk|kente)/g.test(lower) ? 1 : 0],
      ["2519", /(code|coding|javascript|python|react|next\.?js|debug|developer|software)/g.test(lower) ? 1 : 0],
      ["5223", /(selling|shop|store|sales|kiosk|market)/g.test(lower) ? 1 : 0],
    ];
    hits.sort((a, b) => b[1] - a[1]);
    if (hits[0][1] > 0) {
      iscoUnit = hits[0][0];
      iscoConfidence = 0.65;
    }
    detectedTitle = ISCO_TITLES[iscoUnit] ?? "your craft";
  }

  let updated: PlayerContext = {
    ...ctx,
    iscoSeed: iscoUnit,
    scores: { ...ctx.scores, origin: scoreLength(input.body), iscoConfidence },
  };
  updated = awardGem(updated, input.body.slice(0, 80));

  const echoBlock = claudeReply ?? `Got it — _${input.body.slice(0, 80)}${input.body.length > 80 ? "…" : ""}_`;
  const lockedLine = `📜 *${detectedTitle}* locked (${Math.round(iscoConfidence * 100)}% confidence).`;
  const transition = `⚒️ *Chapter 2 — The Forge*\n\nNow — tell me about the hardest one you've ever pulled off in this work. What was at stake, what did you do, what worked?`;

  return {
    replies: [
      { text: `${rail(updated)}\n\n${echoBlock}` },
      { text: lockedLine },
      { text: transition },
    ],
    nextChapter: "forge",
    ctx: updated,
  };
}

async function handleForge(input: ChapterInput, ctx: PlayerContext): Promise<ChapterResult> {
  if (isDodge(input.body, 25)) {
    return dodgeReply(
      ctx,
      "forge",
      "Hardest one you ever pulled off — be specific. A customer's name, a part you replaced, a bug you traced. What broke, what you did, what worked.",
    );
  }

  let depthScore = scoreLength(input.body);
  let escalation = 0;
  let setbacks = 0;
  let oNetTasks: string[] = [];
  let claudeReply: string | null = null;

  const sage = await tryCallSage("forge", input.body, ctx, { isco: ctx.iscoSeed ?? "" });
  if (sage?.scoring) {
    if (typeof sage.scoring.depth === "number") depthScore = sage.scoring.depth;
    if (typeof sage.scoring.escalation === "number") escalation = sage.scoring.escalation as number;
    if (typeof sage.scoring.setbacks === "number") setbacks = sage.scoring.setbacks as number;
    const tasksField = (sage.scoring as Record<string, unknown>).oNetTasks;
    if (Array.isArray(tasksField)) {
      oNetTasks = tasksField.filter((t): t is string => typeof t === "string").slice(0, 4);
    }
    claudeReply = sage.reply_messages?.[0] ?? null;
  }

  // Heuristic fallback: detect escalation / setbacks via regex
  if (depthScore && oNetTasks.length === 0) {
    const lower = input.body.toLowerCase();
    escalation = (lower.match(/\b(tried|first|then|switched|next|after that|finally)\b/g) ?? []).length;
    setbacks = (lower.match(/\b(broke|failed|wrong|stuck|again|didn't work)\b/g) ?? []).length;
  }

  const tier = depthScore >= 0.85 ? "IV" : depthScore >= 0.65 ? "III" : depthScore >= 0.4 ? "II" : "I";

  let updated: PlayerContext = {
    ...ctx,
    scores: {
      ...ctx.scores,
      forgeDepth: depthScore,
      forgeEscalation: escalation,
      forgeSetbacks: setbacks,
    },
  };
  // Persist O*NET tasks via a string-typed score (we'll JSON.parse on render)
  if (oNetTasks.length > 0) {
    (updated.scores as Record<string, unknown>).forgeONetTasks = JSON.stringify(oNetTasks);
  }
  updated = awardGem(updated, input.body.slice(0, 80));

  const echo = claudeReply ?? `Tier ${tier} craft. ${escalation} pivots, ${setbacks} setbacks visible in your story.`;

  return {
    replies: [
      { text: `${rail(updated)}\n\n${echo}` },
      {
        text: oracleRoundPrompt(ctx.iscoSeed ?? "7421"),
      },
    ],
    nextChapter: "oracle",
    ctx: updated,
  };
}

/** Single-round boss fight prompt: a partial truth your rival speaks.
 * This is the unfakeable Tier-3 indicator — calibrated PROBE = Tier 3+. */
function oracleRoundPrompt(isco: string): string {
  const partialByIsco: Record<string, string> = {
    "7421": `_Lightning ports on iPhone 12 use gold-plated contacts that resist corrosion well — so saltwater damage is mostly cosmetic._`,
    "7531": `_Polyester thread is always stronger than cotton thread for embroidery — always use polyester._`,
    "2519": `_Server-side rendering always makes apps faster than client-side rendering._`,
    "5223": `_Bulk-buying always reduces your unit cost — always order more inventory._`,
  };
  const claim = partialByIsco[isco] ?? partialByIsco["7421"];
  return (
    `⚔️ *Chapter 3 — The Oracle (boss fight)*\n\n` +
    `Your rival says:\n\n${claim}\n\n` +
    `Reply *TRUST* (you agree), *STRIKE* (it's wrong), or *PROBE* (it's only partly true). Calibration matters — over-confident strikers get capped at AI Tier 2.`
  );
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
  const choice = input.body.trim().toUpperCase();
  let calibration = 0;
  let aiTierFinal: 0 | 1 | 2 | 3 | 4 = ctx.aiTierProvisional ?? 1;
  let reaction = "";

  // Partial-truth scoring (R3-equivalent):
  // - PROBE = perfect calibration (+2). Unlocks Tier 3+.
  // - TRUST = took partial as full truth (+0).
  // - STRIKE = over-confident, capped at Tier 2.
  if (choice === "PROBE" || choice.startsWith("P")) {
    calibration = 2;
    aiTierFinal = Math.max(3, aiTierFinal) as 0 | 1 | 2 | 3 | 4;
    reaction = `✨ *Calibrated.* You read the partial truth right. Most strikers would've over-committed.`;
  } else if (choice === "STRIKE" || choice.startsWith("S")) {
    calibration = -1;
    aiTierFinal = Math.min(2, aiTierFinal) as 0 | 1 | 2 | 3 | 4;
    reaction = `🛡️ *Over-confident.* You struck a partial truth — gold contacts DO resist surface corrosion, just not the IC underneath. Tier capped at 2.`;
  } else if (choice === "TRUST" || choice.startsWith("T")) {
    calibration = 0;
    reaction = `⚖️ *Took it at face value.* Closer to neutral — you missed the partial-truth tell.`;
  } else {
    return dodgeReply(ctx, "oracle", "Reply *TRUST*, *STRIKE*, or *PROBE*. (PROBE = it's only partly true — that's the calibration play.)");
  }

  let updated: PlayerContext = {
    ...ctx,
    aiTierProvisional: aiTierFinal,
    scores: {
      ...ctx.scores,
      oracleCalibration: calibration,
      aiTierFinal,
    },
  };
  updated = awardGem(updated, `oracle:${choice}`);

  return {
    replies: [
      { text: `${rail(updated)}\n\n${reaction}` },
      { text: `🎯 *AI Tier locked at T${aiTierFinal}.*` },
      {
        text:
          "🌟 *Chapter 4 — The Future*\n\nThree doors. Pick one + tell me one skill you'd need that you don't have yet.\n\n🚪 1 — Same work, bigger scale\n🚪 2 — Different but related\n🚪 3 — Something completely new",
      },
    ],
    nextChapter: "future",
    ctx: updated,
  };
}

async function handleFuture(input: ChapterInput, ctx: PlayerContext): Promise<ChapterResult> {
  if (isDodge(input.body, 12)) {
    return dodgeReply(
      ctx,
      "future",
      "Pick a door (1, 2, or 3) AND tell me one skill you'd need. Even one sentence. 'Door 2 — digital marketing, I can fix phones but I can't make people find me online.'",
    );
  }

  const door = (input.body.match(/[1-3]/)?.[0] ?? "2") as "1" | "2" | "3";
  let openness = scoreLength(input.body);
  let skillGap = "";
  let claudeReply: string | null = null;

  const sage = await tryCallSage("future", input.body, ctx);
  if (sage?.scoring) {
    if (typeof sage.scoring.openness === "number") openness = sage.scoring.openness;
    if (typeof sage.scoring.skillGap === "string") skillGap = sage.scoring.skillGap;
    claudeReply = sage.reply_messages?.[0] ?? null;
  }
  if (!skillGap) {
    // Strip "door X" prefix to get the skill phrase
    skillGap = input.body.replace(/^.*?(door)?\s*[1-3]\s*[—,-]?\s*/i, "").slice(0, 80);
  }

  let updated: PlayerContext = {
    ...ctx,
    scores: {
      ...ctx.scores,
      futureOpenness: openness,
      futureDoor: Number(door),
    },
  };
  (updated.scores as Record<string, unknown>).futureSkillGap = skillGap;
  updated = awardGem(updated, `door:${door} gap:${skillGap}`);

  const echo =
    claudeReply ?? `Door ${door}. Skill gap noted: _${skillGap}_. Realistic — most ${ISCO_TITLES[ctx.iscoSeed ?? "7421"] ?? "people"} say something close to that.`;

  return {
    replies: [
      { text: `${rail(updated)}\n\n${echo}` },
      {
        text:
          "🤝 *Chapter 5 — The Tribe*\n\nLast gem. Pick one person who's seen you work or learn — forward them your Atlas Card link (it's coming).\n\nReply *DONE* when you've forwarded it (or *SKIP*).",
      },
    ],
    nextChapter: "tribe",
    ctx: updated,
  };
}

function handleTribe(input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const upper = input.body.trim().toUpperCase();
  const forwarded = upper.includes("DONE") || upper.includes("SENT");
  const skipped = upper.includes("SKIP");

  if (!forwarded && !skipped) {
    return dodgeReply(ctx, "tribe", "Reply *DONE* once you've forwarded the card to one person, or *SKIP* if you'd rather not.");
  }

  let updated: PlayerContext = {
    ...ctx,
    scores: { ...ctx.scores, tribeForwarded: forwarded ? 1 : 0 },
  };
  if (forwarded) updated = awardGem(updated, "tribe:done");

  return {
    replies: [
      { text: `${rail(updated)}\n\n${forwarded ? "Last gem locked." : "Skipped — no judgment."} Now I'm building your report card from everything you said.` },
    ],
    nextChapter: "card",
    ctx: updated,
  };
}

function handleCard(_input: ChapterInput, ctx: PlayerContext): ChapterResult {
  const country = getCountry(ctx.country);
  const isco = ctx.iscoSeed ?? "7421";
  const tier = (ctx.aiTierProvisional ?? 1) as 0 | 1 | 2 | 3 | 4;
  const wage = WAGES[ctx.country]?.[isco];
  const auto = AUTOMATION_RISK[isco];
  const title = ISCO_TITLES[isco] ?? "Worker";

  const formalWage = wage ? `${wage.currency}${wage.formalMedian.toLocaleString()}` : "—";
  const informalWage = wage ? `${wage.currency}${wage.informalMedian.toLocaleString()}` : "—";

  const tierMeta: Record<number, { label: string; premium: number }> = {
    0: { label: "Unfamiliar", premium: 0 },
    1: { label: "Curious", premium: 0.05 },
    2: { label: "Active", premium: 0.2 },
    3: { label: "Power User", premium: 0.5 },
    4: { label: "Builder", premium: 1.0 },
  };
  const tierInfo = tierMeta[tier];
  const projectedWage = wage ? Math.round(wage.formalMedian * (1 + tierInfo.premium)) : 0;

  // Pull persisted O*NET task matches from Forge scoring (if Claude provided)
  let oNetTasks: string[] = [];
  const onetField = ctx.scores.forgeONetTasks;
  if (typeof onetField === "string") {
    try {
      const parsed = JSON.parse(onetField);
      if (Array.isArray(parsed)) oNetTasks = parsed.filter((t): t is string => typeof t === "string");
    } catch { /* ignore */ }
  }

  // STEP-equivalent dimensions
  const forgeDepth = (ctx.scores.forgeDepth as number) ?? 0;
  const futureOpenness = (ctx.scores.futureOpenness as number) ?? 0;
  const oracleCalibration = (ctx.scores.oracleCalibration as number) ?? 0;
  const inventoryBreadth = (ctx.scores.inventoryBreadth as number) ?? 0;

  // Answer-pattern profile
  const answerPattern: string[] = [];
  if (forgeDepth >= 0.7) answerPattern.push("specific");
  if ((ctx.scores.forgeEscalation as number) >= 2) answerPattern.push("iterative");
  if ((ctx.scores.forgeSetbacks as number) >= 1) answerPattern.push("resilient");
  if (oracleCalibration >= 2) answerPattern.push("calibrated");
  if (inventoryBreadth >= 3) answerPattern.push("polymath");
  if (futureOpenness >= 0.7) answerPattern.push("self-aware");

  const skillGap = typeof ctx.scores.futureSkillGap === "string" ? ctx.scores.futureSkillGap : "";
  const usPct = auto ? Math.round(auto.freyOsborneScore * 100) : 0;
  const lmicPct = auto ? Math.round(auto.lmicAdjusted * 100) : 0;
  const moreOrLess = lmicPct < usPct ? "more" : "less";

  const slug = generateSlug();
  const stored: StoredCard = {
    slug,
    handle: `${ctx.channel}:${ctx.handle}`,
    country: ctx.country,
    iscoCode: isco,
    iscoTitle: title,
    iscoConfidence: (ctx.scores.iscoConfidence as number) ?? 0.5,
    atlasClass: classFor(isco),
    aiTier: tier,
    scores: ctx.scores,
    oNetTasks: oNetTasks.length ? oNetTasks : undefined,
    skillGap: skillGap || undefined,
    channel: ctx.channel,
    issuedAt: new Date().toISOString(),
  };
  void saveCard(stored);

  return {
    replies: [
      { text: `🎴 *YOUR ATLAS CARD*\n\n${rail(ctx)}` },
      {
        text:
          `📜 *ISCO-08 occupation*\n` +
          `${title} (ISCO-${isco})\n` +
          `Confidence ${Math.round(((ctx.scores.iscoConfidence as number) ?? 0.5) * 100)}% · derived from your Origin story.`,
      },
      {
        text:
          `💰 *Verdict — ILOSTAT 2024*\n` +
          `Formal market median: ${formalWage}/mo\n` +
          `Informal median: ${informalWage}/mo\n` +
          `${country.flag} ${country.name}`,
      },
      {
        text:
          `🤖 *AI Tier ${tier} — ${tierInfo.label}*\n` +
          `+${Math.round(tierInfo.premium * 100)}% wage premium = projected ${wage ? wage.currency : ""}${projectedWage.toLocaleString()}/mo\n` +
          `Atlas-original measurement, calibrated by your Oracle round.`,
      },
      ...(oNetTasks.length
        ? [{
            text:
              `🛠️ *O*NET task matches*\n` +
              oNetTasks.map((t) => `• ${t}`).join("\n"),
          }]
        : []),
      {
        text:
          `🤖 *Automation risk*\n` +
          `${lmicPct}% LMIC-adjusted (Frey-Osborne 2013 + ILO/WB 2018 reappraisal)\n` +
          `You're ${moreOrLess} durable than the US baseline (${usPct}%) — your work is hands-on.`,
      },
      ...(answerPattern.length
        ? [{
            text:
              `🎭 *Atlas Class — ${classFor(isco)}*\n` +
              `Answer pattern: ${answerPattern.map((p) => `_${p}_`).join(", ")}.`,
          }]
        : [{ text: `🎭 *Atlas Class*: ${classFor(isco)}` }]),
      ...(skillGap
        ? [{
            text:
              `🌟 *Your edge*\n` +
              `One skill you said you'd need: _${skillGap}_. That's the bridge to your next tier.`,
          }]
        : []),
      // Squad / contact CTA appended by the WA layer (handler.ts) for WhatsApp,
      // or rendered by the /player AtlasCard modal for browser.
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
