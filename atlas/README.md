# Atlas — Next.js app

The full project narrative, architecture, data sources, "Honest limits" section, and team are in the [**root README**](../README.md). This file documents only how to run *this* package locally.

## Quickstart

```bash
pnpm install
cp .env.example .env.local       # edit only the keys you have; everything is optional
pnpm dev                         # http://localhost:3000
```

Atlas runs out-of-the-box with **zero env vars set** — chat falls back to deterministic stubs, persistence falls back to seed data, WhatsApp is disabled, browser channel still works.

To unlock the full demo experience: set `ANTHROPIC_API_KEY`. See [`.env.example`](./.env.example) for the rest.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Next.js dev server, http://localhost:3000 |
| `pnpm build` | Production build |
| `pnpm start` | Start the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest |
| `pnpm ingest` | Re-ingest LMIC source data into `src/lib/data/` (rarely needed; outputs are committed) |

## Layout

```
src/
├── app/                 # Next.js App Router — / · /player · /employer · /policymaker · /api/*
├── components/          # Shared UI — TopBar, CountryToggle, HonestLimitsBanner, DataSourceCitation
├── lib/
│   ├── orchestrator/    # Channel-agnostic chapter engine (runChapter) + Anthropic wrapper
│   ├── wa/              # Twilio WhatsApp — webhook handler, sender, state, squad invites
│   ├── storage/         # Vercel KV persistence — cards, projects
│   ├── data/            # Curated LMIC data — wages, automation risk, seed cohort
│   ├── scoring/         # STEP-equivalent rubric scoring
│   ├── skills/          # ISCO-08 + O*NET task mapping
│   ├── lmic/            # Country config (GH, BD)
│   └── config/          # Game schema (chapters, characters, rubrics)
└── styles/              # Tailwind v4 + Paola's design system layer
```

## Production deploy

Live at **https://atlas-mu-vert.vercel.app**. Deploys on push to `main`. Health check: `/api/health`.
