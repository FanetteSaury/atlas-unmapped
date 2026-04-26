# Atlas

> *Closing the distance between real skills and economic opportunity in the age of AI.*

**Hack-Nation 2026 · Track 5: UNMAPPED · The World Bank Youth Summit**

A WhatsApp-native conversational game that, in **12 minutes** on a phone Amara already owns, measures three things no existing tool measures for the **600M unmapped young people** across **75 LIC + LMIC** countries:

1. **STEP-equivalent skill scores** — cognitive, socio-emotional, job-specific
2. **An ISCO-08 occupation code assignment** with attestor-backed confidence
3. **An AI Fluency Tier (0–4)** — a measurement that does not exist in any public dataset

It surfaces real econometric signals (ILOSTAT wages, WDI sector growth, Frey-Osborne automation risk, WBES skill gaps, WBL gender legal context, Findex digital readiness) to give those measurements economic meaning, and routes the player to a real local WhatsApp squad of verified employers.

---

## What lives where

```
202604_Hack_Nation/
├── atlas/        # ← the real Next.js 15 app (Vercel root)
├── demo_v1/      # ← legacy static-HTML demo, preserved (read ATLAS_BRIEF.md for the strategic narrative)
├── docs/         # ← official Hack-Nation + World Bank brief PDFs
├── README.md     # ← you are here
├── CLAUDE.md     # ← guide for Claude Code sessions on this repo
├── PRD.md        # ← product requirements (JTBD, user stories, success metrics)
├── PIPELINE.md   # ← real LMIC data ingest spec (every source, every endpoint, every citation)
├── TASKS.md      # ← time-boxed work list (now → 1am → tomorrow 8am-3pm)
└── PLAN.md       # ← execution plan (stack, architecture, phases, risks)
```

**Start with:** [`PLAN.md`](./PLAN.md) for the 60-second overview, then [`PRD.md`](./PRD.md) for the product spec, then [`PIPELINE.md`](./PIPELINE.md) for the data layer.

---

## Run locally

```bash
cd atlas
pnpm install
pnpm dlx vercel env pull .env.local    # fetch ANTHROPIC_API_KEY, DB_URL, etc.
pnpm prisma generate
pnpm prisma db push                    # creates Postgres tables
pnpm ingest                            # fetch real LMIC data → data/lmic/
pnpm dev                               # http://localhost:3000
```

Required env vars (see `atlas/.env.example`):

| Var | Source |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `OPENAI_API_KEY` | platform.openai.com (Whisper STT only) |
| `POSTGRES_PRISMA_URL` | Vercel dashboard → Storage → Postgres |
| `POSTGRES_URL_NON_POOLING` | same |
| `KV_*` | Vercel dashboard → Storage → KV (optional hot-cache) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WA_FROM` | console.twilio.com (Sandbox WhatsApp) |

---

## Deploy

The repo is configured for Vercel with the project root set to `atlas/`. Pushing to `main` triggers a production deploy.

```bash
cd atlas
pnpm dlx vercel --prod
```

---

## Brief compliance

| Brief requirement | Atlas implementation |
|---|---|
| Infrastructure, not product | 3 surfaces (Player · Employer · Policymaker) on 1 configurable backend, country JSON drives everything |
| Build ≥ 2 of 3 modules | All 3: Skills Signal Engine + AI Readiness Lens (full, with AI-Tier 0–4) + Opportunity Matching dual interface |
| Country-agnostic | JSON-driven config (`atlas/src/lib/config/countries/*.json`); live country toggle (GH ↔ BD ↔ NG ↔ KE ↔ PH) |
| Real economic data | Live APIs (ILOSTAT SDMX, WDI REST, WBES, HCI) + bulk-cached datasets (Findex, WBL, Frey-Osborne, Wittgenstein, ISCO-08, O*NET, STEP). Every datum cited, see [`PIPELINE.md`](./PIPELINE.md) |
| ≥ 2 econometric signals visible | 4+ on the Atlas Card alone (wage, sector growth, automation risk, AI premium); more on dashboards |
| Specific constrained user | Amara (Ghana, phone repair) · Riya (Bangladesh, tailor). Voice-ready (Whisper STT), low-bandwidth, shared-device aware, navigator-assistable |
| Design for constraint | Whisper STT, low-bandwidth chat, country-aware privacy 3-tier with WBL-driven defaults |
| Localizability with real evidence | Live country swap demo on stage in 30 seconds, 6 country configs shipped |
| Honest about limits | `<HonestLimitsBanner>` on every UI surface; calibration disclosure on the Atlas Card |

**Skills taxonomy is ISCO-08 + O*NET (LMIC-adapted) + World Bank STEP rubrics. Not ESCO** — ESCO is Eurocentric and doesn't fit LMIC informal-sector reality.

---

## Honest limits (calibration disclosure)

- Hackathon-grade STEP-equivalent rubrics. Not psychometrically validated. Production calibration requires 1000+ players × 6 months of IRT item-bank calibration. Disclosed on the player measurement rail and on the Atlas Card.
- LMIC econometric data: live where APIs are available (ILOSTAT, WDI, WBES, HCI), cached for paper-based sources (Findex, WBL, Frey-Osborne, Wittgenstein, STEP, ISCO-08, O*NET). All cached files include source URL + license + fetchedAt timestamp in `data/lmic/_meta.json`.
- WhatsApp pipe is Twilio Sandbox in this submission; production deployment uses Meta WhatsApp Cloud API (architecture diagram in [`PLAN.md`](./PLAN.md)).
- Voice STT only (OpenAI Whisper). TTS deferred to Phase 2 — accent quality requires native-speaker calibration in 20+ LMIC languages.

---

## Sources

ILOSTAT · World Bank WDI · World Bank Enterprise Surveys · Global Findex 2024 · Women, Business and the Law 2024 · Frey & Osborne 2013 + ILO/WB LMIC reappraisal · Wittgenstein Centre 2025–2035 · World Bank STEP · Human Capital Index · ISCO-08 · O*NET 28+ · ITU Digital Development · UNESCO UIS

Full citations + fetched timestamps: [`PIPELINE.md`](./PIPELINE.md) · [`atlas/data/lmic/_meta.json`](./atlas/data/lmic/_meta.json)

---

## Team

- **Paola Berard-Desormière** — CEO. [LinkedIn](https://www.linkedin.com/in/paola-berard-desormi%C3%A8re-948875205/)
- **Fanette Saury** — CTO. [LinkedIn](https://www.linkedin.com/in/fanette-saury/)

— *Hack-Nation 2026 · Track 5 UNMAPPED · powered by The World Bank Youth Summit*
