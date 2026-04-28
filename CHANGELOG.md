# Changelog

All notable changes to Atlas are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — 2026-04-26

Hack-Nation 5th Global Hackathon submission.

### Added
- 8-chapter conversational quest (`/player`) — country picker, inventory, companion, drill-in, origin, forge, oracle boss fight, future, tribe, Atlas Card reveal.
- Channel-agnostic orchestrator (`src/lib/orchestrator/`) — same `runChapter()` engine drives WhatsApp and the browser.
- WhatsApp pipeline (`src/lib/wa/`) — Twilio Sandbox webhook with signature validation, `MessageSid` dedupe, SHA-256 + salt phone hashing, out-of-band sender via `after()`.
- Anthropic Claude Sonnet 4.6 integration with prompt caching + 5s soft timeout + JSON repair.
- Heuristic fallback path so the entire game runs without an LLM key.
- Employer dashboard (`/employer`) — post-project flow, ad-hoc per-project WhatsApp rooms, candidate match.
- Policymaker dashboard (`/policymaker`) — Demography & gender, Atlas Cards by ISCO/ward/AI tier, real WDI / WBL / Findex / Wittgenstein / FLFP data for Ghana and Bangladesh.
- Atlas Card persistence on Vercel KV (Upstash Redis) with 30-day TTL.
- Real-data layer — ILOSTAT 2024, Frey-Osborne 2013 + LMIC reappraisal, ISCO-08, O*NET, STEP, WDI, WBL 2024, Findex 2024, Wittgenstein 2030.
- `/api/health` and `/api/wa/health` — env-presence + KV reachability probes (no secret leakage).

### Honest limits
- STEP-equivalent rubrics calibrated against Ghana 2013 STEP anchors but **not psychometrically validated**. Production calibration requires 1000+ players × 6 months of IRT item-bank work.
- LMIC econometric data hardcoded from public sources at submission time. Every datum cites its source on screen.
- WhatsApp pipe is Twilio Sandbox; production deployment uses Meta WhatsApp Cloud API.
- Voice STT only (Whisper). TTS deferred — accent quality requires native-speaker calibration in 20+ LMIC languages.

### Known issues
- No rate limiting on `/api/chat`. Tracked.
- No automated test suite yet. Smoke-tested manually + via `/api/health`.
