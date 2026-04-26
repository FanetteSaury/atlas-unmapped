"""Atlas — shared Python library for serverless handlers.

Modules:
- orchestrator: Claude Sonnet 4.6 with prompt caching, channel-agnostic run_chapter()
- scoring: 8 STEP-equivalent rubrics (one per chapter)
- skills: ISCO-08 + O*NET task content + STEP rubric anchors
- lmic: typed accessors over data/lmic/*.json
- privacy: 3-tier resolver (WBL + WGI driven)
- crypto: phone hash, Atlas Card HMAC signature
- kv: Vercel KV (Upstash Redis) client

Phase 1 (08:00 → 10:00 Paris) fills these in.
"""
