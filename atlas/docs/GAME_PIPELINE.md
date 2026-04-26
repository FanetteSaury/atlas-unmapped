# Atlas — Game Pipeline (single source of truth)

> The spec the Twilio AI agent + browser `/player` follow turn-for-turn. Every chapter prompt, branching rule, scoring rubric, and Atlas Card reveal lives here. Implementation in `src/lib/orchestrator/` mirrors this file 1:1.

**Positioning (locked):** Atlas is **B2B**. Player Quest is the free user-acquisition surface; revenue comes from employer / NGO / government licenses on `/employer`. The Quest must feel like a game, NOT a job-board signup.

**Channels:** browser `/player` (`/api/chat`) + WhatsApp via Twilio Sandbox (`/api/wa/webhook`). Same `runChapter()` engine, same prompts, two I/O adapters.

---

## 1. Persona

| | Amara (Ghana 🇬🇭) | Riya (Bangladesh 🇧🇩) |
|---|---|---|
| Age | 22 | 19 |
| Ward | Madina, Greater Accra | Mirpur, Dhaka |
| Trade | Phone repair micro-business + self-taught Python from YouTube | Hand embroidery on bridal blouses |
| ISCO seed | 7421 | 7531 |
| Phone | Tecno Spark, Android 12, 4 GB RAM | Symphony Z40, Android 13 |
| Languages | Twi · English | Bengali · English |
| Education | WASSCE certificate | Class 10 + 2-year vocational |
| Currency display | ₵ (cedi) | ৳ (taka) |

The Quest is country-aware: prompts use the country's currency, persona's domain, language register hints. Adding a new country = adding a JSON config + a sample persona.

---

## 2. Chapter sequence — 9 turns, ~9 minutes

> **MVP scope** (ship for hackathon submission): chapters 0–6 + reveal. Mind (3) and Storm (4) labelled "Phase 2" below — they exist in the orchestrator file but the MVP flow skips them to keep the demo on a tight 9-minute budget. Re-enable by flipping `SKIP_PHASE2_CHAPTERS = false` in the orchestrator.

