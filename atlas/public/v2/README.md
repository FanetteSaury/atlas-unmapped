# Atlas — Hack-Nation 5th Global Hackathon Demo

**Closing the distance between real skills and economic opportunity in the age of AI.**

A WhatsApp-native conversational game that measures STEP-equivalent skills, AI fluency (Tier 0–4), and assigns each unmapped young person their first ISCO-08 occupation code.

## What this demo is

- **Player view** — the Atlas Quest game, WhatsApp-style chat (8 chapters, ~12 min)
- **Employer view** — pseudonymous skill-density map + match groups
- **Policymaker view** — aggregate dashboard with ILO/WB econometric signals

Built for the **Hack-Nation 5th Global Hackathon**.

## Brief compliance

- Modules **1 (Skills Signal Engine)** + **3 (Opportunity Matching & Dashboard)** + Module 2 lite (AI fluency + Frey-Osborne risk surfaced)
- 2+ econometric signals surfaced visibly (ILOSTAT wage + WDI growth + Frey-Osborne automation risk)
- Country-agnostic via JSON configs (Ghana ↔ Bangladesh swap demo)
- Specific constrained user (informal-sector youth, voice-first, low-bandwidth)
- Honest about hackathon-grade calibration limits

## Quickstart

```bash
cd atlas
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # add your ANTHROPIC_API_KEY
streamlit run app.py
```

Open `http://localhost:8501`. Toggle country in sidebar. Walk a player through the quest. Switch pages for Employer / Policymaker views.

## Architecture

```
       ┌──────────────────────────────────┐
       │   CORE BACKEND (Python)           │
       │   • LLM orchestrator (Claude)     │
       │   • ESCO/ISCO mapper              │
       │   • Scoring engine (rubrics)      │
       │   • ILOSTAT/WDI cache             │
       │   • Country config layer          │
       └────┬──────────────┬──────────┬───┘
            │              │          │
       ┌────▼──┐      ┌────▼────┐  ┌──▼──────┐
       │ Player│      │Employer │  │Policy-   │
       │ (chat)│      │(map)    │  │maker     │
       └───────┘      └─────────┘  └──────────┘
```

## Honest limits

- Hackathon-grade rubrics, not psychometrically validated (production needs IRT calibration with 1000+ players × 6mo)
- Voice STT/TTS stubbed for v0 — full voice in Phase 2
- Privacy defaults: 3-tier (public heatmap → pseudonymous → consent-gated)
- Country configs Ghana + Bangladesh shipped; Vietnam stub

## Sources

ILOSTAT · World Bank WDI · ESCO API · ISCO-08 · Frey-Osborne LMIC adaptations · WBL 2024 · Global Findex
