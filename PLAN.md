# Atlas — Hack-Nation × World Bank UNMAPPED — Execution Plan

> **Submission deadline: Sun 2026-04-26 at 15:00 Paris.**
> **Effective dev time: ~8h Fanette (1h tonight + 7h tomorrow), Paola joins 10:00.**
> **Mandate: real project, real LMIC data, shipped on Vercel — win this.**

> **Team profile (load-bearing for stack choice):**
> **Lead dev** — comfortable with Python + relational-DB ETL, log debugging, public speaking. **Real Postgres / ETL experience → DB stack reflects this.**
> **Marketing lead** — joins 2026-04-26 10:00 Paris, owns pitch deck + 90s script + handouts + design polish.

---

## 0. Context

We have a working static-HTML demo (`demo_v1/`) with a strong narrative (`ATLAS_BRIEF.md`), brief-aligned 3-surface architecture, and real-data citations — but the orchestration is hard-coded, the skills mapping uses a toy ESCO subset, and the LMIC econometrics are pre-cached. The user said it bluntly: **"we need not something vibe-coded but a real project"** and **"answering the job-to-be-done and the data is the most important thing."**

The plan is: keep the demo's IP (game design, country JSON shape, scoring rubrics, narrative), throw away the static HTML, and ship a real Next.js app on Vercel with:
- Real LMIC data fetched live from official APIs (ILOSTAT, WDI, WBES, Findex) and cached at build time, plus paper-based datasets (Frey-Osborne, STEP, WBL, Wittgenstein) downloaded and committed
- Real Claude-driven chapter orchestrator with prompt caching
- Real skills mapping built on **ISCO-08 + O*NET task content (LMIC-adapted) + STEP rubrics** — no ESCO (Eurocentric, doesn't fit LMIC informal-sector reality)
- Real WhatsApp pipe via Twilio Sandbox (P1, after JTBD + data done)
- All three surfaces (Player Quest · Employer · Policymaker) on one configurable backend, country-swap demo (GH ↔ BD ↔ VN)

The demo cheats (hardcoded "use sample" buttons, fake 2.2s witness delay, made-up ESCO codes, mock candidate lists) all get removed. The world-class IP — the Companion Select, the Oracle Boss Fight, the Atlas Card 4-reveal, the 3-tier privacy with country-aware defaults — stays verbatim.

---

## 1. Locked Decisions

| Area | Choice | Why |
|---|---|---|
| **Frontend + backend** | Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui | Single repo, single deploy, single language. ING1-debuggable. "Real project" credibility for judges. |
| **Hosting** | Vercel | User locked it ("shipped on vercel"). Native Next.js. Free hobby tier handles hackathon traffic. |
| **LLM** | Claude Sonnet 4.6 via `@anthropic-ai/sdk` with prompt caching | Per `claude-api` skill guidance and `CLAUDE.md` system note. Strong reasoning for AI-Tier scoring. Cache the system prompt + chapter rubrics → ~90% token reduction. |
| **Skills taxonomy** | ISCO-08 (ILO) + O*NET 28 task content (LMIC-adapted) + STEP rubrics | User correction: **no ESCO**. ISCO-08 is the universal ILO standard. O*NET task content is widely adapted for LMIC per the brief (Page 5). STEP is the only direct LMIC skill measurement dataset. |
| **Econometrics** | ILOSTAT (live SDMX/REST) · WDI (live REST) · WBES (live indicators API) · Findex 2024 · WBL 2024 · Frey-Osborne + ILO/WB LMIC reappraisal · Wittgenstein 2025–2035 · UNESCO UIS · ITU Digital · Human Capital Index | Same sources the demo cites, but real numbers fetched from real endpoints. ≥4 signals surfaced visibly per brief. |
| **Persistence** | **Vercel Postgres + Prisma** for player runs, Atlas Cards, attestations + aggregation queries (employer / policymaker GROUP BYs). JSON cache files (committed) for the LMIC econometric snapshots. Vercel KV optional for chapter-state hot-cache. | Lead dev has real Python + PostgreSQL ETL background — Postgres is in-wheelhouse, not a debug rabbit-hole. Real SQL aggregation makes the employer/policymaker dashboards substantively credible to World Bank judges (real GROUP BY over real Atlas Cards). Prisma's TS types + autocomplete keep it tight. Setup is `vercel postgres create` + `prisma db push` ≈ 15 min. |
| **WhatsApp** | Browser WA simulator (P0) + Twilio Sandbox webhook (P1) | See §2 below. |
| **Voice** | OpenAI Whisper STT (one-way, P1) | User picked. Skip TTS — accent quality risk for Twi/Bengali. |
| **Maps** | react-leaflet + OpenStreetMap | Real geo, no API key, no rate limit. |
| **Charts** | Recharts | shadcn-friendly, ships fast, real responsive SVG. |
| **Validation** | Zod on every API boundary | Type-safe, error messages are readable, plays well with Prisma types. |
| **Cyber/privacy story** | 3-tier privacy resolver (WBL 2024 + WGI rule-of-law) baked into a real middleware, GBV-aware safeguarding for restrictive countries, signed Atlas Card share URLs, hashed phone for attestor identity | Lead dev's cybersecurity background is a demo strength, not just compliance. World Bank judges care about safeguarding for female users in BD/PK/IR. We lead with this. |
| **Repo** | GitHub, conventional commits, every phase = at least one commit | User mandate: "always iterate using git". |
| **CI** | GitHub Actions: `tsc --noEmit` + `eslint` + `vitest` (smoke only) | Cheap insurance. Fails fast. |
| **Lint/format** | ESLint + Prettier (Next.js defaults) | No config bikeshedding. |

---

## 2. WhatsApp Integration — How, Why, Time

User asked: *"the whatsapp integration is key. can it be done in the timeframe? what are the different ways to do it?"*

### Three real options

| Option | What it is | Setup time | Stage demo risk | ING1-debuggable? |
|---|---|---|---|---|
| **A. Browser WA simulator** | A React page that LOOKS exactly like WhatsApp Web (already exists in `demo_v1/player.html`), runs as `/player` on Vercel | 0h (port from existing) | None | Trivial — just React + browser dev tools |
| **B. Twilio Sandbox WhatsApp** | Free Twilio sandbox number; user texts `join <code>` from any phone, then a real WhatsApp message hits our Next.js webhook | 1.5–2h | Low — Twilio console shows every message in/out | Easy — Twilio dashboard logs every payload, Vercel logs every webhook |
| **C. Meta WhatsApp Cloud API** | Production Meta API. Requires Meta Business verification + phone provisioning + Webhook setup | 3–4h with non-zero failure | Medium — verification can stall | Hard — Meta Developer console is dense |

### Recommendation: A + B (hybrid)

- **A is the stage demo.** It works 100% of the time, looks identical to real WhatsApp, no network dependency. We screen-record it for the backup video.
- **B is the proof.** During Q&A, if a judge asks "is this real WhatsApp?", we hand them a phone, they text our Twilio number, the bot replies live. The whole pipeline is the same engine — only the I/O adapter changes.
- **Same orchestrator, two channels.** `src/lib/orchestrator/index.ts` exposes `runChapter(input, context)`. Two thin adapters call it: `src/app/api/chat/route.ts` (browser POST) and `src/app/api/wa/webhook/route.ts` (Twilio webhook, parses TwiML, replies via Twilio SDK).

### Why Twilio Sandbox over Meta Cloud API for ING1 + 8h

- Twilio sandbox requires only a free Twilio account (5 min) + 1 webhook URL configured in their console (1 click). Meta requires a Business Manager account, app registration, phone number purchase or test number request, webhook verification, message templates approval.
- Twilio's developer experience is significantly better for a beginner — every request is logged with full payload visibility, errors are clear, retries are documented.
- We disclose in README that production deployment uses Meta Cloud API; Twilio sandbox is the demo-grade transport. Honest-about-limits, per the brief.

### Yes, it can be done in the timeframe

- Phase 0 tonight: 0 min on WhatsApp.
- Phase 2 morning: 1h porting the existing browser simulator to React (ships P0).
- Phase 3 afternoon: 1.5h wiring Twilio Sandbox (ships P1, only if JTBD + data are nailed by 12pm).
- If we're behind by 12pm, we cut Twilio and ship A only. The architecture diagram in README still shows the full pipe.

---

## 3. Architecture

```
                         atlas (monorepo, single Next.js app)
                         ─────────────────────────────────────
                                       /
                                       │
        ┌──────────────────────────────┼───────────────────────────────┐
        │                              │                               │
   src/app/player              src/app/employer               src/app/policymaker
   (WhatsApp-style chat,       (heatmap + KPIs +              (aggregate dashboard +
    React Server +             candidate list,                 Recharts + Wittgenstein
    Client Components)         Leaflet map)                    2030 projections)
        │                              │                               │
        └──────────────────────────────┼───────────────────────────────┘
                                       │
                              src/app/api (route handlers)
                              ┌────────┴─────────┐
                              │                  │
                       /api/chat          /api/wa/webhook
                       (browser)          (Twilio Sandbox)
                              │                  │
                              └────────┬─────────┘
                                       │
                            src/lib/orchestrator
                       (Claude Sonnet 4.6 + prompt cache)
                                       │
              ┌────────────────────────┼─────────────────────────┐
              │                        │                         │
       src/lib/scoring         src/lib/skills            src/lib/lmic
       (STEP-equiv rubrics,    (ISCO-08 lookup,          (typed accessors over
        AI-Tier composite,     O*NET task content,        cached LMIC data:
        ports demo logic)      STEP anchors)              ILOSTAT, WDI, WBES,
                                                          Findex, WBL, Frey-Osborne,
                                                          Wittgenstein, HCI, UIS, ITU)
                                       │
                              ┌────────┴─────────┐
                              │                  │
                       Vercel KV         data/lmic/*.json
                       (player runs,      (built by scripts/ingest/*,
                        Atlas Cards,       committed to repo,
                        attestations)      cited per source)

                              src/lib/config/countries
                              (gh.json, bd.json, vn.json,
                               + new: ng.json, ke.json, ph.json
                               for country-swap depth)

                       Vercel Postgres (Prisma)
                       ────────────────────────
                       PlayerRun · AtlasCard · Attestation
                       (real SQL GROUP BY for employer +
                        policymaker dashboards)
```

### Data flow for a player run

1. Player loads `/player?country=GH` — server reads `config/countries/gh.json`, picks a Companion (Sage/Spark/etc.), seeds chapter context, creates a `PlayerRun` row in Postgres.
2. Player message → `/api/chat` POST → `runChapter()` → Claude Sonnet 4.6 with cached system prompt (~10k tokens) + per-call chapter rubric + player turn → returns next assistant message + score deltas.
3. Score deltas updated on `PlayerRun` row; UI updates measurement rail. Optional Vercel KV hot-cache for chapter-state to keep request latency low (Postgres is the source of truth).
4. End of Tribe chapter → compute `AtlasCard`: ISCO-08 assignment, AI-Tier 0–4, real ILOSTAT wage for ISCO × country (from `lmic` accessor), real WDI sector growth, real Frey-Osborne risk, Atlas Class. Persist `AtlasCard` row with signed share URL.
5. Employer + Policymaker pages run **real SQL aggregations** over `AtlasCard` (last N filtered by country, ISCO, ward) + read LMIC cache → render KPIs + maps + charts. Country toggle re-reads cache + re-queries Postgres for the new country, no rebuild.

---

## 4. Repository Layout

```
atlas/                              # new Next.js root, will replace demo_v1 as primary
├── .github/workflows/ci.yml        # tsc + eslint + vitest
├── .env.example                    # ANTHROPIC_API_KEY, OPENAI_API_KEY (whisper),
│                                   # TWILIO_*, KV_*, NEXT_PUBLIC_DEFAULT_COUNTRY
├── .gitignore
├── CLAUDE.md                       # next-Claude-session guide (stack, conventions, commit policy)
├── README.md                       # overview, run, deploy, brief compliance, honest limits
├── PRD.md                          # JTBD, user stories, scope/non-goals, success metrics
├── PIPELINE.md                     # data ingest spec: sources, schemas, refresh, citations
├── PLAN.md                         # this plan, mirrored
├── TASKS.md                        # time-boxed task list (now → 1am → 8am → 10am → 12pm → 2pm → 3pm)
├── package.json                    # pnpm workspace
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── components.json                 # shadcn
├── public/
│   ├── _legacy/                    # the original demo_v1 HTML, preserved for reference
│   └── og.png
├── src/
│   ├── app/
│   │   ├── layout.tsx              # root, brand bar
│   │   ├── page.tsx                # landing (3 entry cards, brief table, stat row)
│   │   ├── player/
│   │   │   ├── page.tsx            # Server Component shell
│   │   │   └── _components/        # ChatBubble, MeasurementRail, AtlasCardModal, OracleArena
│   │   ├── employer/
│   │   │   └── page.tsx
│   │   ├── policymaker/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── chat/route.ts       # browser channel
│   │       ├── wa/webhook/route.ts # Twilio Sandbox channel
│   │       ├── score/route.ts
│   │       ├── skills/route.ts     # ISCO-08 + O*NET classification
│   │       ├── voice/route.ts      # Whisper STT
│   │       └── card/[id]/route.ts  # Atlas Card share link
│   ├── lib/
│   │   ├── orchestrator/
│   │   │   ├── index.ts            # runChapter(input, ctx) — channel-agnostic
│   │   │   ├── prompts.ts          # system prompt + chapter rubrics (cached)
│   │   │   └── claude.ts           # SDK wrapper with prompt caching
│   │   ├── scoring/
│   │   │   ├── inventory.ts        # AI-tools breadth
│   │   │   ├── origin.ts           # ISCO seed + narrative cognition
│   │   │   ├── forge.ts            # technical depth + grit
│   │   │   ├── mind.ts             # numeracy
│   │   │   ├── heart.ts            # socio-emotional
│   │   │   ├── oracle.ts           # AI-Tier composite (Intel + Loadout + Duel)
│   │   │   ├── future.ts           # openness + transfer reasoning
│   │   │   └── tribe.ts            # network density + trust tier
│   │   ├── skills/
│   │   │   ├── isco.ts             # ISCO-08 hierarchy + lookups
│   │   │   ├── onet.ts             # O*NET task content per ISCO (LMIC-adapted)
│   │   │   └── step.ts             # STEP rubric anchors
│   │   ├── lmic/
│   │   │   ├── ilostat.ts          # wage by ISCO × country, employment
│   │   │   ├── wdi.ts              # GDP, NEET, sector growth, female LFP
│   │   │   ├── wbes.ts             # firm-level skill gaps
│   │   │   ├── findex.ts           # mobile money, digital inclusion
│   │   │   ├── wbl.ts              # gender legal score
│   │   │   ├── frey-osborne.ts     # automation risk + ILO/WB LMIC reappraisal
│   │   │   ├── wittgenstein.ts     # education projections 2025–2035
│   │   │   ├── hci.ts              # Human Capital Index
│   │   │   └── index.ts            # unified accessor by (country, isco)
│   │   ├── db/
│   │   │   ├── schema.prisma       # PlayerRun, AtlasCard, Attestation models
│   │   │   ├── client.ts           # Prisma singleton (Vercel-safe)
│   │   │   └── queries.ts          # typed aggregations (employer/policymaker)
│   │   ├── config/
│   │   │   ├── countries/
│   │   │   │   ├── gh.json         # Ghana
│   │   │   │   ├── bd.json         # Bangladesh
│   │   │   │   ├── vn.json         # Vietnam
│   │   │   │   ├── ng.json         # Nigeria (depth)
│   │   │   │   ├── ke.json         # Kenya (depth)
│   │   │   │   └── ph.json         # Philippines (depth)
│   │   │   └── schema.ts           # Zod schema for country config
│   │   ├── kv.ts                   # Vercel KV client (chapter-state hot cache, optional)
│   │   ├── privacy.ts              # 3-tier resolution by country × gender (WBL-driven)
│   │   ├── safeguarding.ts         # GBV-aware route gating, country-aware blocking
│   │   ├── crypto.ts               # phone hash, Atlas Card signing
│   │   └── types.ts                # PlayerRun, AtlasCard, Measurement, etc.
│   ├── components/
│   │   ├── ui/                     # shadcn primitives
│   │   ├── CountryToggle.tsx
│   │   ├── HonestLimitsBanner.tsx
│   │   ├── DataSourceCitation.tsx  # inline source link
│   │   └── PrivacyTierBadge.tsx
│   └── styles/globals.css
├── data/
│   └── lmic/                       # JSON cache, committed; rebuilt by `npm run ingest`
│       ├── ilostat/{gh,bd,vn,...}.json
│       ├── wdi/{gh,bd,vn,...}.json
│       ├── wbes/{gh,bd,vn,...}.json
│       ├── findex/{gh,bd,vn,...}.json
│       ├── wbl/{gh,bd,vn,...}.json
│       ├── frey-osborne/global.json + lmic-reappraisal.json
│       ├── wittgenstein/{gh,bd,vn,...}.json
│       ├── hci/{gh,bd,vn,...}.json
│       └── _meta.json              # last-fetched timestamps + source URLs
├── scripts/
│   └── ingest/
│       ├── ilostat.ts
│       ├── wdi.ts
│       ├── wbes.ts
│       ├── findex.ts
│       ├── wbl.ts
│       ├── frey-osborne.ts
│       ├── wittgenstein.ts
│       ├── hci.ts
│       ├── isco.ts
│       ├── onet.ts
│       └── all.ts                  # parallel runner, called by `npm run ingest`
└── tests/
    ├── orchestrator.test.ts        # smoke
    ├── scoring.test.ts             # 1 test per rubric, golden-input
    └── lmic-accessors.test.ts      # cache shape contract
```

---

## 5. Phase-by-Phase Plan (time-boxed, every phase ends in a commit)

### Phase 0 — Tonight, now → 01:00 Paris (≤1h, Fanette solo)

**Goal:** Real Next.js app live on Vercel with the 6 docs in place, Postgres provisioned, committed and pushed.

1. Initialize git + GitHub repo at project root (`/home/topgun/hackathon/hacknation-5th/202604_Hack_Nation`).
2. Move `demo_v1/` to `atlas/public/_legacy/` (preserved for reference, not served).
3. `pnpm create next-app atlas --ts --tailwind --app --src-dir`.
4. `pnpm dlx shadcn@latest init`, install: button, card, dialog, badge, input, tabs, scroll-area, sonner.
5. Install: `@anthropic-ai/sdk`, `openai`, `zod`, `@vercel/kv`, `prisma`, `@prisma/client`, `recharts`, `react-leaflet`, `leaflet`, `twilio` (deferred config).
6. `pnpm prisma init`. Define `PlayerRun`, `AtlasCard`, `Attestation` models in `schema.prisma` (light: just enough fields for Phase 2 dashboards).
7. `vercel link`, then in Vercel dashboard provision **Vercel Postgres** + pull env vars (`pnpm dlx vercel env pull .env.local`). Run `pnpm prisma db push` against the dev branch DB.
8. Port `demo_v1/scripts/configs.js` → `atlas/src/lib/config/countries/{gh,bd,vn}.json` + `schema.ts` Zod schema.
9. Drop in landing page (`/`) — keep the 3-card layout from `index.html`, port to React.
10. Write the 6 docs (CLAUDE.md, README.md, PRD.md, PIPELINE.md, TASKS.md, PLAN.md) — Phase-0 sections complete, Phase-1+ as scaffolds.
11. `vercel --prod` first deploy (placeholder landing + Postgres connected).
12. Conventional commit: `chore: scaffold next.js + postgres + initial docs`. Push.
13. Verify: deployed URL renders, 3 cards visible, country toggle reads from JSON, `prisma studio` shows empty tables. Sleep.

**Commit checkpoint:** `chore: scaffold next.js + postgres + initial docs`

### Phase 1 — Tomorrow 08:00 → 10:00 Paris (2h, Fanette solo)

**Goal:** Real LMIC data on disk + Claude orchestrator answering chapter prompts locally.

1. Build `scripts/ingest/*.ts`:
   - **ILOSTAT** — SDMX REST endpoint `https://www.ilo.org/sdmx/rest/data/...` for wage by ISCO × country. Fall back to bulk CSV download if API rate-limited.
   - **WDI** — `https://api.worldbank.org/v2/country/{iso2}/indicator/{ind}?format=json` for sector growth, NEET, GDP per cap, female LFP.
   - **WBES** — `https://api.enterprisesurveys.org/api/indicator/all/{iso3}` for skill gaps, hiring difficulty.
   - **Findex 2024** — Bulk CSV from `https://www.worldbank.org/en/publication/globalfindex/Data` (committed to repo).
   - **WBL 2024** — Bulk CSV from `https://wbl.worldbank.org/en/wbl-data` (committed).
   - **Frey-Osborne** — Original 2013 paper supplementary CSV + ILO/WB 2018 LMIC reappraisal (committed, with citation file).
   - **Wittgenstein** — `http://dataexplorer.wittgensteincentre.org/wcde-v3/` JSON downloads per country (committed).
   - **HCI** — `https://api.worldbank.org/v2/country/{iso2}/indicator/HD.HCI.OVRL?format=json`.
   - **ISCO-08** — ILO hierarchy CSV (committed).
   - **O*NET** — public bulk download `https://www.onetcenter.org/database.html` (release 28+, LMIC-relevant subset committed).
2. All write to `data/lmic/{source}/{country}.json` with `{ data, source: { name, url, license, fetchedAt }, citation }`.
3. `pnpm ingest` runs all in parallel via `Promise.all`. Failures don't block other sources (write `_status.json` per source).
4. `src/lib/lmic/index.ts` — typed accessors: `getWage(country, isco)`, `getSectorGrowth(country, sector)`, `getAutomationRisk(country, isco)`, etc. Return `{ value, source, citation }` so the UI can always render the source link.
5. `src/lib/orchestrator/prompts.ts` — system prompt + chapter rubrics (~8–10k tokens, marked `cache_control: ephemeral`).
6. `src/lib/orchestrator/claude.ts` — SDK wrapper using Sonnet 4.6, prompt caching enabled, stream-friendly.
7. `src/app/api/chat/route.ts` — POST handler validates with Zod, calls `runChapter`, persists run to KV, returns assistant message + score deltas.
8. `src/app/api/score/route.ts` — port `scoring.js` STEP-equivalent rubrics to TS, one module per chapter.
9. `src/app/api/skills/route.ts` — ISCO-08 + O*NET task-content classification, takes player narrative + Claude reasoning, returns ISCO code + confidence + adjacent skills.
10. Smoke test from CLI: 1 player run end-to-end, verify Atlas Card with real ILOSTAT/WDI numbers.
11. Update PIPELINE.md with actual fetch timestamps + per-source citation block.

**Commit checkpoint:** `feat: real lmic data ingest + claude orchestrator + scoring api`

### Phase 2 — 10:00 → 12:00 (2h, Fanette + Paola)

**Goal:** Three surfaces live with real data on Vercel. Paola begins the deck.

**Fanette:**
1. `src/app/player/page.tsx` — React port of `player.html`. Components: `ChatBubble`, `MeasurementRail`, `OracleArena`, `AtlasCardModal`. State managed client-side (Zustand or `useReducer`), syncs to KV via `/api/chat`. Companion Select kept verbatim (Sage/Spark/Zuri/Kira/Scout/Ember). Boss Fight 3-phase mechanic kept verbatim.
2. `src/app/employer/page.tsx` — Heatmap (Leaflet, real OSM tiles), 4 KPIs from `lmic/*` accessors, candidate list aggregated from KV runs (pseudonymized per privacy tier).
3. `src/app/policymaker/page.tsx` — Recharts: supply vs demand × growth, AI-Tier distribution from KV runs, Frey-Osborne strip, WBL gauge, Wittgenstein 2030 projection. Country toggle live.
4. `CountryToggle` works across all 3 pages (URL param `?country=GH|BD|VN`).
5. `HonestLimitsBanner` + `DataSourceCitation` on every chart and Atlas Card field.
6. `vercel --prod` deploy v2.

**Paola:**
1. Pitch deck draft (5 slides per ATLAS_BRIEF §8): problem · wedge · demo · methodology · ask.
2. 90-second demo script word-for-word.
3. One real LMIC youth interview if possible (cousin / NGO contact).

**Commit checkpoint:** `feat: player + employer + policymaker pages with live lmic data`

### Phase 3 — 12:00 → 14:00 (2h, Fanette + Paola)

**Goal:** Differentiator polish + WhatsApp + voice. **Cut anything that risks the 14:00 freeze.**

1. **Twilio Sandbox WhatsApp** (~1h):
   - Create Twilio account, claim sandbox number.
   - `src/app/api/wa/webhook/route.ts` — parse incoming TwiML, call `runChapter`, reply via Twilio SDK.
   - Configure webhook URL in Twilio console pointing to Vercel prod.
   - Test live: text `join <code>` from Fanette's phone, send a message, verify orchestrator reply.
   - Add a "Live WhatsApp Mode" toggle on `/player` that shows the Twilio phone QR.
2. **Whisper STT** (~30min):
   - `src/app/api/voice/route.ts` — accepts audio blob, sends to OpenAI Whisper, returns transcript.
   - Hook a mic button into `ChatBubble` for the Origin / Forge / Heart chapters.
3. **Privacy 3-tier toggle** (~15min):
   - `src/lib/privacy.ts` — resolve tier per country × gender from WBL 2024 score.
   - `PrivacyTierBadge` on employer + policymaker views.
4. **Smoke pass + polish** (~15min): mobile responsive, scroll bugs, country swap works in 30s on stage.
5. `vercel --prod` deploy v3.

**Paola:**
1. Pitch deck final + speaker notes.
2. Backup demo video recorded (90s, screen-recorded from Vercel prod).
3. One-pager handout PDF.

**Commit checkpoint:** `feat: twilio sandbox whatsapp + whisper stt + privacy tiers`

### Phase 4 — 14:00 → 15:00 (1h, both)

**Goal:** Submit, with insurance.

1. Smoke test all 3 surfaces on Vercel prod, both browser and Twilio Sandbox flows.
2. Verify Atlas Card real numbers cite real sources (click every citation link).
3. Final commit + git tag `submission-v1`.
4. Submit: repo URL, Vercel URL, deck PDF, 90s backup video.

**Commit checkpoint:** `chore: submission v1` + tag `submission-v1`

---

## 6. Documents to Ship (in `atlas/`)

All 6 files are scaffolded in Phase 0 and updated at every commit. The user's mandate: *"whenever modifying something, make sure that you git commit and also update docs."* This is wired into CLAUDE.md as a hard rule.

| Doc | Purpose | Phase 0 content | Updated through |
|---|---|---|---|
| **CLAUDE.md** | Next-Claude-session guide | Stack, commands (`pnpm dev`, `pnpm ingest`, `pnpm test`, `vercel --prod`), file conventions, commit policy ("every change = commit + doc update"), where state lives, how to add a country | Phases 1–4 |
| **README.md** | Repo overview for human reader (judges, recruiters, partners) | What Atlas is, JTBD, run instructions, deploy instructions, brief-compliance table, honest-limits, sources | Phases 1–4 |
| **PRD.md** | Product requirements: JTBD, user stories, scope/non-goals, success metrics, country-agnostic spec | Amara JTBD, 3-surface user stories, 8-chapter player flow spec, country-config schema, success metrics (12-min completion, ISCO assignment confidence ≥0.6, ≥4 econometric signals visible, country swap <30s) | Phase 1, 2 |
| **PIPELINE.md** | Data ingest spec | All 10 sources with: official URL, fetch method (live API vs bulk CSV), schema, refresh cadence, citation block, fallback if source down | Phase 1 (heavy) |
| **TASKS.md** | Time-boxed work list | Phases 0–4 broken into 30-min chunks with owner + status + commit ID | Continuously |
| **PLAN.md** | This plan, mirrored | Whole plan + risk register | Phase 1 (lock), 2 (revisions), 4 (post-mortem) |

---

## 7. Critical Files (the ones that matter most)

| Path | Why it's critical | Reuses from `demo_v1/` |
|---|---|---|
| `src/lib/orchestrator/prompts.ts` | The Claude system prompt is the brain. Cached, so every token saved is real money + speed. | Chapter prompts from `scripts/chapters.js` |
| `src/lib/scoring/oracle.ts` | The AI-Tier composite is the wedge. Three-phase Boss Fight scoring (Intel + Loadout + Duel) is what makes Atlas defensible. | `scoreInventory`, `scorePromptFlex`, `scoreDuelChoice`, `computeAITier` from `scoring.js` |
| `src/lib/skills/onet.ts` + `isco.ts` | LMIC-appropriate taxonomy. ISCO-08 codes are universal; O*NET task content is the LMIC-adapted skill anchor. | Replaces the toy `data/esco.js` entirely. |
| `src/lib/lmic/index.ts` | The single accessor for all econometric data. Every UI surface goes through this. | Replaces the seeded numbers in `data/econometric.js` with real fetched data. |
| `src/lib/config/countries/{gh,bd,vn}.json` | Country-agnostic configurability lives here. Add a country = add a JSON file, no code changes. | Direct port from `scripts/configs.js` `COUNTRIES` block. |
| `src/lib/privacy.ts` | The 3-tier privacy resolver. WBL 2024 score + WGI rule-of-law → privacy default per country × gender. World Bank judges will look here. | New (existing demo has banner only). |
| `data/lmic/_meta.json` | Citation timestamps. When a judge asks "is this data real?", we point here. | New. |

---

## 8. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| ILOSTAT SDMX rate-limits or returns 5xx during ingest | Medium | Medium | Bulk CSV download fallback. Cache committed to repo, so a single successful fetch is enough. |
| Claude API rate limit during demo | Low | High | Pre-warm cache, prompt-cached system prompt, retries with exponential backoff. Backup: pre-recorded video shows working flow. |
| Twilio Sandbox webhook fails on stage | Medium | Low (P1 feature) | Demo on browser simulator first; only show Twilio if everything else is green. |
| Phase 1 ingest blows past 10:00 | Medium | High | Cut sources by priority: ILOSTAT + WDI + Frey-Osborne + WBL are P0; WBES + Findex + Wittgenstein + HCI + UIS + ITU are P1. P0 alone satisfies brief. |
| Vercel deploy fails (env vars, build errors) | Low | High | First deploy in Phase 0 catches this. CI on every push. |
| Data citation challenged by judge | Low | High | `data/lmic/_meta.json` shows source URL + fetchedAt for every datum. Honest-limits banner discloses what's cached vs live. |
| Lead dev stuck on a Next.js bug at 02:00 | Medium | Medium | Claude Max paired session is the unblocker. Stack chosen for debuggability (TS errors, Zod errors, Vercel logs all readable). Prior Python+Postgres ETL experience covers DB fundamentals. |
| Prisma migration / generate fails on Vercel build | Medium | Medium | Run `prisma db push` (no migrations folder) in dev; add `pnpm prisma generate` to `postinstall` so Vercel build always regenerates the client. Smoke-deploy in Phase 0 catches this early. |
| Paola arrives 10:00 with no deck context | Low | Medium | PRD.md + ATLAS_BRIEF.md + the 5-slide outline in §8 of the brief give her a 10-minute onboard. |

---

## 9. Brief-Compliance Map (must hold throughout)

| Brief requirement | Atlas hit point | Where to verify |
|---|---|---|
| Infrastructure, not product | 3 surfaces on 1 configurable backend, country JSON drives everything | `src/lib/config/countries/*.json`, README §arch |
| Build ≥ 2 of 3 modules | Module 1 (Skills Signal Engine), Module 2 (AI Readiness Lens — full, with AI-Tier 0–4 + Frey-Osborne LMIC + Wittgenstein 2030), Module 3 (Opportunity Matching + dual interface) — **all three** | PRD.md §modules, README §brief-compliance |
| Country-agnostic | JSON-driven; live country toggle (GH ↔ BD ↔ VN) on stage | `CountryToggle`, `config/countries/`, README §country-swap |
| Real economic data | All 10 sources fetched live or cached with citation | PIPELINE.md, `data/lmic/_meta.json`, `DataSourceCitation` component |
| ≥ 2 signals visible to user | 4 on Atlas Card alone (wage, growth, automation risk, AI premium); more on dashboards | `/player` Atlas Card reveal, `/employer`, `/policymaker` |
| Specific constrained user | Amara (Ghana, phone repair), Riya (Bangladesh, tailor), Tuan (Vietnam, dev) — voice-ready text-first, low-bandwidth, shared-device | `config/countries/*.json` `samplePlayer` field, PRD.md §personas |
| Design for constraint | Whisper STT, low-bandwidth chat, navigator-assist, country-aware privacy defaults | `/api/voice`, `src/lib/privacy.ts` |
| Localizability with real evidence | Live country swap demo on stage, 6 country configs shipped | Phase 2/3 demo, README §brief-compliance |
| Honest about limits | `HonestLimitsBanner` on every UI surface; calibration disclosure on Atlas Card | `HonestLimitsBanner.tsx`, README §honest-limits |
| Avoid: overengineered tech, under-engineered UX | Single Next.js app, 1 LLM, JSON cache, KV. UX gets the time. | This whole plan. |

---

## 10. Verification

End-to-end smoke before Phase 4 submit:

1. `pnpm install && pnpm ingest && pnpm dev` — local boot, no errors.
2. `/` landing — 3 cards, brief table, stat row.
3. `/player?country=GH` — full 8-chapter quest with Claude (no sample-answer cheats), Atlas Card reveals real ILOSTAT wage for ISCO 7421 in Ghana.
4. Country swap to BD — same flow, different language strings, different wage, same engine.
5. `/employer?country=GH` — heatmap, 4 KPIs, candidate list. Click a citation → opens ILO/WB source page.
6. `/policymaker?country=GH` — 4+ charts with real data, Wittgenstein 2030 projection visible, WBL gender gauge.
7. Twilio Sandbox: text `join <code>` from a phone, then "start" — bot replies, full chapter flow on real WhatsApp.
8. Whisper STT: record a 5s answer in Origin chapter, transcript shows up, scoring fires.
9. `pnpm test` — orchestrator, scoring, lmic-accessor smoke tests pass.
10. `pnpm build` — clean Next.js prod build.
11. Vercel prod URL — same flow works there.
12. Tag `submission-v1`, push.

---

## 11. What This Plan Explicitly Does NOT Do (scope kills)

- **No ESCO** (user correction: Eurocentric, doesn't fit LMIC informal-sector reality).
- **No Meta WhatsApp Cloud API** (Twilio Sandbox is sufficient; Meta verification risk too high in 8h).
- **No TTS** (only STT via Whisper; accent quality risk).
- **No Redis as primary store** (Vercel KV is Upstash Redis under the hood — used only as optional hot-cache for chapter state; Postgres is source of truth).
- **No mobile app** (web-only; WhatsApp simulator + real Twilio is the channel).
- **No auth flow** (player handle = pseudonymous, attestor = phone hash, no login).
- **No fine-tuning, no embeddings DB, no RAG** (Claude prompt-cached + structured rubrics + ISCO/O*NET lookup is enough).
- **No sample-answer cheat buttons** (the demo's "use sample" shortcuts are removed; Claude orchestrator handles every chapter live).

---

## 12. Memory I Want To Save (after exit plan mode)

- **Feedback memory**: User wants ESCO out — for LMIC contexts they want ISCO-08 + O*NET (LMIC-adapted) + STEP. *Why:* ESCO is Eurocentric and doesn't fit LMIC informal-sector reality. *How to apply:* on any future skills-taxonomy decision in this repo, default to ISCO-08 + O*NET + STEP, never ESCO.
- **Feedback memory**: Every change must end in a git commit + doc update. *Why:* user mandate: "always iterate using git… whenever modifying something, make sure that you git commit and also update docs." *How to apply:* at the end of every coherent change, commit with conventional-commit message and update CLAUDE.md / TASKS.md / relevant doc.
- **User memory**: Lead dev — comfortable Python + relational-DB ETL, log debugging, public speaking. Stack can lean into Postgres / ETL / cyber comfortably.
- **User memory**: Marketing lead — Paris time, joins 2026-04-26 10:00. Owns pitch deck + 90-second demo script + handouts + design polish.
- **Project memory**: Hack-Nation 2026 Track 5 (UNMAPPED, powered by The World Bank Youth Summit) — submission deadline is 2026-04-26 at 15:00 Paris. Demo time 90 seconds. Atlas is the project. Two-person team: Fanette (dev) + Paola (marketer). Working from Paris time. Working window: 2026-04-25 ~midnight to 01:00 + 2026-04-26 08:00 to 15:00.
- **Project memory**: Atlas tech stack (locked) — Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, Vercel hosting, Vercel Postgres + Prisma, Anthropic Claude Sonnet 4.6 with prompt caching, Twilio Sandbox WhatsApp (P1) + browser WA simulator (P0), OpenAI Whisper STT, Recharts, react-leaflet. *Why:* user-locked Vercel + "real project not vibe-coded" + lead dev has real Postgres ETL background.
- **Project memory**: Atlas data sources (locked, all real, no synthetic) — ILOSTAT (live SDMX/REST), World Bank WDI (live REST), WBES, Findex 2024, WBL 2024, Frey-Osborne + ILO/WB LMIC reappraisal, Wittgenstein 2025–2035, World Bank STEP, Human Capital Index, ISCO-08, O*NET 28+ (LMIC-adapted task content). Cached in `data/lmic/` with citation + fetchedAt timestamp. **Skills taxonomy is ISCO-08 + O*NET + STEP. NOT ESCO** (Eurocentric, doesn't fit LMIC informal-sector reality).
- **Reference memory**: ATLAS_BRIEF.md in `demo_v1/` is the strategic source-of-truth narrative for the project (insights, wedge, moat, risks, pitch lines). Re-read before any pitch-related decision.
- **Reference memory**: `docs/05 - World Bank - Unmapped.docx - Google Docs.pdf` is the official UNMAPPED challenge brief — the verbatim spec to comply with. Modules + country-agnostic + real-data + design-for-constraint + honest-about-limits requirements live there.
