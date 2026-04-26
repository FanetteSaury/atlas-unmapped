# Atlas — Hack-Nation 2026 × World Bank UNMAPPED — Submission

## Short Description

Atlas turns 12 minutes of phone chat into a verified ISCO-08 skills credential for unmapped LMIC youth, then matches them with employers posting projects on WhatsApp.

---

## 1. Problem & Challenge

600M young people across 75 LIC + LMIC countries have no formal skills credential and no path into the labour market. Existing tools (LinkedIn, ESCO, Northern HR stacks) ignore informal-sector reality. Employers in Ghana, Bangladesh, Vietnam hire through WhatsApp groups, not résumés.

## 2. Target Audience

Three audiences, one engine:

1. Unmapped youth aged 15–24 in informal sectors.
2. SMEs and recruiters needing verified hands-on skill near them.
3. NGOs and government programme officers designing youth-employment cohorts.

## 3. Solution & Core Features

A chat-native conversational game (12 min, on a phone they already own) measuring STEP-equivalent skills, AI fluency (Tier 0–4), and assigning a first ISCO-08 occupation code. The credential lands in a dual interface:

- **Recruiter Workspace** — verified candidates by ward + Post-a-Project flow that opens a WhatsApp room with a shortlist.
- **Cohort Insights dashboard** — 10 informal-skill clusters, Wittgenstein 2030, WBL 2024, FLFP, automation risk, all hardcoded from public sources.

## 4. Unique Selling Proposition (USP)

The only credential that plugs into the channel users already live on (WhatsApp) and surfaces an **Atlas-original AI Tier 0–4** — a measurement that does not exist in any public dataset. Skills taxonomy is **ISCO-08 + O*NET + STEP** (LMIC-appropriate, not Eurocentric ESCO). Honest about limits: hackathon-grade rubrics, calibrated against Ghana 2013 STEP, disclosed up-front.

## 5. Implementation & Technology

- **Frontend + API**: Next.js 16 (App Router) + TypeScript + Tailwind v4 on Vercel.
- **LLM**: Anthropic Claude Sonnet 4.6 with prompt caching for the channel-agnostic orchestrator (`runChapter`).
- **Persistence**: Vercel KV (Upstash Redis) for Atlas Cards and project rooms.
- **WhatsApp**: Twilio Sandbox + browser simulator share the same engine.
- **Real-data layer**: ILOSTAT, WDI, Frey-Osborne LMIC reappraisal, WBES, WBL 2024, Findex 2024, Wittgenstein, HCI — every datum cited at source.

## 6. Results & Impact

Shipped on Vercel with three live surfaces and country-swap (Ghana ↔ Bangladesh) demonstrated on stage. 10 informal-skill clusters mapped to ISCO-08 with cohort share, female share, wage band, automation risk and skill-gap demand for both countries. The **Post-a-Project → matched candidates → WhatsApp room** flow closes the loop from credential to real work in the channel LMIC employers already use — turning a 12-minute conversation into a labour-market signal that did not exist before.
