# Atlas — Technical Architecture

> System design, data flow, and engineering decisions behind the codebase.

## 1. System overview

Atlas is a single Next.js 16 application deployed on Vercel that serves three surfaces (player, employer, policymaker) and exposes one inbound integration (Twilio WhatsApp). All channels — WhatsApp messages, the browser game, the dashboards — share the same conversational engine and the same persistence layer.

```mermaid
flowchart TB
    subgraph Channels["Player Channels"]
        WA[("📱 WhatsApp<br/>Twilio Sandbox")]
        BROWSER[("🌐 Browser /player<br/>same engine")]
    end

    subgraph Edge["Vercel Functions (Node 22)"]
        WAW["/api/wa/webhook<br/>signature-validated<br/>200-OK in &lt;15s"]
        WAH["/api/wa/health"]
        CHAT["/api/chat<br/>stateless, ctx-in-body"]
        PROJ["/api/projects<br/>POST creates room"]
        CARDS["/api/cards/recent"]
        HEALTH["/api/health"]
    end

    subgraph Core["Channel-Agnostic Core"]
        ORCH["runChapter()<br/>orchestrator/index.ts"]
        SAGE["callSage()<br/>Claude Sonnet 4.6<br/>+ prompt caching"]
        HANDLER["wa/handler.ts<br/>RESTART/HELP/turn"]
    end

    subgraph Storage["Vercel KV (Upstash Redis)"]
        STATE[("wa:state:&lt;phoneHash&gt;<br/>2h TTL · SHA-256+salt")]
        SID[("wa:sid:&lt;MessageSid&gt;<br/>5min dedupe (SET NX)")]
        CARDSKV[("atlas:card:*<br/>30d TTL")]
        PROJKV[("atlas:project:*<br/>30d TTL")]
    end

    subgraph External["External APIs"]
        ANT["Anthropic API<br/>claude-sonnet-4-6"]
        TWI["Twilio REST<br/>WhatsApp send"]
    end

    WA -->|inbound POST| WAW
    BROWSER --> CHAT

    WAW --> HANDLER
    HANDLER --> ORCH
    CHAT --> ORCH
    ORCH --> SAGE --> ANT

    HANDLER <--> STATE
    WAW <--> SID
    PROJ <--> PROJKV
    PROJ <--> CARDSKV
    CARDS <--> CARDSKV

    WAW -.after()| TWI
    TWI -->|outbound msg| WA

    HEALTH -.probes.-> ANT
    HEALTH -.probes.-> Storage
    WAH -.checks env.-> Edge

    classDef edge fill:#0070f3,color:#fff
    classDef core fill:#7928ca,color:#fff
    classDef storage fill:#16a34a,color:#fff
    classDef ext fill:#ea580c,color:#fff
    class WAW,WAH,CHAT,PROJ,CARDS,HEALTH edge
    class ORCH,SAGE,HANDLER core
    class STATE,SID,CARDSKV,PROJKV storage
    class ANT,TWI ext
```

## 2. Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router) | One repo for SSR pages + Functions; first-class Vercel integration; `after()` for out-of-band processing. |
| Language | **TypeScript** (`strict: true`) | No "fix the types later." |
| Runtime | **Node.js 22** | Required by Next 16 on Vercel; pinned via `engines` in package.json. |
| Hosting | **Vercel** | Functions, KV, OIDC, edge auto-deploy from `main`. |
| LLM | **Anthropic Claude Sonnet 4.6** | Best price/latency on the depth of reasoning we need (chapter scoring, ISCO inference). Prompt caching configured. |
| Persistence | **Vercel KV (Upstash Redis)** | KV semantics fit per-phone state; TTLs for state/dedupe/cards; multi-region availability. |
| Messaging | **Twilio Sandbox** (WhatsApp) | Free for hackathons; signature-validated; `whatsapp:+14155238886` sandbox sender. |
| Validation | **zod** | Every API boundary; one schema, one source of truth. |
| Frontend | **React 19** + **Tailwind v4** | Standard. |
| Charts | **Recharts** + **Leaflet** | Policymaker dashboard + employer ward map. |
| CI | **GitHub Actions** | Type check + lint + test on every push (see `.github/workflows/ci.yml`). |

## 3. Channel-agnostic orchestrator

The system's central abstraction: one function — `runChapter()` in `src/lib/orchestrator/index.ts` — drives both WhatsApp and the browser. It takes a normalized `(input, context)` and returns `(replies, nextChapter, ctx, finished)`. Side-effecting parts (Twilio send, KV persistence) live at the edges.

