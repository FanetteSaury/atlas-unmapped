# TASKS.md — Atlas time-boxed work list

> **Submission deadline: 2026-04-26 13:00 Paris.**
> **One commit per task.** Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).

Status legend: ⏳ pending · 🚧 in progress · ✅ done · ⏸ deferred · ✂️ cut from scope

> **CONTRACT FOR ALL AGENTS + FUTURE CLAUDE SESSIONS**: this file (`TASKS.md` at the repo root) is the canonical task list. The internal Claude Code TaskList is volatile (per-session, not persisted in git). Any task that should survive a session restart MUST land in this file. Agents read this file to know what's pending; they don't trust the in-session TaskList.

---

## 🆘 LIVE BOARD — 2026-04-26 ~11h11 Paris (sprint update)

**Plan locked Fanette 11:11 — parallel sprint then pitch:**

| Slot | Time | Owner | Task | Output |
|---|---|---|---|---|
| **P1** | 11:11 → 12:11 (1h) | **Paola** | Frontend polish + data verification → "NGO vibes": tighten copy, color/typography pass, verify every datum on `/policymaker` traces to a real source, swap any placeholder phrasing for NGO-officer voice | `/policymaker` + `/employer` look credibly NGO-grade |
| **P2** | 11:11 → 12:11 (1h, parallel) | **Fanette** | Research WhatsApp **group chat** wiring (1:1 is almost shipped). Decide: (a) Twilio Conversations API vs (b) hardcoded `chat.whatsapp.com/<invite>` link in Atlas Card. Output: 5-bullet decision note + 30-min impl spike if option (b) chosen | `atlas/docs/wa-group-decision.md` + impl plan |
| **P3** | 12:11 → 13:41 (1h30) | **Paola** | Pitch deck final + 90s script + handout + backup video record | Deck PDF + script.md + 90s.mp4 |

**Why group chat matters (Fanette context, 11:13):** *"the group chat is important because you need to understand the mentality in those countries"*. In Ghana / Bangladesh / Vietnam, **WhatsApp groups ARE the de facto labor market** — informal hiring happens in trade-specific groups (mechanics, tailors, devs), not on LinkedIn or job boards. The Atlas Card → group invite flow is therefore the **product-market fit moment**, not a polish detail: it's how a 23-year-old phone repair tech in Madina actually finds the next gig. Without it, Atlas is a credential that goes nowhere. With it, the credential plugs directly into the channel the user already lives on. **This is the wedge.**

**WA group chat — research scope for P2 (Fanette, 1h):**

1. **Option B (recommended hackathon path)**: Fanette pre-creates 1 WA group per country (Madina Phone Repair · Mirpur Tailors · Hà Nội Devs), 2-3 sample employer accounts in each. Hardcode invite link in `src/lib/config/squad-invites.json`. Atlas Card reveal sends `https://chat.whatsapp.com/<invite>` as last message. Disclose in HonestLimits: "Squad groups demo-grade; production = Twilio Conversations + verified-employer onboarding."
   - **Time**: 30 min create groups + 15 min wire links into Tribe completion + 15 min smoke
   - **Risk**: zero
   - **Demo wow**: judge taps link, joins real group, sees other members
