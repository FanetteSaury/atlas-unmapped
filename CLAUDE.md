# CLAUDE.md — Atlas project guide for future Claude Code sessions

This file is the contract between Claude (the AI dev) and the repo. Read it first, then `PLAN.md` and `PRD.md`.

## What this project is

**Atlas** is the Hack-Nation 2026 Track 5 (UNMAPPED, World Bank Youth Summit) submission — a Next.js + Vercel app that turns a 12-minute WhatsApp-style chat into a real, portable, ISCO-08-coded skills credential for the 600M unmapped young people across 75 LIC + LMIC countries. **Three surfaces (Player · Employer · Policymaker), one configurable backend, real LMIC data.**

The strategic narrative lives in `demo_v1/ATLAS_BRIEF.md` (read this for any pitch / framing / decision about wedge / moat / personas). The official challenge brief lives in `docs/05 - World Bank - Unmapped.docx - Google Docs.pdf`.

## Working window (Paris time)

- **2026-04-25 ~midnight → 01:00** Phase 0 scaffold (Fanette solo)
- **2026-04-26 08:00 → 10:00** Phase 1 data + Claude orchestrator (Fanette solo)
- **2026-04-26 10:00 → 12:00** Phase 2 three surfaces (Fanette + Paola)
- **2026-04-26 12:00 → 14:00** Phase 3 WhatsApp + voice + privacy (both)
- **2026-04-26 14:00 → 15:00** Phase 4 submit
- **DEADLINE: 2026-04-26 15:00 Paris.**

See `TASKS.md` for the broken-down work list, and `PLAN.md` for the full execution plan.

## 🚨 Task list contract (binding for all agents + future sessions)

`TASKS.md` at the repo root is the **canonical source of truth** for what's pending. The Claude Code internal TaskList tool (`TaskCreate` / `TaskList`) is volatile — per-session, not git-persisted. Anything that must survive a session restart goes in `TASKS.md`.

**On session start, always read `TASKS.md` § 🆘 LIVE BOARD first.** That section lists the highest-priority active items with full context (verbatim user/Paola conversations, blockers, interview-pending decisions). The internal TaskList may be stale.

**When new tasks emerge:**
1. `TaskCreate` for in-session tracking (status spinner UX)
2. **AND** edit `TASKS.md` to add the durable record
3. Commit the `TASKS.md` change with `docs(tasks): ...` conventional message

**When tasks complete:**
1. `TaskUpdate` to mark completed in-session
2. **AND** update the `TASKS.md` entry with the commit ref that closed it
3. Commit `docs(tasks): mark <task> done @ <sha>`

## Stack (locked, v2 — tightened per Paola TODO + brief weak-submission warning)

The brief literally warns: *"Weak submissions overengineer the tech stack and under-engineer the user experience."* (p. 5). We cut everything that doesn't show up on stage.

| Layer | Choice | Why this, not heavier |
|---|---|---|
| Frontend + backend | Next.js 16 (App Router) + TypeScript + Tailwind v4 | Single repo, single deploy, Tailwind is enough — no shadcn |
| Hosting | Vercel (root directory: `atlas/`) | User-locked |
| LLM | Anthropic Claude Sonnet 4.6 with prompt caching | The wedge: AI Tier scoring + ISCO classification |
| Persistence | **Vercel KV (Redis)** for player runs + Atlas Cards. **JSON cache** in `data/lmic/` for econometric data. Pre-seeded JSON for "first cohort" Atlas Cards on dashboards (disclosed in honest-limits) | Postgres+Prisma was overkill for a hackathon ephemeral demo. KV does `lpush` + `lrange` for the 2-3 aggregations we need. |
| Skills taxonomy | **ISCO-08 + O*NET + STEP — NOT ESCO** | Brief p. 5 lists these for LMIC; ESCO is Eurocentric |
| WhatsApp | Browser simulator (P0) + Twilio Sandbox (P1) + auto-add to employer group on completion (Twilio API) | Twilio Sandbox + browser sim = stage-safe + provable |
| Voice | OpenAI Whisper STT one-way (P1) | "Design for constraint" requirement |
| Maps | **CSS grid of wards** with hover/click tooltips (NO Leaflet) | A real geo-map adds 1h+ for visual that a CSS grid does in 15 min |
| Charts | Recharts | Used for 4 charts on policymaker view, not in employer (employer = grid + filters) |
| Validation | Zod on every API boundary | Type-safe + readable errors |
| Package manager | pnpm via corepack | 3x faster install |
| Ingest scripts | **Python** (`scripts/ingest/*.py`) — lead dev's terrain (SQL/Postgres background) | TS ingest was unnecessarily TS-everywhere; output is JSON read by TS frontend |
| Tests | **Manual smoke checklist** (no Vitest in v1) | Test pyramid for hackathon = 1 manual run before submit |
| CI | GitHub Actions: tsc + lint only | Fast, catches the 90% |

