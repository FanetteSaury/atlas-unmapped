# WhatsApp Game — architecture & state machine

> Reference for future contributors. Operational setup lives in `SETUP_TWILIO.md`.

---

## 1. Goals

1. A player on any phone with WhatsApp can run the entire 8-chapter Atlas
   Quest by texting our Twilio sandbox number — same pseudonymous handle, same
   Atlas Card, same squad invite as the browser surface.
2. The orchestrator engine is **shared** with the browser flow. Channel
   adapters are thin: one for `/api/chat` (browser /player), one for
   `/api/wa/webhook` (Twilio). New channels (Meta Cloud, SMS, Telegram) plug
   into the same `runChapter()` interface.
3. Squad groups are reachable from both sides (player end-of-quest CTA +
   employer "Join Squad" button) and resolve to the same
   `chat.whatsapp.com/<token>` link per `country × ISCO`.

## 2. Architecture

```
       phone                Twilio Sandbox             Vercel (Next.js 16)
   ┌──────────┐  msg     ┌────────────────┐  POST    ┌─────────────────────────┐
   │ player   │─────────▶│ +1 415 523 8886│─────────▶│ /api/wa/webhook         │
   │ Amara    │          │  (sandbox)     │  form    │  - validate sig         │
   └──────────┘          │                │          │  - dedupe MessageSid    │
       ▲                 │                │          │  - return 200 IMMEDIATE │
       │ reply           │                │          └────────────┬────────────┘
       │                 │                │                       │
       │                 │                │   REST   ┌────────────▼────────────┐
       └─────────────────┤                │◀─────────│ handleWaMessage()       │
                         └────────────────┘  out-of- │  ├─ getState (KV)       │
                                              band   │  ├─ runChapter()        │
                                                     │  │   └─ callSage()      │
                                                     │  │       └─ Anthropic   │
                                                     │  ├─ setState (KV)       │
                                                     │  └─ sendMessages()      │
                                                     └─────────────────────────┘
                                                              │
                                              ┌───────────────┼───────────────┐
                                              ▼               ▼               ▼
                                          Vercel KV    Anthropic API    Twilio REST
                                         (state +     (Sonnet 4.6 +     (outbound
                                          dedupe)     prompt cache)      WA reply)
```

Same diagram with the browser channel:

```
   /player React UI ──fetch──▶ /api/chat ──▶ runChapter() ──▶ Claude ──▶ JSON
        ▲                                          │
        └──────────── stream tokens ◀──────────────┘
```

`runChapter()` is identical in both flows. The only delta: WA flattens
`ChapterReply.payload` into plain text (e.g. companion choices become a
numbered list); the browser renders the payload as React components.

## 3. State machine

```
phone-unknown ─────"join atlas-quest" (handled by Twilio Sandbox auto)
                   │
                   ▼
┌─────────────────────────┐
│ no state in KV          │  user texts anything → bot welcomes + asks country
└─────────────────────────┘
            │
            ▼ chapter="country"
   awaiting GH/BD ────────────▶ ctx.country set
            │
            ▼ chapter="inventory"
   awaiting numbered picks ───▶ ctx.iscoSeed set
            │
            ▼ chapter="companion"
   awaiting 1-4 ──────────────▶ ctx.companion set
            │
            ▼ chapter="drillin"
   recency story ─────────────▶ ctx.aiTierProvisional
            │
            ▼ chapter="origin"     ← Claude: ISCO classification
            ▼ chapter="forge"      ← Claude: depth scoring
            ▼ chapter="mind"       ← deterministic numeracy
            ▼ chapter="heart"      ← Claude: socio-emotional
            ▼ chapter="oracle"     ← Claude: 3-phase boss
            ▼ chapter="future"     ← Claude: openness
            ▼ chapter="tribe"      ← keyword DONE detection
            │
            ▼ chapter="card"       finished=true; squad invite appended
   archived after 24h
```

State key: `wa:state:<phoneHash>`, TTL 2h. The 2h covers a player who pauses
mid-quest (e.g. a customer walks in). After the card is revealed, state stays
in KV for an extra 24h so a quick reshare or "send me my card again" works,
then is GC'd.

## 4. Idempotency + rate limits

