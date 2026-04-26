# TASKS.md — Atlas time-boxed work list

> **Submission deadline: 2026-04-26 15:00 Paris.**
> **One commit per task.** Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).

Status legend: ⏳ pending · 🚧 in progress · ✅ done · ⏸ deferred · ✂️ cut from scope

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
| 2.4 | `<CountryToggle>` works across all 3 pages (URL param `?country=GH|BD|VN`) | ⏳ |
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
| 4.2 | Smoke test: 3 country swaps (GH ↔ BD ↔ VN) end-to-end | ⏳ |
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
- ✂️ **No TTS** — accent quality risk for Twi/Bengali/Vietnamese. Whisper STT only.
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