This abstraction means:
- **Adding a new channel** (e.g. Telegram, SMS) is a thin adapter, not a rebuild.
- **Tests** could exercise the engine without mocking Twilio or KV.
- **Heuristic and LLM paths share the same return shape** — any chapter can degrade gracefully.

The chapter switch:
```
country → inventory → companion → drillin → origin → forge
                                              ↓
                                           oracle (boss fight)
                                              ↓
                                            future → tribe → card
```

## 4. WhatsApp pipeline

```
Twilio POST → /api/wa/webhook
  1. Read raw form body (need exact bytes for signature validation)
  2. Validate X-Twilio-Signature → 403 on mismatch
  3. Parse params (From, Body, MessageSid)
  4. KV SET NX wa:sid:<MessageSid> EX 300 → silent on duplicate
  5. Return 200 OK <Response/> immediately (TwiML empty — replies go REST)
  6. after() runs:
     a. handleWaMessage(from, body) → orchestrator → new state
     b. KV SET wa:state:<phoneHash> EX 7200
     c. sendMessages() — Twilio REST, 1100ms stagger, 429-retry once
```

Why this shape:
- Twilio's webhook deadline is 15s. Claude can take 5-8s. We can't block the ACK on the LLM.
- `after()` keeps the Vercel Function alive past the response — without it the Promise gets dropped (a silent demo-killer).
- 1100ms stagger respects Twilio Sandbox's 1 msg/sec/recipient limit.

## 5. Privacy architecture

| Concern | Mitigation |
|---|---|
| Phone-number storage | SHA-256 + salt → 16-hex prefix. **Raw E.164 never persisted.** Salt is `WA_PHONE_SALT` env. |
| Webhook spoofing | `validateTwilioSignature()` HMAC-SHA1 against `X-Twilio-Signature`. |
| Atlas Card share-URL forgery | HMAC-signed slug via `ATLAS_CARD_SIGNING_SECRET`. Slugs cannot be enumerated. |
| Replay attacks | `MessageSid` deduped via KV `SET NX` with 5-min TTL. |
| Stack-trace leakage | All `kv` calls are wrapped in best-effort try/catch; failures log + return null/empty. |
| Pseudonymous handles | `wa:<hash>` for WhatsApp users, `web:<runId>` for browser players. No real names anywhere. |

## 6. API contracts (zod-validated)