| Concern | Mechanism |
|---|---|
| Twilio retries on transient failure | `wa:sid:<MessageSid>` SET NX with 5-min TTL — first webhook wins |
| Twilio Sandbox 1 msg/sec/recipient | `sender.ts` staggers outbound with `STAGGER_MS = 1100` |
| Anthropic slowness > 5s | `callSage()` aborts after `SOFT_TIMEOUT_MS`; webhook still returns 200; fallback message sent |
| KV unavailable | `getState` returns null, `setState` no-ops; user sees "Sage is thinking…" but webhook stays 200 |
| Duplicate inbound from sandbox quirks | Same `MessageSid` dedupe |

## 5. Failover behavior

| What fails | What the user sees | What we log |
|---|---|---|
| Anthropic 5xx | "Sage hit a snag — reply *RESTART* to try again." | `[wa/webhook] processing error` with err |
| KV unreachable | Same as above (state can't load) | `[wa/state] getState failed` |
| Twilio outbound 429 | One automatic retry after 2.2s; if still failing, log + drop | `[wa/sender] retry failed` |
| Invalid Twilio signature | `403 invalid signature` (no body) | None — signature failures don't get a TwiML 200 by design |
| Player sends gibberish at country step | Bot re-asks the country prompt (no state advance) | None |
| Player sends RESTART at any time | Fresh state created, kickoff messages sent | None |

## 6. Privacy

- **No raw phone numbers** in storage or logs. We store `sha256(WA_PHONE_SALT + e164).slice(0,16)`.
- **No user names**. The bot never asks. Pseudonymous handle `wa:<phoneHash>` is the identity.
- **State TTL is short**. 2h chapter state, 24h post-card. No long-term retention.
- **Citations only, never made-up data**. Wages + automation risk + growth values come from the orchestrator's real-data injection, not the model's prior.
- **Squad groups are membership-based**. Atlas does not track who is in which group; the WA platform is the source of truth. We can't see message content.

## 7. Roadmap (Phase 2 production)

### 7.1 Squad groups via Twilio Conversations API

Replace the env-var lookup in `squad.ts` with a Conversations-API-backed
service:

```
employer "join squad" → POST /api/squad/join
  → look up or create a Conversation per (country, ISCO, employer-id)
  → invite the employer phone to the conversation (proxy address)
  → return a deep link that opens WA with the conversation pre-loaded
```

Player end-of-quest does the same. Benefits:
- Per-employer dedicated groups instead of one shared per ward
- Programmatic kick / mute / archive
- Atlas can post a one-time pinned welcome message ("here's the candidate's
  Atlas Card") then exit the conversation

Requires: Twilio Conversations product enabled, verified WhatsApp sender
(no longer the sandbox), and the employer onboarding gate that captures their
phone for the proxy.

### 7.2 Meta WhatsApp Cloud API alternative

Direct Meta integration. Cheaper at scale but Meta Business verification can
take weeks; not worth the risk for a hackathon. Same `runChapter()` engine,
new adapter at `/api/wa/meta-webhook`.

### 7.3 Voice notes

Twilio sends `MediaUrl0` + `MediaContentType0` on inbound voice. Pipe to
OpenAI Whisper, feed transcript into `runChapter()` as `body`. Critical for
LMIC reach where typing is rarer than voice notes.

### 7.4 Multi-turn within a single chapter

Right now each `runChapter()` call advances exactly one chapter. Some chapters
should support clarifying follow-ups (e.g. ORIGIN when ISCO confidence < 0.5).
The orchestrator already returns `nextChapter === currentChapter` to indicate
"stay here, ask again" — Phase 2 wires this end-to-end.

### 7.5 Analytics

`MessageSid` + `phoneHash` per turn → KV stream → daily aggregation. Track
chapter drop-off, time-per-chapter, AI Tier distribution by country. No PII.

## 8. Files

```
src/
  app/api/wa/
    webhook/route.ts      ← Twilio inbound (POST)
    health/route.ts       ← env + squad presence check (GET)
  lib/
    orchestrator/
      index.ts            ← runChapter() — shared engine
      prompts.ts          ← Sage system prompt (cached) + chapter rubrics
      claude.ts           ← Anthropic SDK wrapper, prompt-cache marker
    wa/
      handler.ts          ← handleWaMessage(): KV + runChapter + state advance
      state.ts            ← Vercel KV per-phone state, dedupe, phone hash
      sender.ts           ← Twilio outbound + signature validation
      squad.ts            ← squad invite resolution (env-var lookup + roadmap)
docs/
  SETUP_TWILIO.md         ← Fanette's step-by-step
  WHATSAPP_GAME.md        ← this file
```