## Where things live

```
202604_Hack_Nation/                 # git repo root
├── atlas/                          # ← Next.js app, Vercel root directory
│   ├── prisma/schema.prisma        # PlayerRun, AtlasCard, Attestation
│   ├── prisma.config.ts            # Prisma 7 datasource config (URLs here, not in schema)
│   ├── src/
│   │   ├── app/                    # App Router pages + /api routes
│   │   ├── lib/
│   │   │   ├── orchestrator/       # Claude Sonnet 4.6 with prompt caching
│   │   │   ├── scoring/            # one module per chapter rubric
│   │   │   ├── skills/             # ISCO-08 + O*NET + STEP
│   │   │   ├── lmic/               # typed accessors over data/lmic JSON cache
│   │   │   ├── db/                 # Prisma singleton + typed queries
│   │   │   ├── config/             # country JSON + Zod schema + game enums
│   │   │   ├── privacy.ts          # 3-tier resolution by country × gender
│   │   │   ├── safeguarding.ts     # GBV-aware route gating
│   │   │   └── crypto.ts           # phone hash, Atlas Card HMAC signing
│   │   └── components/             # shadcn primitives + Atlas-specific
│   ├── data/lmic/                  # JSON cache, built by scripts/ingest/
│   ├── scripts/ingest/             # one ingest script per LMIC source
│   └── tests/                      # vitest smoke tests
├── demo_v1/                        # legacy static-HTML demo (preserved)
│   └── ATLAS_BRIEF.md              # ← strategic source-of-truth narrative, READ THIS
├── docs/
│   └── 05 - World Bank - Unmapped.docx - Google Docs.pdf  # ← official brief
├── README.md                       # repo top-level overview
├── CLAUDE.md                       # ← you are here
├── PRD.md                          # product requirements (JTBD, user stories, success metrics)
├── PIPELINE.md                     # data ingest spec (every source, endpoint, citation)
├── TASKS.md                        # time-boxed work list
└── PLAN.md                         # execution plan (mirrored from .claude/plans/)
```

## Hard rules

1. **Real data only.** No synthetic LMIC numbers. Every datum must trace to an official source via `data/lmic/_meta.json`. The user has said this twice: *"it must use the real data for the skills mapping and econometrics"* and *"answering the job-to-be-done and the data is the most important thing."*
2. **No ESCO.** ESCO is Eurocentric. Use **ISCO-08 (universal) + O*NET (LMIC-adapted) + STEP (rubric anchor)**. The user explicitly killed ESCO.
3. **Every change ends in a commit + a doc update.** Conventional commit prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`). Touch the affected doc in the same commit. The user said: *"always iterate using git… whenever modifying something, make sure that you git commit and also update docs."* Never leave changes uncommitted at end of a turn.
4. **Honest about limits.** Calibration disclosure on every UI surface (`<HonestLimitsBanner>`). Hackathon-grade rubrics, not psychometrically validated. Disclosed up-front so judges respect us.
5. **Don't overengineer the stack.** The brief explicitly warns against this. Single Next.js app. One LLM. One DB. One ingest pipeline.
6. **Respect Phase 0 scope tonight.** Tonight = scaffold + docs + first deploy + sleep. Real data + orchestrator wait until 08:00.

## Commands

All from `atlas/` directory (cd into it first):

```bash
pnpm install                       # install deps
pnpm dev                           # local dev http://localhost:3000
pnpm build                         # prod build (must pass before deploy)
pnpm lint                          # eslint
pnpm test                          # vitest smoke

