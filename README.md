# Atlas

[![CI](https://github.com/FanetteSaury/atlas-unmapped/actions/workflows/ci.yml/badge.svg)](https://github.com/FanetteSaury/atlas-unmapped/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://atlas-mu-vert.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Anthropic](https://img.shields.io/badge/Claude-Sonnet_4.6-cc785c?logo=anthropic)](https://www.anthropic.com)

> *Closing the distance between real skills and economic opportunity in the age of AI.*

**Hack-Nation 2026 · Track 5: UNMAPPED · The World Bank Youth Summit**

---

# 🚀 Try it now in beta!

# **→ https://atlas-mu-vert.vercel.app**

Open the link, pick Ghana or Bangladesh, post a project as an employer or play the 12-minute quest as a young worker.

---

## The pitch

In low- and middle-income countries, the labor market is not broken — it's invisible.

Up to **90% of young workers operate informally**, and the World Bank identifies **over 600 million young people** with real but unrecognized skills.

So we asked: if they're not on LinkedIn, how does hiring actually happen?

Through family, peer recommendations, word of mouth, and **WhatsApp groups** — but these signals are fragmented and cannot scale.

Then we identified the core constraint: many users struggle to read and write, so CVs, job platforms, and written assessments fail before skills are even captured.

So the real opportunity is not building another job platform — it's **measuring informal skills in a way that fits how people already communicate**.

**Atlas is a voice-first game on WhatsApp.** In under 15 minutes, users tell their story — no writing, no pressure — and we generate a STEP-equivalent skill score and a formal occupation profile.

The user gets a simple scorecard they can share instantly, and is **matched into skill-based WhatsApp groups with employers**.

We are **B2B**: employers, NGOs, and governments pay ~**$2–5 per verified profile** or via SaaS access to local talent pools — while the product is free for users.

Atlas directly addresses that skill misallocation gap — by making skills measurable, shareable, and matchable at scale.

We're not creating demand. **We're unlocking the workforce that already exists.**

---

## Meet Amara

Amara, 22, repairs phones from a kiosk in Madina, Greater Accra. She left school at 16, has no LinkedIn, no CV, and no formal credential. But she fixes 8–12 phones a day, knows three brands of soldering iron by feel, and triages screen replacements while explaining the trade-off in Twi to her customer.

Atlas hands her a phone, asks her to talk for 12 minutes, and gives her back:

- **ISCO-08 7421** — Phone Repair Technician (88% confidence)
- **AI Tier 2** — Active (uses ChatGPT weekly to look up part numbers, +20% wage premium)
- **🔧 The Artisan** — Atlas class, calibrated against Ghana 2013 STEP
- **Wage benchmark**: ₵1,050–1,400/month formal · ₵2,400/month with AI Tier 2 premium (ILOSTAT 2024)
- **Squad invite**: a WhatsApp room with 4 verified Madina-area employers who just posted projects matching her skill cluster

She didn't fill a form. She told a story. And the labour market saw her for the first time.

---

## What lives where

```
202604_Hack_Nation/
├── atlas/        # ← Next.js 16 app, Vercel root
│   ├── src/app/  #   landing, /employer, /policymaker, /player, /api/*
│   └── public/v2 #   Paola's polished static demo (player.html, policymaker.html)
├── demo_v1/      # ← legacy static-HTML demo, preserved for reference
├── docs/         # ← official Hack-Nation + World Bank brief PDFs + SUBMISSION.md
└── README.md     # ← you are here
```

---

## Run locally — Quickstart for judges

Atlas runs out-of-the-box with **only one optional env var** (`ANTHROPIC_API_KEY`). Without it the chat falls back to deterministic stubs so you can still walk the full game flow + dashboards.

```bash
git clone git@github.com:FanetteSaury/atlas-unmapped.git
cd atlas-unmapped/atlas
pnpm install
cp .env.example .env.local             # then paste your key (see below)
pnpm dev                               # http://localhost:3000
```

Open http://localhost:3000 → pick a country → walk the 8-chapter quest. Visit `/policymaker` and `/employer` for the dual-interface dashboards.

### Env vars — what's required vs optional

| Var | Required? | What breaks without it | Where to get it |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | **recommended** | chat falls back to deterministic stubs (UI still works, scoring still fires) | console.anthropic.com → API Keys |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | optional | completed Atlas Cards aren't persisted; `/policymaker` shows seed cohort only | Vercel → Storage → Upstash for Redis (free tier) |
| `OPENAI_API_KEY` | optional | Whisper voice notes disabled; text input still works | platform.openai.com |
| `TWILIO_*` | optional | WhatsApp channel disabled; browser channel still works | console.twilio.com (Sandbox WhatsApp) |

### Health check

After `pnpm dev`, hit `http://localhost:3000/api/health` — confirms which services are wired:

```json
{ "anthropic": true, "kv": true, "kvCountGH": 12, "model": "claude-sonnet-4-6" }
```

Same endpoint live: https://atlas-mu-vert.vercel.app/api/health

---

## Stack

- **Frontend + API**: Next.js 16 (App Router) + TypeScript + Tailwind v4 on Vercel
- **LLM**: Anthropic Claude Sonnet 4.6 with prompt caching (channel-agnostic `runChapter` orchestrator)
- **Persistence**: Vercel KV (Upstash Redis) for Atlas Cards + project rooms
- **WhatsApp**: Twilio Sandbox + browser simulator share the same engine
- **Skills taxonomy**: ISCO-08 + O*NET (LMIC-adapted) + World Bank STEP rubrics — **not ESCO** (Eurocentric, doesn't fit informal-sector reality)
- **Real-data layer**: ILOSTAT · WDI · Frey-Osborne LMIC reappraisal · WBES · WBL 2024 · Findex 2024 · Wittgenstein 2030 · HCI · UNESCO UIS · ITU Digital Development

---

## Honest limits

- Hackathon-grade STEP-equivalent rubrics, calibrated against Ghana 2013 STEP anchors. Not psychometrically validated. Production calibration requires 1000+ players × 6 months of IRT item-bank work.
- LMIC econometric data is hardcoded from public sources at submission time. Every datum cites its source on-screen.
- WhatsApp pipe is Twilio Sandbox; production deployment uses Meta WhatsApp Cloud API.
- Voice STT only (Whisper). TTS deferred — accent quality requires native-speaker calibration in 20+ LMIC languages.

---

## Team

- **Paola Berard-Desormière** — CEO. [LinkedIn](https://www.linkedin.com/in/paola-berard-desormi%C3%A8re-948875205/)
- **Fanette Saury** — CTO. [LinkedIn](https://www.linkedin.com/in/fanette-saury/)

— *Hack-Nation 2026 · Track 5 UNMAPPED · powered by The World Bank Youth Summit*