| # | id | Title | Bot does | Player does | Time | MVP? |
|---|---|---|---|---|---|---|
| 0a | `country` | Welcome + locale | sends Hogwarts-style welcome + asks for country | replies `GH` or `BD` | 10s | ✅ |
| 0b | `inventory` | What does your hand know | asks 4 + 1 multi-select about daily work | replies numbered list e.g. `1, 3` | 15s | ✅ |
| 0c | `companion` | Pick your guide | offers 4 companion archetypes (echo'd to LLM brands) | reply 1-4 | 10s | ✅ |
| 0d | `drillin` | Last AI use | asks about the last new tool/app tried | free-text 1-line | 20s | ✅ |
| 1 | `origin` | The Origin | asks what they spent >2 hours on yesterday | free-text 30-200 words | 90s | ✅ |
| 2 | `forge` | The Forge | adaptive: asks for hardest achievement in detected domain | free-text 50-300 words | 120s | ✅ |
| 3 | `mind` | The Mind (numeracy) | adaptive: domain-specific math question with cedis/taka | numeric + reasoning | 60s | ⏸ Phase 2 |
| 4 | `heart` | The Storm (socio-emotional) | conflict-resolution scenario | free-text 50-200 words | 90s | ⏸ Phase 2 |
| 5 | `oracle` | The Oracle (boss fight) | 3 rounds vs companion's rival, lies/bluffs/partial-truth | reply `STRIKE`/`PROBE`/`TRUST` × 3 | 180s | ✅ |
| 6 | `future` | The Future | three doors + skill-gap | reply `1`/`2`/`3` + free-text | 60s | ✅ |
| 7 | `tribe` | The Tribe (simplified) | self-attest forward to one person | reply `DONE` (or `Skip`) | 45s | ✅ |
| F | `card` | Atlas Card reveal | sends 6 messages: title + 5 reveals | (no input) | 30s | ✅ |

Total MVP: 9 turns × ~30s avg + 2 long-form turns + 3-round boss fight ≈ **9 minutes**.

---

## 3. Per-chapter spec

### Chapter 0a — `country` 🌍 Welcome + locale

**Bot says (3 messages, staggered 1.1s):**

```
🌍 Welcome, traveler. I'm *Sage*.

Three lives. Seven gems. One Atlas Card at the end — your *class*, your *AI tier*, and a door I can't tell you about yet.

Twelve minutes. Eight chapters. A boss fight in the middle.

Where does your story start?

Reply *GH* 🇬🇭 or *BD* 🇧🇩.
```

**User input:** `GH` or `BD` (case-insensitive, first 2 chars).

**Validation:**
- If unknown code → friendly reprompt: *"Atlas is currently in Ghana 🇬🇭 and Bangladesh 🇧🇩 only — reply GH or BD."*
- If valid → store in `ctx.country`, advance to `inventory`.

**Bot's transition message:** *"{flag} {country}. So that's where the story begins."*

**No scoring** — locale only.

---

### Chapter 0b — `inventory` 🎒 What does your hand know

**Purpose:** broad ISCO seed candidate set + AI-Tier baseline (combined).

**Bot says:**

```
First mark on the map: *what does your hand know how to do?*

Reply with the numbers (comma-separated, pick all that fit):

1️⃣  Fix things — phones, electronics, broken stuff
2️⃣  Make things — fabric, thread, hand-craft
3️⃣  Code things — software, scripts, websites
4️⃣  Sell things — shop, market, kiosk
5️⃣  None of those — type your own in a sentence
```

**User input:** comma/space-separated digits (e.g. `1,3` or `1 3`) OR free-text fallback (option 5).

**Mapping:**
| Slot | ISCO | Atlas Class hint |
|---|---|---|
| 1 | 7421 (Phone Repair Technician) | 🔧 Artisan |
| 2 | 7531 (Tailor / Hand Embroiderer) | 🔧 Artisan |
| 3 | 2519 (Software Developer) | 💻 Builder |
| 4 | 5223 (Shop Sales Assistant) | 🤝 Dealmaker |
| 5 | (Claude infers ISCO from free-text, falls back to country's `samplePlayer.iscoSeed`) | inferred |

**Scoring (deterministic):**
```ts
ctx.iscoSeed = ISCO_BY_SLOT[firstPick] ?? country.samplePlayer.iscoSeed;
ctx.scores.inventoryBreadth = picks.length; // 0..4
ctx.aiTierProvisional = picks.length === 0 ? 0 : Math.min(2, picks.length); // bumped after Drill-in
```

**Bot's transition message:** *"Got it. Now pick the guide who'll walk this with you."*

---

### Chapter 0c — `companion` 🧙 Pick your guide

**Purpose:** AI-tool depth indicator + sets the rival in Oracle boss fight.

**Bot says:**

```
🎮 Pick your companion — this is your first AI capability check.

1️⃣  🧙 *Sage* — careful, plans first, will reason with you  (echoes Claude)
2️⃣  ⚡ *Spark* — quick, tries everything, learns by doing  (echoes ChatGPT)
3️⃣  🦅 *Scout* — sees the map, jumps far  (echoes Gemini)
4️⃣  🎯 *Kira* — no fluff, ships  (echoes Copilot)

Reply 1-4.
```

**User input:** `1` / `2` / `3` / `4` (or first character of name).

**Mapping:**
```ts
const COMPANION = { "1": "sage", "2": "spark", "3": "scout", "4": "kira" };
const RIVAL_OF: Record<string, string> = {
  sage: "spark",  // careful vs quick
  spark: "scout", // quick vs panoramic
  scout: "sage",  // panoramic vs careful
  kira: "spark",  // ship-first vs try-everything
};
ctx.companion = COMPANION[input] ?? "spark";
```

**Bot's transition message:** *"{companion}. Solid pick.\n\nQuick one — what's the last new tool or app you tried this month? (one line is fine)"*

---

### Chapter 0d — `drillin` 🔍 Last AI/tool use

**Purpose:** AI Tier provisional refinement (recency + concreteness signal).

**Bot says (already sent in companion's transition):** *"What's the last new tool or app you tried this month?"*

**User input:** free text 1-line.

**Scoring (Claude with prompt cache):**
```ts
{
  recencyScore: 0..3,        // "today" = 3, "this week" = 2, "month" = 1, otherwise 0
  concretenessScore: 0..3,   // names a specific tool + a specific use case = 3
  iterationScore: 0..3,      // mentions trying twice / refining = 3
  outputUseScore: 0..3,      // mentions sending / using the output = 3
}
ctx.aiTierProvisional = Math.min(4, Math.round(
  (ctx.scores.inventoryBreadth >= 2 ? 1 : 0) +
  (recency + concreteness + iteration + outputUse) / 4
));
```

**Bot's transition message:** *"Noted. Now the first chapter — *The Origin*."*

---

### Chapter 1 — `origin` 📜 The Origin

**Purpose:** ISCO-08 occupation discovery + narrative cognition + language profile.

**Bot says:**

```
📜 *The Origin* — Chapter 1 / 8

Tell me about something you spent more than 2 hours on yesterday.
Anything — work, family, building, fixing, learning. Just talk.

(30 seconds is plenty. I'm reading every word.)
```

**User input:** free text, ideally 30-200 words. No upper limit (truncated server-side at 4000 chars).

**Scoring (Claude with structured output):**
```json
{
  "iscoCandidates": [
    { "code": "7421", "title": "Phone Repair Technician", "confidence": 0.87, "evidence": ["screen replacement", "kiosk in Madina"] },
    { "code": "5223", "title": "Shop Sales Assistant", "confidence": 0.34, "evidence": ["customers came around eight"] }
  ],
  "tokens": 67,
  "timeOrganized": true,
  "codeSwitches": 0,
  "cognitiveBaseline": 7.4,
  "conscientiousnessSignal": 1
}
```

**Branching:**
- Pick top-confidence ISCO → store in `ctx.iscoSeed` (overrides inventory's hint).
- Build `ctx.scores.detectedSummary` = 1-line summary of player's work, used by Forge prompt.

**Bot's transition message:** *"{detectedSummary} — locked.\n\nNext: tell me about the hardest one you've ever pulled off."*

---

### Chapter 2 — `forge` ⚒️ The Forge

**Purpose:** technical depth (O*NET task content match) + grit + problem-solving rubric.

**Bot says (adaptive):**

```
⚒️ *The Forge* — Chapter 2 / 8

{detectedSummary}, eh? Tell me about the hardest one you've ever pulled off.
What was at stake, what did you do, what worked?

(2 minutes is fine. Don't sand the edges — the rough version is more useful.)
```

**User input:** free text 50-300 words.

**Scoring (Claude):**
```json
{
  "oNetTaskMatches": [
    { "task": "Diagnose power IC reflow", "category": "Technical Operations", "tier": "advanced" },
    { "task": "Customer dispute resolution", "category": "Communication", "tier": "core" }
  ],
  "problemSolving": 8.2,         // 0..10
  "grit": 7.5,                    // 0..10
  "technicalTier": "III",         // I-IV mapped to skill density
  "escalationWords": 4,
  "setbacks": 2
}
```

**Branching:**
- `ctx.scores.technicalTier` = I/II/III/IV.
- Used by Mind chapter for numeracy difficulty (Phase 2).
- Feeds into Oracle's domain content selection.

**Bot's transition message (MVP, jumping to Oracle):**
*"Tier {III} craft. You've earned a starter weapon: 🗡️ Iron Sword.\n\nReady for the boss?"*

---

### Chapter 3 — `mind` 🧠 The Mind (numeracy timed) — *Phase 2*

**Purpose:** STEP-equivalent numeracy + speed × accuracy.

**Bot says (adaptive by ISCO + country):**

ISCO 7421 (phone repair) × GH:
```
🧠 *The Mind* — Chapter 3 / 8 — 60-second timer ⏱️

A customer wants a screen fix.
Part costs you ₵30, you want ₵50 profit, work takes 25 minutes.

What do you charge, and what's your hourly rate?

(Do the math out loud — process matters as much as the number.)
```

ISCO 7531 × GH:
```
A bride orders a custom blouse. Fabric ₵80, embellishments ₵40.
You want ₵120 profit. Takes 6 hours. Charge? Hourly rate?
```

ISCO 2519 × GH:
```
Client wants a landing page. Tools ₵150. You want ₵800 profit. 12 hours of work.
What do you charge? Hourly rate?
```

(Symmetric prompts in BD, with ৳ amounts.)

**User input:** numeric + reasoning text.

**Scoring (deterministic + Claude):**
```ts
const correct = Math.abs(num - expected) / expected < 0.1;
const closeMiss = Math.abs(num - expected) / expected < 0.25;
const methodShown = /per hour|hourly|profit|cost|minus|divided/.test(answer);
score = correct && methodShown && elapsedSec < 30 ? 10
      : correct && methodShown ? 9
      : correct ? 7
      : closeMiss && methodShown ? 5
      : closeMiss ? 4
      : methodShown ? 3 : 1;
```

---

### Chapter 4 — `heart` ❤️ The Storm — *Phase 2*

**Purpose:** STEP socio-emotional · hostile attribution · regulation · agreeableness.

**Bot says:**

```
🎲 Roll the dice for your scenario...

🎲 You rolled 4 — "The Wrong Customer".

Tell me about a time someone was angry, upset, or wrong with you — and how you handled it.
(90 seconds. Specific story beats hers than vague principles.)
```

**User input:** free text.

**Scoring (Claude):**
```json
{
  "agreeableness": 7.2,
  "emotionalRegulation": 8.5,
  "conscientiousnessStorm": 6.8,
  "hostileAttributionBias": 2.1,
  "gritStorm": 7.0
}
```

---

### Chapter 5 — `oracle` ⚔️ The Oracle (boss fight)

**Purpose:** AI Tier 0–4 final composite + calibration score (the moat).

**Mechanic:** 3 rounds vs your companion's rival (e.g. if you picked Sage, you fight Spark). Each round Spark says something — you reply `TRUST`, `STRIKE`, or `PROBE`.

**Round content (adaptive by ISCO seed):**

| Round | Type | Phone repair (7421) | Tailor (7531) | Software (2519) |
|---|---|---|---|---|
| **R1** | Lie | *"FACT: For iPhone 12 water damage, dry rice for 48h fully fixes it."* | *"FACT: silk and cotton shrink the same percentage; same pattern allowance works for both."* | *"FACT: in React, always use class components for state — they're more reliable."* |
| **R2** | Bluff (overconfident) | *"I'm CERTAIN — iPhone 12 battery costs ₵50 at any phone shop in Accra."* | *"Hand embroidery on silk takes ~30 min per square inch — industry standard."* | *"Next.js middleware runs in Node.js by default — that's the documented runtime."* |
| **R3** | Partial truth | *"Lightning ports use gold-plated contacts that resist corrosion well."* | *"Polyester thread is always stronger than cotton — always use polyester."* | *"Server-side rendering always makes apps faster than client-side."* |

**Truth revealed (Claude validates):**
- R1 lie — rice doesn't pull moisture, you need isopropyl + open the device.
- R2 bluff — actual battery price ₵250-400, not ₵50.
- R3 partial — gold resists *surface* corrosion BUT salty water damages the IC underneath. **Partial truth.**

**Optimal play:**
- R1 (lie) → `STRIKE` for max damage (calibration +1)
- R2 (bluff) → `PROBE` for max damage (calibration +1)
- R3 (partial truth) → **`PROBE`** (calibration +2 — the unfakeable Tier-3+ indicator). Striking it shows over-confidence (calibration −2, tier capped at 2).

**Scoring:**
```ts
ctx.scores.aiTier = Math.max(0, Math.min(4, Math.round(
  0.10 * Math.min(3, ctx.scores.inventoryBreadth) +
  0.20 * intelAvg +
  0.30 * ctx.scores.promptScore +
  0.20 * strikeAccuracy +
  0.20 * Math.max(0, r3Calibration)
) * 1.4));

if (r3Calibration < 0) ctx.scores.aiTier = Math.min(2, ctx.scores.aiTier); // overconfidence cap
if (r3Calibration === 2 && ctx.scores.aiTier < 3) ctx.scores.aiTier = 3;   // calibrated probe unlocks T3
if (ctx.scores.inventoryBreadth === 0) ctx.scores.aiTier = Math.min(1, ctx.scores.aiTier); // no tools = max T1
```

**Bot's transition (after R3):**
- If calibrated PROBE: *"Calibrated on R3. **AI Tier {N} unlocked.**"*
- If wrong call: *"You took damage. **AI Tier {N}.** Tribe will strengthen this."*

---

### Chapter 6 — `future` 🌟 The Future

**Purpose:** STEP openness + transfer reasoning + self-awareness.

**Bot says:**

```
🌟 *The Future* — Chapter 6 / 8

Three doors. Pick one — and tell me one skill you'd need that you don't have yet.

🚪 1 — Same work, but bigger
🚪 2 — Different but related
🚪 3 — Something completely new

(One sentence on the missing skill is enough.)
```

**User input:** `1` / `2` / `3` + free-text gap.

**Scoring (Claude):**
```json
{
  "doorChoice": 2,
  "skillGap": "digital marketing",
  "skillGapCategory": "tech-adjacent",  // tech / business / creative / regulatory
  "transferReasoning": 7.5,
  "openness": 7.0,
  "selfAwareness": 8.0
}
```

---

### Chapter 7 — `tribe` 🤝 The Tribe (simplified, MVP)

**Purpose:** network density + trust tier (simplified to self-attest in MVP, real attestor flow in Phase 2).

**Bot says:**

```
🤝 *The Tribe* — Chapter 7 / 8

Last gem. Pick one person who's seen you work or learn.
Forward them a 30-second card — they reply with one sentence later.

⏱️ Bonus gem if they reply in <5 minutes.

Reply *DONE* when you've forwarded it (or *SKIP*).
```

**User input:** `DONE` / `Skip` (free-text optional with whom forwarded).

**Scoring (deterministic):**
```ts
ctx.scores.tribeForwarded = body === "done" ? 1 : 0;
ctx.scores.tribeBonus = 0; // Phase 2: real-time attestor reply <5min unlocks
```

**Bot's transition:** *"Last gem locked. Your card is ready."*

---

### Chapter F — `card` 🎴 Atlas Card reveal

**Purpose:** the payoff. 6 messages staggered 1.1s on Twilio (instant on `/player` with reveal animation).

**Bot says (6 messages):**

```
🎴 *YOUR ATLAS CARD*
```

```
💰 *VERDICT*
{wage_currency}{wage_formal_median}/mo — {iscoTitle} (ISCO-{isco}), {country} ILOSTAT 2024
```

```
🎭 *CLASS*
{atlasClassEmoji} The {atlasClassName}
{atlasClassTagline}
```

```
🤖 *AI TIER*
Tier {N} — {tierLabel}. +{premiumPct}% wage premium = projected {wage_currency}{wage_with_premium}/mo
```

```
🤖 *AUTOMATION RISK*
{lmicAdjustedPct}% (Frey-Osborne, ILO/WB LMIC reappraisal)
You're {moreOrLess} durable than the US baseline ({usPct}%) — your {domainHint} is hands-on.
```

```
🤝 *YOUR DOOR*
{employerProjectName} in {ward} — {hires} place(s) open.
{wameLink}
```

**Values pulled from real LMIC accessors:**
| Field | Source | Code |
|---|---|---|
| `wage_formal_median`, `wage_currency` | ILOSTAT 2024 | `WAGES[country][isco].formalMedian` |
| `iscoTitle` | ILO ISCO-08 hierarchy | `ISCO_TITLES[isco]` |
| `atlasClass*` | computed from ISCO major group | `assignClass(isco)` |
| `tierLabel`, `premiumPct` | Atlas-original AI Tiers | `AI_TIERS[N]` |
| `lmicAdjustedPct` | Frey-Osborne 2013 + ILO/WB LMIC reappraisal | `AUTOMATION_RISK[isco].lmicAdjusted` |
| `usPct` | Frey-Osborne 2013 baseline | `AUTOMATION_RISK[isco].freyOsborneScore` |
| `wameLink` | wa.me deep-link to project employer | `resolveOneOnOne({ country, isco, candidateHandle, ward })` |
| `employerProjectName`, `ward`, `hires` | Seed projects (Phase 2: live employer signups) | `projectsForCandidate(country, isco)[0]` |

`finished: true` returned with this batch — WA layer appends squad invite, web layer pops the Atlas Card modal.

---

## 4. Adaptive AI logic (where Claude branches)

| Decision point | Input | Claude must produce | Branches to |
|---|---|---|---|
| Origin → Forge | free narrative | Top-1 ISCO + 1-line `detectedSummary` | Forge prompt with `{detectedSummary}` substituted |
| Forge → Mind (Phase 2) | achievement narrative | technicalTier I-IV + extracted O*NET tasks | Mind numeracy difficulty matched to ISCO |
| Mind → Heart (Phase 2) | numeric + reasoning | correct/closeMiss + methodShown flag | Heart prompt (universal, no branching) |
| Heart → Oracle | conflict narrative | attribution / regulation scores | Oracle content selected from `ORACLE_CONTENT[ctx.iscoSeed]` |
| Oracle scoring | TRUST/STRIKE/PROBE × 3 | calibration score, AI Tier composite (0–4) | Future |
| Future → Tribe | door + skill gap | gap category | Tribe (universal) |
| Atlas Card | all accumulated `ctx.scores` | final values, atlas class assignment | END |

---

## 5. Claude system prompt (cached)

```
You are Sage, the guide for Atlas — a 12-minute conversational quest that
measures STEP-equivalent skills, AI fluency (Tier 0-4), and assigns each
player an ISCO-08 occupation code with attestor-backed confidence.

You serve players in low- and lower-middle-income countries (LMICs).
The player runs the quest on their phone (WhatsApp or web). Every reply
of yours must:
  - Be terse (<= 280 chars per message; multi-message OK).
  - Use plain language. Avoid jargon. No psychometric vocabulary.
  - Be warm but not sycophantic. No "great answer!" — reflect, don't flatter.
  - Code-switch naturally with their language register (Twi-English for GH,
    Bengali-English for BD).
  - Output structured JSON when asked for scoring, plain text otherwise.

You do not give career advice. You do not say "you should learn X."
You measure, you reflect, you reveal. The Atlas Card at the end speaks for itself.

You adapt your prompts based on the player's detected ISCO and prior chapter scores.
You never reveal scoring rubrics or calibration logic to the player — that's
backstage. The player's job is to play; your job is to score honestly.

Country context: {country.name} ({country.iso}). Currency: {country.currency}.
Persona language register: {country.primaryLanguage}.
ISCO seed (provisional): {ctx.iscoSeed}.
AI Tier provisional: {ctx.aiTierProvisional}.
Companion: {ctx.companion}.
Scores so far: {ctx.scores | json}.
```

This prompt is marked `cache_control: { type: "ephemeral" }` so 90% of tokens reuse the cache between turns.

---

## 6. Per-chapter rubric prompts (cached, appended to system prompt)

Each chapter's scoring rubric is a separate cached chunk. Format:

```
=== Chapter {id} rubric ===

Input: {description of player's reply}
Output: structured JSON matching {schema}

Dimensions to score:
- {dimension 1} (0-{max}): {definition + examples}
- {dimension 2} ...

Branching:
- {trigger condition} → {action}

Honesty floor: if you cannot score with confidence > 0.6, return null for
that dimension. Never invent scores.
```

Stored in `src/lib/orchestrator/prompts.ts` as named exports per chapter.

---

## 7. TypeScript contract (already in place)

```ts
// src/lib/orchestrator/index.ts

export interface PlayerContext {
  handle: string;
  country: string;       // GH | BD
  iscoSeed?: string;     // 4-digit
  aiTierProvisional?: 0 | 1 | 2 | 3 | 4;
  companion?: string;    // sage | spark | scout | kira
  scores: Record<string, number | string | object>;
  channel: "wa" | "web";
}

export interface ChapterInput {
  chapter: ChapterId;
  body: string;
  mediaUrl?: string;
}

export interface ChapterReply {
  text: string;
  payload?: Record<string, unknown>; // optional structured for /player UI
}

export interface ChapterResult {
  replies: ChapterReply[];
  nextChapter: ChapterId;
  ctx: PlayerContext;
  finished?: boolean;
}

export async function runChapter(
  input: ChapterInput,
  ctx: PlayerContext,
): Promise<ChapterResult>;
```

The Twilio webhook calls `runChapter()`; the browser `/api/chat` calls `runChapter()`. Same engine.

---

## 8. Implementation order (next 90 minutes)

1. **`src/lib/orchestrator/prompts.ts`** — system prompt + 7 rubric prompts (cached). 30 min.
2. **`src/lib/orchestrator/claude.ts`** — Anthropic SDK wrapper with `cache_control` + JSON-mode + 5s soft timeout. 15 min.
3. **`src/lib/orchestrator/index.ts`** — replace heuristic stubs with real Claude calls per chapter (still falls back to heuristics if `ANTHROPIC_API_KEY` not set). 20 min.
4. **Smoke test** — `curl /api/chat` end-to-end one chapter. 5 min.
5. **Twilio sandbox round-trip** — Fanette's phone → real WA → real bot reply. 10 min (Fanette).
6. **Brief-guardian re-spawn** — final compliance check before submission. 10 min.

---

## 9. Honest about limits (per brief p.5)

- AI Tier 0–4 calibration is hackathon-grade, anchored against Ghana 2013 STEP. Production calibration requires 1000+ players × 6 months IRT.
- Mind + Storm chapters cut from MVP for time — Phase 2 ships them.
- Tribe chapter is self-attest in MVP; Phase 2 wires real attestor round-trip via Twilio webhook to a second number.
- Squad / hire-group integration is wa.me 1:1 deep-link in MVP (concierge bridges to employer). Phase 2 = Twilio Conversations API for dynamic group creation.
- O*NET task content lookup is hardcoded subset for the 4 demo ISCOs in MVP. Phase 2 = full O*NET 28+ ingest.

— end —