Six routes — see [docs/API.md](API.md) for full request/response shapes (or `/api/health` for live env probe).

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/health` | GET | none | Anthropic + KV reachability probe |
| `/api/wa/health` | GET | none | WhatsApp env presence + squad-group status |
| `/api/chat` | POST | none | Browser game turn — stateless, ctx in/out |
| `/api/cards/recent` | GET | none | Recent Atlas Cards by country |
| `/api/projects` | GET / POST | none | Employer projects: list / create |
| `/api/wa/webhook` | POST | **`X-Twilio-Signature`** | Twilio inbound — signature-validated |

## 7. Persistence schema

All keys in Vercel KV (Upstash Redis). All TTLs apply at write time.

| Key pattern | Value | TTL | Purpose |
|---|---|---|---|
| `wa:state:<phoneHash>` | `{ ctx, chapter, lastTurnAt }` | 2h | Per-phone game state. Phone hash is SHA-256(salt + E.164), 16 hex chars. |
| `wa:sid:<MessageSid>` | `1` (SET NX) | 5min | Twilio retry dedupe. |
| `atlas:card:<slug>` | `StoredCard` JSON | 30d | Completed Atlas Cards. Slug is 8-char crypto-random base36. |
| `atlas:cards:<country>` | LPUSHed slug list | 30d | Recent cards index by country (capped at 200). |
| `atlas:project:<slug>` | `StoredProject` JSON | 30d | Employer-posted projects. |
| `atlas:projects:<country>` | LPUSHed slug list | 30d | Recent projects index by country (capped at 200). |

## 8. Graceful degradation

The system is designed so that **any external dependency can be down and the demo still walks**:

| If this is unavailable… | …the system… |
|---|---|
| `ANTHROPIC_API_KEY` unset / API down | Falls back to heuristic chapter scoring (regex ISCO detection, AI-tier keyword matching). Card reveal still produces real ILOSTAT/Frey-Osborne data. |
| Vercel KV down / unreachable | Cards/projects writes silently no-op; reads return empty. Dashboards merge with seed cohort. Player can still walk the full quest. |
| Twilio creds unset | `sendMessages()` falls back to `console.log("[wa/sender:stub] -> ...")`. Browser channel unaffected. |
| `WA_PHONE_SALT` unset | Loud warning + insecure-fallback constant used. Surfaced in `/api/wa/health`. |
| Twilio signature missing | Webhook responds **403 invalid signature** in production, allows in dev. |

## 9. Performance characteristics

| Metric | Observed |
|---|---|
| `/api/health` response (cold) | ~500ms TTFB |
| `/api/health` response (warm) | ~50ms |
| Twilio webhook ACK (`/api/wa/webhook`) | <2s including signature validation + KV dedupe write |
| Claude orchestrator (`runChapter`) — heuristic | <50ms |
| Claude orchestrator (`runChapter`) — Sonnet 4.6 with caching | 2-5s p50, 8s p95, **5s soft-timeout returns null** |
| Build time (Vercel) | ~45s |
| Cold-start (Vercel Functions, Node) | ~700ms first hit, then warm |

Vercel KV (Upstash) is single-region per project; all reads/writes are sub-30ms within-region.

## 10. Security posture

- **No secrets committed.** Only `.env.example` lives in the repo.
- **All API inputs validated with zod.** Bad payloads → 400 with structured error.
- **Outbound LLM calls are abort-controllable** with a 5-second soft timeout. The webhook never blocks on Claude.
- **All KV calls are best-effort** — failures log and fall through; no leaked stack traces.
- See [SECURITY.md](../SECURITY.md) for the full security policy + reporting.

## 11. CI/CD

`.github/workflows/ci.yml` runs on every push to `main` + PRs:

1. `actions/checkout@v4`
2. Enable corepack (pnpm via lockfile)
3. `actions/setup-node@v4` Node 22 + pnpm cache
4. `pnpm install --frozen-lockfile`
5. `pnpm exec tsc --noEmit`
6. `pnpm lint` (eslint, 0 warnings target)
7. `pnpm exec vitest run --passWithNoTests`

Vercel's GitHub integration auto-deploys `main` to production. PRs get preview URLs.

## 12. Known gaps

These are deliberate hackathon-grade trade-offs, all flagged in [SECURITY.md](../SECURITY.md):

- ❌ No rate limiting on `/api/chat` (10-line KV bucket would solve)
- ❌ No CAPTCHA on `/api/projects` POST
- ❌ No automated test suite (smoke-tested manually + via `/api/health`)
- ❌ No structured logging (ad-hoc `console.error`s)
- ❌ No load testing — KV is single-region, Vercel Functions auto-scale, but no proof at >100 RPS
- ❌ Twilio Sandbox only (Meta Cloud API for production)

## 13. Repo layout

```
202604_Hack_Nation/
├── atlas/                          # Next.js 16 application (Vercel root)
│   ├── src/
│   │   ├── app/                    # App Router — landing, /player, /employer, /policymaker, /api/*
│   │   ├── components/             # TopBar, CountryToggle, HonestLimitsBanner, DataSourceCitation
│   │   ├── lib/
│   │   │   ├── orchestrator/       # runChapter + Anthropic wrapper + prompts
│   │   │   ├── wa/                 # Twilio webhook, sender, state, squad invites
│   │   │   ├── storage/            # KV — cards, projects
│   │   │   ├── data/               # Curated LMIC data (wages, automation risk, seed cohort)
│   │   │   ├── scoring/            # STEP-equivalent rubric scoring
│   │   │   ├── skills/             # ISCO-08 + O*NET task mapping
│   │   │   ├── lmic/               # Country config (GH, BD)
│   │   │   └── config/             # Game schema
│   │   └── styles/                 # Tailwind v4 + design system layer
│   ├── public/v2/                  # Static demo (vanilla JS) served at /v2/*
│   └── docs/                       # Internal strategy docs (PITCH_SCENARIO, COMPLIANCE_LEDGER, ...)
├── docs/                           # Public-facing documentation
│   ├── ARCHITECTURE.md             # ← you are here
│   ├── PRODUCT.md                  # User flows + features
│   └── SUBMISSION.md               # Hackathon submission record
├── .github/workflows/ci.yml        # CI pipeline
├── README.md                       # Project narrative + quickstart
├── CHANGELOG.md
├── SECURITY.md
└── LICENSE                         # MIT
```