2. **Option A (production path, NOT for this hackathon)**: Twilio Conversations API — `client.conversations.v1.conversations.create()` + `.participants.create({ messagingBinding: { address: 'whatsapp:+<phone>' } })`. Requires WA Business API number (Sandbox doesn't support multi-party). 2-3h minimum. **Cut.**

Decide at start of P2. If Option B → spend the hour creating groups + wiring + testing on Fanette's burner. If you find Option A is somehow tractable in <45min, escalate to manager before committing.

**P2-stretch (NOT priority, only if time allows after group-chat ships)**: port the 8-chapter game flow into WhatsApp end-to-end (currently the bot replies via `runChapter()` but the full game UX — measurement rail, hearts/gems, Atlas Card 8-message reveal — is browser-polished, WA-stubby). Stretch goal, not a gate. Manager will track as separate `P2b` item if Fanette green-lights.

---

### Earlier items (from prior live board, still relevant)

The 3 highest-priority active items as of 9h00. Now mostly resolved or queued.

### #15 — 🔴 PRIORITY 1 (Paola, 8:44 AM convo) — split policymaker from employer dashboards

> *Paola — 8:44 AM:* "Hello Fanette ! Merci d'avoir bossé autant c'est top ! Par contre il faut revenir en arrière pour le Dashboard employer et policy maker. Un mécanicien ou un patron de PME il ne doit pas avoir accès à des données comme ça — les données sont strictement réservées aux NGOs et au gouvernement. Ça n'a rien à faire ensemble et les deux stakeholders n'ont pas du tout le même but à venir sur le site. Chacun doit pouvoir se connecter avec son profil et les interfaces sont différentes."
>
> *Fanette — 8:47 AM:* "je suis d'acc — pour l'instant on a pas le temps de faire de l'authentification, enfin il faut que je me concentre sur whatsapp et toi sur le pitch. on va planifier les priorités tout à l'heure"
>
> *Paola — 8:48 AM:* "D'accord mais les dashboards doivent être différents et les données présentées aussi. Remettre ça comme avant c'est la priorité n°1."
>
> *Paola — 8:53 AM:* "Après si c'est des Dashboards séparés et qu'on est capable de voir que c'est séparé c'est la priorité."
>
> *Fanette — 8:55 AM:* "La donnée récupérée est notre vraie valeur 👍"

**Implementation (no auth for hackathon, just visual + structural separation):**

1. Restore `/policymaker` route as a separate page (currently folded into `/employer` Recruiter|Officer toggle)
2. `/employer` = SME / recruiter only — filter sidebar + map + list + 1:1 wa.me Contact button. Strip the role toggle. Header: *"SME / Recruiter Dashboard — find verified candidates near you"*
3. `/policymaker` = NGO / gov only — aggregate KPIs, AI Tier distribution chart, Frey-Osborne LMIC automation per ISCO, HCI score, Wittgenstein 2030 placeholder. **NO individual handles, NO contact CTAs.** Header: *"NGO / Program Officer Dashboard — country-level signals for cohort planning"*
4. Landing page: 3 distinct entry cards (Player / SME / NGO/Policymaker)
5. Reuse the existing `ProgramOfficerView` component at `atlas/src/app/employer/_components/ProgramOfficerView.tsx` — lift it to `atlas/src/app/policymaker/_components/PolicymakerDashboard.tsx`
6. Disclosure on `/policymaker`: *"This view is for verified NGO + government users. Production: SSO via WB Country Office credentials. Demo: open access."*

**Status:** ⏳ pending — manager picks up after WhatsApp validation green-lights

---

### #13 — 🟡 INTERVIEW PENDING — Report Card storage architecture

The orchestrator (`atlas/src/lib/orchestrator/index.ts`) builds the Atlas Card report at end of quest but does NOT persist it. `/api/wa/webhook` and `/api/chat` both return ephemeral results. **Fanette must answer 6 storage questions before any code lands.**

**Q1 — Backend storage layer**
- A) Vercel KV only (`card:<shareSlug>`, JSON, 30-day TTL) — simplest
- B) Vercel Postgres + Prisma (re-introduces ORM)
- C) Supabase (Postgres + auth + RLS, 1h setup)
- D) JSON files in repo (snapshot-only, not persistent)

**Q2 — Card share URL gating**
- Open link (anyone with slug)
- Signed token (HMAC, time-bound)
- Phone-bound (employer must prove phone before viewing)

**Q3 — Player handle linking**
- Phone hash (WhatsApp) — already done
- Web session ID localStorage — already done
- Email registration optional (Phase 2)
- No login at all — lose slug, lose card

**Q4 — PII vs pseudonymous**
- Pseudonymous only (handle + scores + ISCO + ward)
- + soft PII (language, age range, gender for /policymaker bias audit)
- + hard PII (phone hash, email hash, consent gate)

**Q5 — Retention**
- 30 days (KV TTL default)
- 6 months
- Indefinite + RGPD right-to-delete

**Q6 — Aggregate analytics for `/policymaker`**
- Live aggregation (query KV/Postgres at runtime)
- Pre-computed nightly snapshot (`data/aggregates/<country>.json`)
- Hybrid (last 24h live + older snapshot)

**Status:** ⏸ blocked on Fanette answering Q1-Q6 inline. Do NOT build storage logic until answered.

---

### #14 — 🔵 NOT NOW (Phase 2) — Big-5 OCEAN report + employer-view metrics

