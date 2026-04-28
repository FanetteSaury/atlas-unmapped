# Security

Found a vulnerability or a privacy concern? Email **fanette.saury@compilog.com** — please do not open a public issue.

## What Atlas does to keep the demo safe

- **Twilio webhook signature validation** on every inbound WhatsApp request (`X-Twilio-Signature` HMAC-SHA1).
- **Phone numbers are SHA-256 + salt hashed** before storage (`WA_PHONE_SALT`). Raw E.164 numbers are never persisted.
- **Idempotent webhook processing** — `MessageSid` is deduped via Vercel KV `SET NX` with a 5-minute TTL, so Twilio retries can't double-send replies.
- **HMAC-signed Atlas Card share URLs** (`ATLAS_CARD_SIGNING_SECRET`) — slugs cannot be forged or enumerated.
- **Zod input validation** on every API route (`/api/chat`, `/api/projects`, etc.).
- **Graceful degradation** — if Anthropic, Twilio, or KV are unavailable, the app falls back to deterministic stubs / best-effort writes rather than failing loudly with leaked stack traces.
- **Outbound Twilio sends are out-of-band** via Next.js `after()` — the webhook returns `200 OK` in <15s independent of LLM latency.

## What is NOT yet hardened (hackathon-grade limits)

- No rate limiting on `/api/chat` — a viral LinkedIn post could exhaust an Anthropic key. Production fix: per-IP token bucket in KV (10 lines, in flight).
- No CAPTCHA on `/api/projects` POST. Anyone can post a fake project. Demo-fine, production-not.
- WhatsApp pipe is Twilio Sandbox; production needs Meta WhatsApp Cloud API and a registered Business Profile.
- See `README.md` § "Honest limits" for the broader scientific-validation gap.

## Reporting

For non-public reports, email above. We aim to acknowledge within 48 hours.
