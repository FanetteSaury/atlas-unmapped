# Atlas — Product / Functional Documentation

> What the application does, who uses it, and how each user flow runs.

## 1. Mission

In low- and middle-income countries (LMICs), up to **90% of young workers operate informally**. They have real skills, but no LinkedIn, no CV, often no formal credential — and many can't write English well enough for a typical job platform. Hiring happens through family WhatsApp groups, peer recommendations, and word of mouth. None of those signals scale.

**Atlas measures informal-sector skills in the channel people already use.** A 12-minute conversation on WhatsApp (or a browser-mock of it) produces a verified ISCO-08 occupation code, a STEP-equivalent skill score, an Atlas-original AI Tier (0–4), and a wage benchmark — instantly shareable, matchable to local employers.

## 2. Three personas, one engine

Atlas serves three audiences from the same backend:

### 2.1 Amara — the Player

**Persona:** 22-year-old phone repair technician in Madina, Greater Accra. Left school at 16. Fixes 8–12 phones a day. Knows three brands of soldering iron by feel. Triages screen replacements while explaining the trade-off in Twi to her customer.

**Why Amara:** she has real, measurable skills. She uses ChatGPT weekly to look up part numbers (= AI Tier 2). But every existing labor-market tool — LinkedIn, ESCO, Northern HR stacks — fails before it can capture any of that.

**What she gets from Atlas:**
- 12-minute phone conversation in plain language (text now; voice in v0.2)
- An **Atlas Card** with her ISCO-08 code (7421 Phone Repair Technician), AI Tier (2 — Active, +20% wage premium), Atlas Class (🔧 Artisan), wage benchmark (₵2,400/mo formal vs ₵1,050/mo informal), automation risk (45% LMIC-adjusted vs 65% US baseline), and a skill gap she named herself ("digital marketing")
- A **squad invite** — a WhatsApp room with verified Madina-area employers who just posted projects matching her skill cluster
- A **shareable share-URL** she can forward to one person who's seen her work

### 2.2 Karim — the Recruiter

**Persona:** SME owner — 4-employee phone shop in East Legon. Needs a Saturday-only screen-replacement specialist. Hires through WhatsApp because LinkedIn returns zero local candidates and family-WhatsApp candidates don't have verified skills.

**What he gets from Atlas:**
- **Employer Dashboard** at `/employer` — pseudonymous candidate cards by ward, ISCO, AI tier
- **Post-a-Project flow** — type the role, ward, day needed → Atlas counts matched candidates from KV-stored Atlas Cards → returns a per-project WhatsApp invite link → (production) auto-pings each matched candidate
- **1:1 deep-link** to message a specific candidate via Atlas's concierge number; the candidate's real number is never exposed without consent

### 2.3 Maame — the Policymaker / NGO Programme Officer

**Persona:** youth-employment programme officer at a Ghana-based NGO. Designs cohort programs. Needs aggregate, country-specific evidence to brief funders, design curricula, and prove programme impact.

**What she gets from Atlas:**
- **Policymaker Dashboard** at `/policymaker` — Ghana ↔ Bangladesh country toggle
- Aggregate **Atlas Cards by ISCO/ward/AI tier**
- Real WDI / WBL 2024 / Findex 2024 / FLFP / Wittgenstein 2030 data overlaid on the cohort
- Cite-this-dataset modal (APA + BibTeX) for academic / policy briefs
- Distributed under CC BY 4.0 for derived metrics

## 3. The Player flow — 8 chapters, ~12 minutes

The game is structured as 8 chapters with a 3-life mechanic and 7 collectible "gems." Substantive answers earn gems; one-word "yes/no/skip" answers cost a life. Three lives lost = pause + resume invitation.

| # | Chapter | Player input | What gets measured |
|---|---|---|---|
| 1 | **Country** | "GH" or "BD" | Country code + game state init |
| 2 | **Inventory** | Picks from 6 work archetypes (fix / make / grow / sell / care / code) | ISCO seed (4-digit unit code) + breadth score |
| 3 | **Companion** | Picks 1 of 4 LLM archetypes (Sage / Spark / Scout / Kira) | Personality framing — does NOT affect scoring |
| 4 | **Drill-in** | "Last new tool / app / AI you tried this month?" | Provisional AI Tier 0–4 |
| 5 | **Origin** | "Tell me what you did yesterday" | ISCO unit-code refinement (heuristic regex + Claude classification when available) |
| 6 | **Forge** | "Hardest thing you ever pulled off" | STEP-equivalent depth, escalation count, setbacks count, O*NET task matches |
| 7 | **Oracle (boss fight)** | Reply TRUST / STRIKE / **PROBE** to a partial-truth claim | Calibration score → AI Tier final lock. PROBE unlocks Tier 3+; STRIKE caps at Tier 2. |
| 8 | **Future** | Pick a door (1/2/3) + name a skill you'd need | Openness score + skill-gap string |
| 9 | **Tribe** | "Forward this card to one person who's seen you work" | Social-proof bit |
| 10 | **Card reveal** | (no input) | Atlas Card constructed and persisted |