pnpm exec prisma format            # format prisma/schema.prisma
pnpm exec prisma validate          # validate schema
pnpm exec prisma generate          # regen client → src/generated/prisma
pnpm exec prisma db push           # push schema to DB (no migrations folder)
pnpm exec prisma studio            # browse DB

pnpm ingest                        # fetch all LMIC sources → data/lmic/*.json
pnpm ingest:ilostat                # one source at a time
pnpm ingest:wdi
# ... etc

pnpm dlx vercel --prod             # production deploy
pnpm dlx vercel env pull .env.local  # fetch env vars from Vercel project
```

## Environment variables

See `atlas/.env.example`. Required for:
- `ANTHROPIC_API_KEY` — orchestrator
- `OPENAI_API_KEY` — Whisper STT
- `POSTGRES_PRISMA_URL` + `POSTGRES_URL_NON_POOLING` — Prisma datasource (set by Vercel Postgres)
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` — Vercel KV (optional hot-cache)
- `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_WA_FROM` — Sandbox WhatsApp webhook
- `ATLAS_CARD_SIGNING_SECRET` — HMAC key for share-URL signatures

Never commit `.env*` files (covered by `.gitignore`).

## How to add a country

1. Add `atlas/src/lib/config/countries/{iso2}.json` matching the Zod schema in `src/lib/config/schema.ts`.
2. Re-export it from the registry in `schema.ts`.
3. Add the country to ingest scripts: `pnpm ingest --country <iso2>` will fetch from each source.
4. Country toggle picks it up automatically; no UI change required.

## How to add a new chapter rubric

1. Add `atlas/src/lib/scoring/<chapter>.ts` — pure function `(input, ctx) => { score, evidence, deltas }`.
2. Wire it in `atlas/src/lib/orchestrator/index.ts`.
3. Add a Vitest golden-input test in `atlas/tests/scoring.test.ts`.

## How to add an LMIC data source

1. Add `atlas/scripts/ingest/<source>.ts` — fetches → writes `data/lmic/<source>/{country}.json` with shape `{ data, source: { name, url, license, fetchedAt }, citation }`.
2. Add typed accessor in `atlas/src/lib/lmic/<source>.ts`.
3. Document the source in `PIPELINE.md` (URL, refresh cadence, fallback if API down).
4. Surface the value in UI via `<DataSourceCitation>` so judges can click through to the source.

## Anti-patterns to avoid

- **Don't fake numbers.** The original demo has hardcoded values (e.g. "147 verified candidates"). Replace with real Postgres counts or live LMIC accessor values.
- **Don't add cheat shortcuts.** No "Use sample answer" buttons. Claude orchestrator handles every chapter live.
- **Don't bypass Zod.** All API boundaries validate input.
- **Don't write to `window.*`.** ES modules only.
- **Don't cherry-pick LMIC sources.** If the brief lists it, we ingest it (or document why we couldn't).
- **Don't ship broken builds.** `pnpm build` must pass before push. CI catches this.
- **Don't push before commit.** Conventional-commit message + doc update + push.

## Agent orchestration (team `atlas-hackathon`)

The team is **manager + specialist agents**. The manager (Claude main loop, paired with Fanette) writes all app code in the actual repo. Specialist agents do **research + downloads + reviews only** — no code in worktrees, no commits, no pushes. This keeps debug surface to one codebase.

### Rules every agent must follow (Claude Code best practices)

