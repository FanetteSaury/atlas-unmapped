# Session handoff — 2026-04-26 02:35 Paris

> Written before adding `chrome-devtools-mcp` and authenticating `vercel-mcp` (which may require a Claude Code session restart). This file captures the load-bearing state so the next session resumes cleanly.

## Where we are

**Phase 0 done.** 7 commits on `main`, build/lint/typecheck green, 16 LMIC source files pre-staged on disk (13 small committed, 4 heavy gitignored), 6+ documentation files written at repo root + `atlas/docs/`.

**Submission deadline:** 2026-04-26 15:00 Paris (~12.5h from this snapshot).
**Effective dev time left:** Fanette ~6.5h (sleep then 08:00–15:00); Paola joins 10:00 (~5h).

## Stack — frozen

- Frontend: Next.js 16 + TypeScript + Tailwind v4 — **no shadcn, no Leaflet**
- Engine: Python 3.12 + FastAPI on Vercel Python runtime (`atlas/api/*.py`)
- Persistence: Vercel KV + JSON cache + pre-seeded "first cohort" Atlas Cards — **no Postgres, no Prisma**
- LLM: Claude Sonnet 4.6 with prompt caching
- Skills: ISCO-08 + O*NET + STEP — **no ESCO**
- WhatsApp: Twilio Sandbox + browser sim (Phase 3)
- Voice: OpenAI Whisper STT only (Phase 3)
- Maps: CSS grid of wards (no real geo)
- Charts: Recharts on `/policymaker` only

## Active team

`atlas-hackathon` (TeamCreate at `~/.claude/teams/atlas-hackathon/config.json`).

| Agent | State | Notes |
|---|---|---|
| `team-lead` | active (Claude main loop) | manager, applies code, commits |
| `data-prestager` | idle, stand-down | Completed pre-staging cleanly. **Refused stale auto-assignments**, the right behavior. Next session: `shutdown_request` or fresh scoped brief. |

Spawn-on-demand briefs are persisted in the memory system at `~/.claude/projects/-home-topgun-hackathon-hacknation-5th-202604-Hack-Nation/memory/agent_briefs.md` for: `chrome-verifier`, `brief-reviewer` (re-spawn each phase), `frontend-designer`, `wa-researcher`.

## MCPs configured

- ✅ Gmail, Google Calendar (connected, not used for Atlas)
- ⚠️ Google Drive, Microsoft 365 (installed, need OAuth, not used for Atlas)
- ⚠️ **`plugin:vercel:vercel`** (HTTP MCP at https://mcp.vercel.com) — **needs OAuth**.
  After session restart, run `/mcp` in Claude Code, select `plugin:vercel:vercel`, choose Authenticate. OAuth flow opens browser → click Authorize → return to Claude. Vercel MCP tools (deploy, env, project mgmt) become available.
- ✅ **`chrome-devtools`** (stdio MCP) — **CONNECTED**. Configured at:
  `/home/topgun/.nvm/versions/node/v22.22.0/bin/chrome-devtools-mcp --headless --isolated --viewport 1280x800`
  Globally installed via `npm install -g chrome-devtools-mcp@latest` so npx delay isn't an issue. Chrome 145 is on the system at `/usr/bin/google-chrome`.
  After session restart, the chrome-devtools tools (`mcp__chrome_devtools__navigate`, `screenshot`, etc.) surface and the `chrome-verifier` agent can use them.

Verify with `claude mcp list` after restart. Both should be `✓ Connected`.

## What to do at session restart (3 min)

```bash
# 1. In a normal terminal, push to GitHub (Fanette's auth required)
gh repo create atlas-hacknation --private --source=. --push

# 2. Restart Claude Code session in this directory
#    (typically: exit Claude Code, re-launch in /home/topgun/hackathon/hacknation-5th/202604_Hack_Nation/atlas)

# 3. Inside the new Claude Code session:
/mcp                # opens MCP panel, authenticate plugin:vercel:vercel
/status             # confirm MEMORY.md auto-loaded the project context

# 4. Verify chrome-devtools is usable:
#    Ask Claude to take a screenshot of any URL — if it works, MCP is alive
```

## Phase 1 — when Fanette wakes (08:00 → 09:45, 1h45)

1. **Authenticate Vercel MCP + chrome-devtools-mcp loaded.** ~5 min.
2. **Push to GitHub.** `gh repo create atlas-hacknation --private --source=. --push`.
3. **First Vercel deploy.** `pnpm dlx vercel` — interactive auth + project setup. Get prod URL.
4. **Spawn `chrome-verifier`** with the prod URL. Smoke-test landing page.
5. Then Phase 1 ingest + orchestrator (8 tasks per `TASKS.md` § Phase 1 revised).

## Critical reminders

- **Brief-reviewer flagged 5 P0 items** (see git log + memory `feedback_*.md` files). Top: build `<DataSourceCitation>` and `<HonestLimitsBanner>` BEFORE any page. Country toggle in `layout.tsx` from the start.
- **Data on disk is real.** 16 files in `atlas/data/lmic/_raw/`. Phase 1 = parsing, NOT fetching.
- **WDI live API is slow.** Use ≥60s timeout + retry. Bulk JSONs are the primary path.
- **Frey-Osborne is a Plotly community mirror** of the Oxford Martin PDF appendix — flag explicitly in the HonestLimitsBanner.
- **No code in agent worktrees.** Manager (with Fanette's review) writes all app code. Agents do research + downloads + reports + reviews only.

## Where everything lives

```
202604_Hack_Nation/                 # git repo root
├── README.md, CLAUDE.md, PRD.md, PIPELINE.md, TASKS.md, PLAN.md  # human-facing docs
├── atlas/                          # Next.js app, Vercel root
│   ├── api/                        # Python serverless (engine — Phase 1 fills)
│   ├── data/lmic/_raw/             # ✅ 16 files pre-staged + REPORT.md
│   ├── docs/                       # SESSION_HANDOFF.md (this file), more in Phase 1+
│   ├── prisma/                     # ❌ removed
│   ├── scripts/ingest/             # Python ingest stubs (Phase 1 fills)
│   ├── src/                        # Next.js TS (3 dumb pages — Phase 2 fills)
│   ├── package.json, requirements.txt, vercel.json, .env.example
│   └── public/_legacy/             # demo_v1 archive (not yet moved here, still at repo-root demo_v1/)
├── demo_v1/                        # legacy static-HTML demo with ATLAS_BRIEF.md (READ for narrative)
├── docs/                           # SUBMISSION.md + ARCHITECTURE.md + PRODUCT.md
└── .claude/, .github/              # MCP config, CI workflow
```

## Memory files (auto-loaded next session)

- `state_2026_04_26_0235.md` — this snapshot in memory form
- `agent_briefs.md` — verbatim prompts for chrome-verifier, brief-reviewer, frontend-designer, wa-researcher
- `feedback_no_esco.md`, `feedback_commit_and_doc.md` — durable behavior rules
- `user_fanette.md`, `user_paola.md` — team profiles
- `project_tech_stack.md`, `project_data_sources.md`, `project_repo_layout.md`, `project_hackathon_timing.md` — locked decisions

## What I did NOT do

- No GitHub push (waiting on Fanette's `gh` auth)
- No Vercel deploy (waiting on Fanette's `vercel login`)
- No Anthropic API key set up
- No Twilio account
- No WhatsApp groups created
- No CountryToggle, DataSourceCitation, HonestLimitsBanner components yet
- No /player, /employer, /policymaker pages yet

All of those are Phase 1+, with Fanette's auth/clicks at the human-in-the-loop steps documented in PLAN.md and CLAUDE.md.

— end —