The chapter list is defined in `src/lib/orchestrator/index.ts`. Each chapter handler is a pure function from `(input, ctx)` to `(replies, nextChapter, ctx)`.

## 4. The Atlas Card

The output of a successful run. Persisted in Vercel KV with a 30-day TTL. Visible to:
- The player (instantly, via share-URL with HMAC-signed slug)
- Recruiters (pseudonymous, on the employer dashboard)
- Policymakers (aggregated, on the policymaker dashboard)

Card contents:
- **ISCO-08 occupation** — 4-digit unit code + title + confidence %
- **Atlas Class** — one of 🧠 Solver / 💻 Builder / 🎨 Storyteller / 🤝 Dealmaker / 🌾 Grower / 🔧 Artisan / ⚡ Striver
- **AI Tier** — 0 (Unfamiliar) to 4 (Builder), with wage-premium multiplier
- **Wage benchmark** — formal/informal medians from ILOSTAT 2024 in local currency
- **Projected wage** — wage × (1 + AI Tier premium)
- **Automation risk** — Frey-Osborne 2013 score + ILO/WB 2018 LMIC reappraisal (more durable than US baseline due to manual content)
- **O*NET task matches** — when Claude scoring is available, up to 4 verbatim O*NET task descriptions
- **Answer pattern tags** — drawn from chapter scores: _specific_, _iterative_, _resilient_, _calibrated_, _polymath_, _self-aware_
- **Skill-gap edge** — the player's own statement of what they need to learn next

## 5. The AI Tier (Atlas-original measurement)

A measurement that does not exist in any public dataset. Five levels:

| Tier | Label | Premium | What it means |
|---|---|---|---|
| 0 | Unfamiliar | 0% | Never used AI tools |
| 1 | Curious | +5% | Tried ChatGPT once, used WhatsApp + YouTube tutorials |
| 2 | Active | +20% | Uses Claude / ChatGPT / Gemini weekly for real tasks |
| 3 | Power User | +50% | Cursor, MCP, n8n, agent workflows, prompt engineering |
| 4 | Builder | +100% | API integrations, fine-tuning, building on top of LLMs |

Calibrated by:
1. **Drill-in chapter** — provisional tier from keyword regex on "last tool tried"
2. **Oracle boss fight** — calibration test (PROBE for Tier 3+, STRIKE caps at Tier 2)
3. **Final tier** = max(provisional, calibrated)

## 6. Squad invites — matching candidates to employers

After the Atlas Card reveal, players get a "🤝 Your squad" message with a `chat.whatsapp.com/...` invite link to a country×ISCO WhatsApp group. Resolution logic in `src/lib/wa/squad.ts`:

1. Look up env var `WA_GROUP_<COUNTRY>_<ISCO>` (e.g. `WA_GROUP_GH_7421`)
2. If set → real invite link
3. If not set → placeholder `chat.whatsapp.com/atlas-pending-...` (404s, surfaced in `/api/wa/health`)

For employers: clicking "Contact" on a candidate card opens a 1:1 WhatsApp deep-link to Atlas's concierge number (Twilio Sandbox by default, override via `WA_CONCIERGE_NUMBER`) with a pre-filled introduction message. The candidate's real number is never exposed without consent.

## 7. Post-a-Project flow

Employer-side, instead of permanent guild groups: **Atlas matches around projects.**

```
Employer at /employer → "Post a project" dialog
  ↓ POST /api/projects { title, isco, ward, dayNeeded, headcount }
  ↓ Atlas scans Atlas Cards in KV: same ISCO + same/no-ward filter + AI Tier ≥ 1
  ↓ Returns: { project, invite: { url, name, configured } }
  ↓ Employer dashboard renders matched candidate count + WhatsApp room link
  ↓ (production) Atlas WhatsApps each matched candidate the project + join link
```

In production this becomes Twilio Conversations API creating fresh group rooms per project. In the demo it falls back to the country×ISCO permanent group.