1. **Tick the TaskList faithfully.** When you start work, claim the task with `TaskUpdate(taskId, owner: "<your-name>", status: "in_progress")`. When done, `TaskUpdate(taskId, status: "completed")`. Never silently work — the TaskList is the user's status board.
2. **Create tasks for sub-work.** If your job decomposes into 3 datasets to download, create 3 sub-tasks via `TaskCreate` so each is visible. The user can run `TaskList` at any moment and see what's happening.
3. **No structured JSON status messages.** Don't send `{type: "task_completed", ...}` to the manager. Use `TaskUpdate` for status, and plain-text `SendMessage` for human-readable summaries.
4. **Refer to teammates by name.** Manager = `team-lead`. Workers = the name they were spawned with (e.g. `data-prestager`, `brief-reviewer`).
5. **Never commit, never push, never deploy.** Only the manager (with human-in-the-loop review) commits. If you produce code, write it as a markdown patch that the manager applies.
6. **One artifact per task.** Each task ends with one reviewable output: a downloaded file, a markdown report, a code-suggestion patch. Not a sprawling commit.
7. **Idempotent + restartable.** If you crash mid-task, the next run should pick up cleanly. Use file existence + checksum, not session state.
8. **Cite real sources.** For LMIC data, every file goes with `source.url` + `license` + `fetchedAt`.

### Roster (spawn just-in-time, kill after)

| Name | Type | When to spawn | Output |
|---|---|---|---|
| `data-prestager` | general-purpose | Tonight (Phase 0 tail) | Files in `atlas/data/lmic/_raw/` + `REPORT.md` |
| `brief-reviewer` | general-purpose | At each phase boundary (10:00, 12:00, 14:00, 14:45) | `<= 1200-word gap analysis report` |
| `frontend-designer` | Plan or general-purpose | Phase 2 morning, on-demand | Component sketch markdown |
| `wa-researcher` | general-purpose | Phase 3 noon, on-demand | Twilio sandbox setup steps as markdown |

Manager (Claude main loop) reads each agent's report, applies code changes itself, commits with conventional-commit messages, updates docs in same commit. Every commit is reviewed by Fanette before push.

### Spawn pattern (manager)

```
Agent({
  subagent_type: "general-purpose",
  description: "<3-5 word task>",
  name: "<role-name>",
  team_name: "atlas-hackathon",
  run_in_background: true,
  prompt: <self-contained brief, references existing TaskList items, ≤ 30 lines>
})
```

The agent's prompt MUST include:
- The exact path of files it can write to (whitelist; everything else is read-only)
- The team task ID it should claim
- "Tick TaskList. No commits. Output one markdown report at <path>."
- Time budget (≤ 30 min ideal; ≤ 60 min hard cap)

## How to check project state (run this often)

Fanette's instruction: *"je veux vérifier souvent l'état du projet."* These commands give a 10-second snapshot:

```bash
# 1. Where are we in git? (last 5 commits)
git log --oneline -5

# 2. What changed but isn't committed?
git status --short

# 3. What is each agent doing right now? (TaskList in Claude Code session, or:)
ls -la ~/.claude/tasks/atlas-hackathon/

# 4. What's the latest from the data prestager?
ls -la atlas/data/lmic/_raw/ 2>/dev/null
[ -f atlas/data/lmic/_raw/REPORT.md ] && head -30 atlas/data/lmic/_raw/REPORT.md

# 5. Vercel deploy status
cd atlas && pnpm dlx vercel ls 2>/dev/null | head -5

# 6. Build still green?
cd atlas && pnpm exec tsc --noEmit && pnpm lint && echo "✅ green"
```

Better: run `TaskList` from inside Claude Code at any moment to see live status of all agents + their tasks. That's the canonical status board.

## When uncertain

1. Re-read this file (CLAUDE.md).
2. Re-read `PLAN.md` for the locked architecture.
3. Re-read `demo_v1/ATLAS_BRIEF.md` for the strategic intent.
4. Re-read `docs/05 - World Bank - Unmapped.docx - Google Docs.pdf` for the brief verbatim.
5. Ask the user before scope-creeping. The deadline is 2026-04-26 15:00 Paris and the team is two people.

— *last updated: Phase 0 scaffold, 2026-04-25*