Atlas Card v2 should include the full Big-5 OCEAN profile (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) inferred from chapter answers via Claude scoring. Plus employer-view candidate cards should add small interesting metrics:

- response-time-per-chapter (decisiveness signal)
- word-count distribution (concreteness)
- code-switch frequency (multilingual ability)
- AI-Tier × wage projection delta vs market median
- female-LFP weight in cohort
- automation-risk × WDI-sector-growth crossover (the "is your job durable AND growing" quadrant)

**Constraint**: layered on `/employer` candidate cards only. `/policymaker` stays aggregate (per Paola's call).

**Status:** ⏸ deferred to Phase 2 — depends on storage architecture (#13) being resolved first.

---

## 🟢 ACTIVE SPRINT — 8h00 → 10h00 (Twilio validation hard gate)

**Goal:** real Claude orchestrator + Twilio Sandbox round-trip text + (optional) Whisper voice. Iterative deploys after each agent commit so Fanette can test live.

| # | When | Owner | Task | Files / Output | Hard gate |
|---|---|---|---|---|---|
| **A.1** | 8:00 → 8:10 | team-lead | Split GAME_PIPELINE.md → `atlas/docs/game/{01-flow,02-oracle,03-atlas-card,04-claude-prompts}.md` (~80 lines each, focused) | 4 new files | none |
| **A.2** | 8:00 → 8:10 (parallel) | **Fanette** | Twilio account + Sandbox claim + webhook URL = `https://atlas-mu-vert.vercel.app/api/wa/webhook` + note Account SID + Auth Token | Twilio creds in hand | 8:15 |
| **B.1** | 8:10 → 9:10 | **`claude-wirer` agent** | Real Claude orchestrator: `prompts.ts` (cached system + 7 rubric chunks) + `claude.ts` (SDK wrapper, JSON mode, 5s timeout) + `index.ts` (replace heuristic stubs, fallback if no API key) | 3 modified TS files | **9:10** |
| **B.2** | 8:10 → 8:25 (parallel) | **Fanette** | Vercel env vars: `ANTHROPIC_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WA_FROM=whatsapp:+14155238886`, `WA_PHONE_SALT` (`openssl rand -hex 32`) + provision Vercel KV (Storage tab) | env wired | 8:25 |
| **B.3** | 9:10 | team-lead | Review `claude-wirer`'s diff, build, preview deploy, ping Fanette to test | preview URL | — |
| **B.4** | 9:10 → 9:15 | Fanette | Test text round-trip on preview URL `/player` | ✅ or 🐛 | 9:15 |
| **🚦** | **9:15** | — | **GATE: if Phase B not green, ship text-only + skip Phase C** | — | — |
| **C.1** | 9:15 → 9:30 | **`voice-wirer` agent** | Whisper integration: `src/lib/wa/voice.ts` + 5-line patch to webhook to detect MediaUrl0 + audio + transcribe + pass to handler. Fallback "type instead" on error. | 1 new + 1 patched | 9:30 |
| **C.2** | 9:15 → 9:17 (parallel) | **Fanette** | Vercel env: `OPENAI_API_KEY=sk-...` (skip if voice cut) | env wired | — |
| **C.3** | 9:30 | team-lead | Review voice patch, deploy prod | live URL | — |
| **D.1** | 9:30 → 9:50 | **Fanette + team-lead** | LIVE smoke test: text Sandbox `START` → 3 round-trips text → 1 voice note → Atlas Card reveal | ✅ pipeline validated | **9:50** |
| **E.1** | 9:50 → 9:55 | team-lead | Re-spawn `brief-guardian` for Entry 2 review | ledger appended | — |
| **E.2** | 9:55 → 10:00 | team-lead | Final commit + push + status | clean main | 10:00 |

### ✅ Done in this sprint (commit refs)

- `27d34d9 feat(orchestrator): real Claude scoring + 3-hearts + ISCO/O*NET/STEP report card` — completes B.1 Claude wiring + game-feel feedback (3 hearts mechanic + story echoes + ISCO-rooted inventory) + report card rendering.
- `9a56206 wip: real Claude ISCO classification in handleOrigin` — earlier WIP, superseded.

### 🔥 Next concrete action (after Fanette wakes up / done with subway)

1. **Toi**: 14 Twilio + Vercel clicks per "## WhatsApp validation plan" in the chat history. ~10 min.
2. **Toi**: ping team-lead "go redeploy" once env vars set.
3. **Team-lead**: push current `main` (`27d34d9`) + `vercel --prod --yes`.
4. **Together**: live smoke test. Texts `START` from real WA → bot replies through 8 chapters → Atlas Card reveal in 8 staggered messages.
5. If green → commit `chore: twilio sandbox validated end-to-end`. If broken → debug via `vercel logs --follow` + `/api/wa/health`.

### Cuts already locked for this sprint (don't reopen)

- ✂️ Mind chapter (numeracy) — Phase 2
- ✂️ Storm chapter (socio-emotional) — Phase 2
- ✂️ Real attestor round-trip in Tribe — self-attest only
- ✂️ ILOSTAT live API ingest — hardcoded with citations is fine
- ✂️ STEP/O*NET/HCI/ILO Future of Work ingest — Phase 2
- ✂️ /player UI iteration — figé tel qu'en prod
- ✂️ /employer dashboard new features — figé

---

## 🟡 NEXT SPRINT — 10h00 → 12h00 (with Paola)

| # | Task | Owner |
|---|---|---|
| F.1 | Paola onboard via PRD.md + ATLAS_BRIEF.md + GAME_PIPELINE.md | Paola, 15 min |
| F.2 | Pitch deck draft (5 slides per ATLAS_BRIEF §8) | Paola |
| F.3 | 90-second demo script word-for-word (use PITCH_SCENARIO.md) | Paola |
| F.4 | One-pager handout PDF | Paola |
| F.5 | Backup demo video recorded (90s screen capture) | Paola |
| F.6 | If voice not done in sprint A: spawn `voice-wirer` here | team-lead |
| F.7 | Brief-guardian Entry 3 review post-deck | team-lead, 5 min |

---

## 🔴 FINAL SPRINT — 12h00 → 13h00 (submit)

| # | Task | Owner |
|---|---|---|
| G.1 | Smoke test all 3 surfaces on Vercel prod (landing + /employer + /player + /api/wa/webhook) | team-lead + Fanette |
| G.2 | Citation audit: click every `<DataSourceCitation>`, confirm live source URL | Fanette |
| G.3 | Brief-guardian final Entry (Entry 4) review, FLAGGED items resolved | team-lead, 5 min |
| G.4 | Final commit `chore: submission v1` + git tag `submission-v1` | team-lead |
| G.5 | Submit Hack-Nation form: GitHub URL + Vercel URL + deck PDF + 90s video | both |
| G.6 | Confirm submission timestamp before 13:00 | both |

---

## Orchestration simplifiée — token-preserving (locked Fanette 8h05)

> **Pas d'agents spawnés pendant ce sprint.** Manager (team-lead) écrit tout le code en main loop. Économie ~30-50k tokens vs agent-supervised pattern. Brief-guardian = re-spawn UNIQUEMENT à 9:55 pour Entry 2 review (~5 min budget).

**Manager iteration loop (pour chaque petit changement testable) :**
1. Manager écrit 1 fichier focalisé (ex: `prompts.ts` seul)
2. `pnpm tsc --noEmit && pnpm build` (fail-fast)
3. `pnpm dlx vercel --prod --yes` (deploy direct prod, skip preview pour aller vite)
4. Manager pings Fanette : "test https://atlas-mu-vert.vercel.app/player → tape GH"
5. Fanette teste ✅/🐛 → manager fix ou next
6. Commit après bundle de 2-3 fichiers, pas après chaque fichier (réduit le bruit git)

**Re-spawns autorisés** :
- `brief-guardian` à 9:55 (5 min, Entry 2 ledger review) — seul agent live de la fin du sprint
- Aucun autre agent avant 12h00 (sauf besoin urgent)

---

## Phase 0 — Tonight 2026-04-25 ~midnight → 01:00 (Fanette solo, ≤1h)

> **Goal:** Real Next.js app live on Vercel with the 6 docs in place, Postgres provisioned, committed, pushed, **then sleep**.

| # | Task | Owner | Status | Commit |
|---|---|---|---|---|
| 0.1 | `git init -b main` at repo root, `.gitignore`, git config user | Fanette | ✅ | (pre-commit) |
| 0.2 | Move `demo_v1/` to `atlas/public/_legacy/` (preserve narrative IP) | Fanette | ⏸ | kept at repo root; preserved as sibling |
| 0.3 | `pnpm create next-app atlas --ts --tailwind --app --src-dir` (Next.js 16.2.4) | Fanette | ✅ | a68169c |
| 0.4 | `pnpm add` runtime deps: `@anthropic-ai/sdk openai zod recharts react-leaflet leaflet twilio @prisma/client @vercel/kv` | Fanette | ✅ | a68169c |
| 0.5 | `pnpm add -D` dev deps: `prisma vitest @types/leaflet dotenv tsx` | Fanette | ✅ | a68169c |
| 0.6 | `pnpm exec prisma init` + Prisma 7 schema (PlayerRun, AtlasCard, Attestation) + `prisma.config.ts` | Fanette | ✅ | a68169c |
| 0.7 | Port `demo_v1/scripts/configs.js` → `atlas/src/lib/config/countries/{gh,bd,vn}.json` + Zod schema in `schema.ts` | Fanette | ✅ | a68169c |
| 0.8 | Port game enums (CHARACTERS, AI_TOOLS, ATLAS_CLASSES, AI_TIERS, WEAPONS, BONUS_GEMS, RIVAL_OF) → `atlas/src/lib/config/game/characters.ts` | Fanette | ✅ | a68169c |
| 0.9 | Write top-level docs: `README.md`, `CLAUDE.md`, `PRD.md`, `PIPELINE.md`, `TASKS.md`, `PLAN.md` | Fanette + Claude | ✅ | a68169c |
| 0.10 | Landing page (`atlas/src/app/page.tsx`) — 3-card React + Tailwind, brief table, stat row, phone mock | Fanette | ✅ | a68169c |
| 0.11 | `<HonestLimitsBanner>`, `<CountryToggle>`, `<DataSourceCitation>` | Fanette | ⏳ | Phase 2 |
| 0.12 | Init shadcn/ui + primitives | Fanette | ⏳ | Phase 2 (deferred — landing doesn't need shadcn yet) |
| 0.13 | **`gh repo create` + push to GitHub** (NEEDS HUMAN: choose public/private, run `gh repo create atlas-hacknation --private --source=. --push`) | Fanette | ⏳ | wake-up first action |
| 0.14 | **`vercel link` + provision Vercel Postgres** (NEEDS HUMAN: `pnpm dlx vercel login`, then dashboard → Storage → Create Postgres → `pnpm dlx vercel env pull atlas/.env.local`) | Fanette | ⏳ | wake-up |
| 0.15 | `pnpm exec prisma db push` to create tables on Vercel Postgres | Fanette | ⏳ | wake-up |
| 0.16 | `pnpm dlx vercel --prod` first deploy (placeholder landing) | Fanette | ⏳ | wake-up |
| 0.17 | Add `.github/workflows/ci.yml` — tsc + eslint + vitest on push | Fanette | ✅ | a68169c |
| 0.18 | Verify deployed URL renders. **Sleep.** | Fanette | ⏳ | wake-up checklist |

### ✅ State at end of Phase 0 (2026-04-26 ~00:45 Paris)

- `pnpm build` passes ✅
- `pnpm exec tsc --noEmit` passes ✅
- `pnpm lint` clean ✅
- `pnpm exec prisma validate` ✅
- First commit on `main`: `a68169c chore: scaffold next.js + postgres + initial docs`
- Local repo ready, just needs `gh repo create … --push` + Vercel wiring

### ☀️ Wake-up checklist (5 minutes, before 08:00)

1. `gh repo create atlas-hacknation --private --source=. --push`
2. `cd atlas && pnpm dlx vercel login` (browser auth)
3. `pnpm dlx vercel link` (link this dir to a new Vercel project)
4. Vercel dashboard → Storage → Create Postgres database → connect to project
5. `pnpm dlx vercel env pull .env.local` (fetches POSTGRES_PRISMA_URL et al.)
6. `pnpm exec prisma db push` (creates tables)
7. `pnpm dlx vercel --prod` (deploy)
8. Open the prod URL, see the landing page render. Then start Phase 1.

---

## Phase 1 — 2026-04-26 08:00 → 10:00 (Fanette solo, 2h)

> **Goal:** Close the 5 dataset gaps the brief-guardian flagged + wire Claude orchestrator + `/player` chapter 1.

### 🚨 Brief-guardian baseline (Entry 0, atlas/docs/COMPLIANCE_LEDGER.md)

VERDICT: ⚠️ flagged → GO with 5 dataset gaps to close.

**5 datasets MUST land on disk in Phase 1** (brief p.4–5 explicit, can't be silently omitted):

| # | Source | Why brief requires it |
|---|---|---|
| 1.A | **ILOSTAT** (live SDMX REST or bulk) | p.4 "primary real-world labor signal source" — wages by ISCO × country |
| 1.B | **HCI** (live REST one-liner: `api.worldbank.org/v2/country/{iso2}/indicator/HD.HCI.OVRL`) | p.4 — Human Capital Index |
| 1.C | **STEP** (Ghana-2013 anchor CSV from World Bank Microdata) | p.5 — only direct LMIC skill measurement |
| 1.D | **ILO Future of Work** task-content indices (committed CSV from ILO Future of Work datasets page) | p.5 — task routine vs non-routine, 40+ countries |
| 1.E | **O*NET 28+** task content per ISCO (committed LMIC subset CSV) | p.4 — taxonomy backbone |

Already staged (data-prestager): ILOSTAT ❌ · WDI ✅ · HCI ❌ · ISCO-08 ✅ · Wittgenstein ✅ · UN Pop 📋 · UNESCO UIS ✅ · Frey-Osborne ✅ · STEP ❌ · ILO FoW ❌ · ITU ✅ · O*NET ❌

| # | Task | Owner | Status | Commit |
|---|---|---|---|---|
| 1.1 | `scripts/ingest/ilostat.ts` — fetch wage by ISCO × country (live SDMX), write `data/lmic/ilostat/{country}.json` | Fanette | ⏳ | — |
| 1.2 | `scripts/ingest/wdi.ts` — sector growth, NEET, female LFP, GDP per cap (live REST) | Fanette | ⏳ | — |
| 1.3 | `scripts/ingest/wbes.ts` — firm skill gaps, hiring difficulty | Fanette | ⏳ | — |
| 1.4 | `scripts/ingest/findex.ts` — bulk CSV → JSON (committed) | Fanette | ⏳ | — |
| 1.5 | `scripts/ingest/wbl.ts` — gender legal score (committed CSV) | Fanette | ⏳ | — |
| 1.6 | `scripts/ingest/frey-osborne.ts` — paper supplementary CSV + ILO/WB LMIC reappraisal (committed) | Fanette | ⏳ | — |
| 1.7 | `scripts/ingest/wittgenstein.ts` — 2025–2035 cohort projections (committed JSON) | Fanette | ⏳ | — |
| 1.8 | `scripts/ingest/hci.ts` — Human Capital Index (live REST) | Fanette | ⏳ | — |
| 1.9 | `scripts/ingest/isco.ts` — ISCO-08 hierarchy (committed CSV) | Fanette | ⏳ | — |
| 1.10 | `scripts/ingest/onet.ts` — task content per ISCO (LMIC subset, committed) | Fanette | ⏳ | — |
| 1.11 | `scripts/ingest/all.ts` — parallel runner, `_meta.json` index | Fanette | ⏳ | — |
| 1.12 | `src/lib/lmic/{ilostat,wdi,wbes,findex,wbl,frey-osborne,wittgenstein,hci}.ts` — typed accessors | Fanette | ⏳ | — |
| 1.13 | `src/lib/lmic/index.ts` — unified `getX(country, isco) → { value, source, citation }` | Fanette | ⏳ | — |
| 1.14 | `src/lib/skills/{isco,onet,step}.ts` — taxonomy lookups | Fanette | ⏳ | — |
| 1.15 | `src/lib/orchestrator/prompts.ts` — system prompt + 8 chapter rubrics (cached, ~10k tokens) | Fanette | ⏳ | — |
| 1.16 | `src/lib/orchestrator/claude.ts` — SDK wrapper with prompt caching | Fanette | ⏳ | — |
| 1.17 | `src/lib/orchestrator/index.ts` — channel-agnostic `runChapter(input, ctx)` | Fanette | ⏳ | — |
| 1.18 | `src/app/api/chat/route.ts` — POST handler, Zod validation, persist to Postgres | Fanette | ⏳ | — |
| 1.19 | `src/app/api/score/route.ts` — port `scoring.js` rubrics to TS | Fanette | ⏳ | — |
| 1.20 | `src/app/api/skills/route.ts` — ISCO-08 + O*NET classification (Claude-driven) | Fanette | ⏳ | — |
| 1.21 | Smoke: 1 player run end-to-end via curl, verify Atlas Card with real ILOSTAT/WDI numbers | Fanette | ⏳ | — |
| 1.22 | Update `PIPELINE.md` with actual `fetchedAt` timestamps + per-source notes | Fanette | ⏳ | — |
| 1.23 | Commit `feat: real lmic data ingest + claude orchestrator + scoring api` | Fanette | ⏳ | — |

---

## Phase 2 — 2026-04-26 10:00 → 12:00 (Fanette + Paola, 2h)

> **Goal:** Three surfaces live with real data on Vercel. Paola starts the deck.

### Fanette (dev)

| # | Task | Status |
|---|---|---|
| 2.1 | `src/app/player/page.tsx` — React port of `player.html`. Components: `ChatBubble`, `MeasurementRail`, `OracleArena`, `AtlasCardModal`. Companion Select + Boss Fight 3-phase kept verbatim. State via Zustand. | ⏳ |
| 2.2 | `src/app/employer/page.tsx` — Leaflet heatmap (real OSM), 4 KPIs from `lib/lmic`, candidate list (Postgres aggregation, pseudonymized per privacy tier) | ⏳ |
| 2.3 | `src/app/policymaker/page.tsx` — Recharts: supply/demand × growth, AI-Tier dist, Frey-Osborne strip, WBL gauge, Wittgenstein 2030 | ⏳ |
| 2.4 | `<CountryToggle>` works across all 3 pages (URL param `?country=GH|BD`) | ⏳ |
| 2.5 | `<HonestLimitsBanner>` + `<DataSourceCitation>` on every chart and Atlas Card field | ⏳ |
| 2.6 | `vercel --prod` deploy v2 | ⏳ |
| 2.7 | Commit `feat: player + employer + policymaker pages with live lmic data` | ⏳ |

### Paola (marketer)

| # | Task | Status |
|---|---|---|
| 2.8 | Pitch deck draft (5 slides per ATLAS_BRIEF §8): problem · wedge · demo · methodology · ask | ⏳ |
| 2.9 | 90-second demo script word-for-word | ⏳ |
| 2.10 | One LMIC youth interview if available (cousin / NGO contact) | ⏳ |

---

## Phase 3 — 2026-04-26 12:00 → 14:00 (Fanette + Paola, 2h)

> **Goal:** Differentiator polish + WhatsApp + voice + offline-graceful UX. **Cut anything that risks the 14:00 freeze.**

### Fanette

| # | Task | Status |
|---|---|---|
| 3.1 | `src/app/api/wa/webhook/route.ts` — Twilio Sandbox WhatsApp adapter (parse TwiML, call `runChapter`, reply via Twilio SDK) | ⏳ |
| 3.2 | Add a "Live WhatsApp Mode" toggle on `/player` that shows the Twilio sandbox QR | ⏳ |
| 3.3 | `src/app/api/voice/route.ts` — Whisper STT on audio blobs from `/player` mic button | ⏳ |
| 3.4 | **Offline-graceful UX**: pre-fetch chapter prompts at quest start, queue messages when offline, show "📵 syncing when network returns" indicator, sync on reconnect | ⏳ |
| 3.5 | `src/lib/privacy.ts` + `<PrivacyTierBadge>` — 3-tier resolution by country × gender (WBL-driven) | ⏳ |
| 3.6 | Mobile responsive pass on all 3 surfaces; country swap < 30s on stage | ⏳ |
| 3.7 | `vercel --prod` deploy v3 | ⏳ |
| 3.8 | Commit `feat: twilio sandbox whatsapp + whisper stt + privacy tiers + offline-graceful` | ⏳ |

### Paola

| # | Task | Status |
|---|---|---|
| 3.9 | Pitch deck final + speaker notes | ⏳ |
| 3.10 | Backup demo video recorded (90s, screen-recorded from Vercel prod) | ⏳ |
| 3.11 | One-pager handout PDF | ⏳ |

---

## Phase 4 — 2026-04-26 14:00 → 15:00 (both, 1h)

> **Goal:** Submit, with insurance.

| # | Task | Status |
|---|---|---|
| 4.1 | Smoke test: full player run on Vercel prod (no console errors) | ⏳ |
| 4.2 | Smoke test: country swap (GH ↔ BD) end-to-end | ⏳ |
| 4.3 | Smoke test: Twilio Sandbox WhatsApp from a real phone | ⏳ |
| 4.4 | **Citation audit**: click every `<DataSourceCitation>`, confirm live source URL resolves | ⏳ |
| 4.5 | Final commit `chore: submission v1` + git tag `submission-v1` + push | ⏳ |
| 4.6 | Submit to Hack-Nation: GitHub repo URL + Vercel prod URL + deck PDF + 90s backup video | ⏳ |
| 4.7 | Confirm submission received (timestamp before 15:00) | ⏳ |

---

## Cuts already made (and why)

The brief warns explicitly: *"weak submissions overengineer the tech stack"* (p. 5). Each cut below frees time for UX + real-data + real-Claude work — the things judges actually see.

- ✂️ **No ESCO** — user-killed (Eurocentric, doesn't fit LMIC). ISCO-08 + O*NET + STEP only.
- ✂️ **No Postgres + Prisma** — replaced by Vercel KV (Redis) + JSON cache. Saves ~2h Phase 0 (provisioning, schema migrations, Vercel env wiring) for hackathon-ephemeral persistence. Postgres → Phase 2 production.
- ✂️ **No shadcn/ui** — Tailwind v4 plain divs are enough. Saves ~30 min Phase 0 setup + zero loss in look-and-feel.
- ✂️ **No react-leaflet / Leaflet** — replaced by CSS grid of wards with hover/click tooltips. Saves ~1h Phase 2; demo-friendlier than a real geo-map at stage.
- ✂️ **No Vitest** in v1 — manual smoke checklist before submit. Saves ~30 min Phase 1 setup. Tests → Phase 2.
- ✂️ **No TS ingest scripts** — replaced by Python ingest (lead dev's terrain). Same JSON output read by TS frontend.
- ✂️ **No Meta WhatsApp Cloud API** — verification risk too high in 8h. Twilio Sandbox is the demo path.
- ✂️ **No TTS** — accent quality risk for Twi/Bengali. Whisper STT only.
- ✂️ **No on-device LLM in hackathon scope** — packaging a 1-2GB model in a native app is 6h+ of new tooling. Addressed via offline-graceful UX (network-resilience demo trick) + slide architecture instead. Roadmap Phase 2.
- ✂️ **No SMS adapter** — Twilio supports it, same orchestrator engine, but +2h work for 0 stage-demo ROI. Architecture diagram only. Roadmap Phase 2.
- ✂️ **No auth/login** — pseudonymous handle + phone hash for attestor.
- ✂️ **No "Use sample" cheat buttons** — every chapter goes through Claude live.

## Adds from `demo_v1/TODO.docx` (Paola's v1 review pass)

Wired into the phases:

- ➕ **WhatsApp · Ajout à un groupe** (P3) — Twilio Group API call on Tribe completion → 🤝 SQUAD reveal payoff
- ➕ **Lisibilité jargon skills** (P2) — plain-language labels everywhere, code as tooltip
- ➕ **Map clusters + click-to-see-user** (P2) — CSS grid of wards with hover/click tooltips and pseudonymous candidate previews
- ➕ **Skills list filters/search** (P2) — search bar + chip filters on /employer
- ➕ **Shared-devices UX** (P3) — "Clear my data" button, anonymous-handle toggle, session timeout, disclosure banner

---

## Risk flags (revisit at every phase boundary)

| Risk | Watch for | Cut path |
|---|---|---|
| ILOSTAT / WBES API down | Phase 1.1, 1.3 fail | Bulk CSV fallback. P0 = ILOSTAT + WDI + Frey-Osborne + WBL only. |
| Phase 1 runs past 10:00 | At 09:30, count remaining ingest scripts | Cut WBES, Findex, HCI, ITU, UIS to P1 (Phase 3 if time) |
| Vercel build fails on push | CI red | Hot-fix, redeploy. First deploy in Phase 0 catches most issues. |
| Twilio Sandbox webhook fails on stage | Phase 4.3 fails | Demo browser simulator only. Architecture diagram explains real pipe. |
| Claude rate limit during demo | 429 from Anthropic | Pre-warm cache, exponential backoff retry. Backup video has clean run. |
| Paola arrives 10:00 with no context | Briefing | PRD.md + ATLAS_BRIEF.md + 5-slide outline = 10-min onboard |