## 8. Country swap (Ghana ↔ Bangladesh)

Country-agnostic by design. Adding a third country is a JSON config change, not code:

```ts
// src/lib/lmic/<country>.ts
{
  code: "GH",
  name: "Ghana",
  flag: "🇬🇭",
  currency: "₵",
  sampleCity: "Madina",
  samplePlayer: { iscoSeed: "7421", aiTier: 2 },
  // ...
}
```

The orchestrator, scoring, and all dashboards read country-keyed data from `WAGES`, `ALL_WARDS`, `ISCOS_BY_COUNTRY`, `SEED_CARDS`, `AUTOMATION_RISK`. A `?country=BD` query swaps everything live.

## 9. Real data, every datum cited

Every number on screen is sourced. The `DataSourceCitation` component renders the inline citation. Data layer:

| Source | What we use |
|---|---|
| **ILOSTAT 2024** | Wage medians (formal + informal) per ISCO × country |
| **WDI 2024** | Sector employment %, female labor-force participation, GDP per capita, youth NEET |
| **Frey-Osborne 2013** + ILO/WB 2018 reappraisal | Automation risk (US baseline + LMIC-adjusted) |
| **WBES** | Firm-level skill-gap reporting |
| **WBL 2024** | Women, Business & the Law |
| **Findex 2024** | Mobile-money + financial inclusion |
| **Wittgenstein 2030** | Population by education projection |
| **HCI** | Human Capital Index |
| **ITU 2023** | Mobile broadband + internet penetration |
| **ISCO-08 + O*NET** | Skills taxonomy |
| **STEP** | Skills-measurement rubrics; Ghana 2013 STEP used as calibration anchor |

Note: We do **not** use ESCO. ESCO is Eurocentric and assumes formal-sector employment — a poor fit for the ~90% of LMIC youth who work informally.

## 10. Channels

### 10.1 Browser channel (`/player`)

Stateless. The client carries the full `PlayerContext` + current chapter in the request body. Server returns the new ctx + replies. No KV needed for the web channel — perfect for fast iteration and demo reliability.

### 10.2 WhatsApp channel (`/api/wa/webhook`)

Stateful via Vercel KV. One key per phone (`wa:state:<hash>`), 2-hour TTL. The webhook returns 200 OK in <15s and processes the LLM turn in `after()`, pushing the reply via Twilio REST. Falls back to a "Sage hit a snag" message if processing errors. Falls back to console-stub if Twilio creds are unset.

## 11. Honest limits

Calibrated to be the most credible thing on screen:

> Atlas v0 uses hackathon-grade STEP-equivalent rubrics, calibrated against Ghana 2013 STEP anchors but **not psychometrically validated**. Production calibration requires 1000+ players × 6 months of IRT (Item Response Theory) work. Scores are directional, not absolute. LMIC econometrics are real (sources cited inline). WhatsApp pipe is Twilio Sandbox; production deployment uses Meta WhatsApp Cloud API. Voice STT only (Whisper). TTS deferred — accent quality requires native-speaker calibration in 20+ LMIC languages.

Surfaced in:
- `<HonestLimitsBanner>` component on every dashboard
- Footer of every page
- README "Honest limits" section
- CHANGELOG v0.1.0 entry

## 12. Roadmap snapshot (v0.2 → v1)

| Phase | What ships |
|---|---|
| **v0.1 (current)** | Hackathon prototype: 8 chapters, browser + Twilio Sandbox, KV persistence, 2 countries (GH + BD), real data hardcoded |
| **v0.2** | Voice STT/TTS end-to-end (Whisper + native-speaker TTS), Meta WhatsApp Cloud API migration, KV → Postgres for cohort analytics, rate limiting |
| **v1** | IRT calibration with 1000+ players × 6 months, anti-gaming detection, longitudinal tracking, multi-language ESCO/ISCO fine-tune (Twi, Bengali, Vietnamese, Tagalog, Bahasa, Swahili) |

See [`atlas/docs/STRATEGY.md`](../atlas/docs/STRATEGY.md) for the longer strategic UX rationale.

## 13. References inside this doc

- Technical architecture → [ARCHITECTURE.md](ARCHITECTURE.md)
- Hackathon submission record → [SUBMISSION.md](SUBMISSION.md)
- Internal strategy docs (UX, pitch scenario, brief compliance) → [`atlas/docs/`](../atlas/docs/)
- Live deploy → https://atlas-mu-vert.vercel.app
- Repo → https://github.com/FanetteSaury/atlas-unmapped
