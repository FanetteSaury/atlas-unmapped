# PRD.md — Atlas Product Requirements

## Positioning — **B2B SaaS** (locked 2026-04-26 morning)

Atlas is a **B2B platform**. Paying customers are:

- **Employers** (SMEs, recruiters in LMIC verticals: phone repair shops, tailoring co-ops, dev contractors, retail chains) — they pay per active hire / per cohort / per recruiter seat
- **NGOs / training providers** (BRAC, Generation, Pratham, Mastercard Foundation grantees) — they pay per cohort placement
- **Governments / multilaterals** (World Bank Youth Summit pilot countries, national youth agencies) — they pay per country deployment / per dashboard license

The **player Quest** (`/player` + Twilio Sandbox WhatsApp) is **free for youth** — it's the user-acquisition surface. Player onboarding feeds the talent pool that paying employers pay to access.

Three roles, one engine:

| Role | Surface | Paid? |
|---|---|---|
| Player (Amara) | `/player` + WA chat | Free |
| Employer / recruiter (Akosua) | `/employer` recruiter view | Paid |
| Program officer / policymaker | `/employer` program-officer toggle (aggregate signals) | Paid (NGO / gov license) |

Why this matters for design:
- The Quest has to be **fun + game-feel** (Hogwarts framing, lives, gems, boss fight) so players actually finish — that's the funnel. NOT transactional / wage-pitching at the start.
- The employer dashboard has to be **substantive + data-cited** — that's what justifies the subscription. ILOSTAT, Frey-Osborne, ITU citations matter to the buyer.
- The pitch leads with **employer revenue model** + **NGO/gov licensing** as the path to sustainability, with the youth-side viral loop (family WhatsApp) as the marginal-cost-zero acquisition channel.

---

## 0. The job to be done

> *Amara is 22, lives outside Accra, runs a phone-repair micro-business, taught herself basic Python from YouTube on a shared connection. She holds a secondary-school certificate. By any reasonable measure, she has skills. But no employer in her city knows she exists. No training program has assessed what she already knows. No labor-market system has a record of her.* (— UNMAPPED brief, p. 2)

**Atlas's JTBD for Amara:** *"In 12 minutes on the phone I already own, give me a credential the labor market can read, and put me in a room with employers who want my skills."*

**The user-facing promise:** open a WhatsApp-style chat → answer 8 short questions → walk away with a personal Atlas Card containing your ISCO-08 occupation code, your AI Fluency Tier (0–4), your real wage potential (ILOSTAT), your real automation risk (Frey-Osborne LMIC), and a link to a verified-employer WhatsApp squad.

This solves the **three structural failures** the brief identifies:

| Failure (brief, p. 2) | Atlas response |
|---|---|
| **Broken signals** — credentials don't translate to labor-market signals | ISCO-08 + O*NET task-content profile, attestor-backed, portable across borders |
| **AI disruption without readiness** | AI Tier 0–4 measurement (the only public dataset measuring this for informal-sector youth) |
| **No matching infrastructure** | Pseudonymous-by-default Atlas Card → real verified-employer WhatsApp squad |

## 1. Personas (one per shipped country)

| Persona | Country | ISCO-08 seed | Channel | Sample shape |
|---|---|---|---|---|
| **Amara**, 22 | Ghana 🇬🇭 | 7421 (Phone repair) | WhatsApp | Twi-English, ₵-denominated wage, Madina ward |
| **Riya**, 19 | Bangladesh 🇧🇩 | 7531 (Tailor / hand embroidery) | WhatsApp + imo | Bengali-English, ৳, Mirpur ward, female-stricter privacy default |

Each persona is a `samplePlayer` field in the country JSON config (`atlas/src/lib/config/countries/{iso2}.json`) — adding a country = adding a JSON file.

**Anti-pattern (brief, weak submissions):** "Serve a generic 'youth' user rather than a specific, constrained one." Atlas refuses generic. The whole engine routes off the persona's ISCO seed.

## 2. The three surfaces

### 2.1 Player (`/player`)

WhatsApp-style chat. Companion Select → 8 chapters in ~12 min → Atlas Card reveal.

| # | Chapter | Time | What player does | What Atlas measures | Brief module |
|---|---|---|---|---|---|
| 0a | **Inventory** | 45s | Multi-select AI tools used | Breadth of AI awareness | M2 (AI Readiness) |
| 0b | **Companion Select** | 20s | Pick one as guide | Tool depth indicator | M2 |
| 0c | **Drill-In** | 30s | Story of last AI use | Recency · concreteness · iteration | M2 |
| 1 | **The Origin** | 90s | Story of yesterday's 2-hour task | ISCO-08 seed · narrative cognition | M1 (Skills Signal Engine) |
| 2 | **The Forge** | 120s | Hardest professional achievement | O*NET task content · technical tier · grit | M1 |
| 3 | **The Mind** | 60s | Timed numeracy in their domain | STEP numeracy · speed × accuracy | M1 |
| 4 | **The Storm** | 90s | Conflict / angry-customer story | STEP socio-emotional | M1 |
| 5 | **The Oracle** | 180s | Boss fight: 3 phases (Intel · Loadout · Duel) | **AI Tier 0–4** (final composite) | M2 |
| 6 | **The Future** | 60s | Three-door choice + skill-gap | STEP openness · transfer · self-awareness | M1 + M2 |
| 7 | **The Tribe** | 90s | Forward to one attestor in their network | Network density · trust tier · response latency | M3 (Opportunity Matching) |
| F | **Atlas Card reveal** | 60s | View 4 reveals + WhatsApp squad | — | M3 |

**Atlas Card 4 reveals:**

| Reveal | Hook | Source |
|---|---|---|
| 💰 **VERDICT** | What you're worth (real ₵/$/৳/đ wage) | ILOSTAT 2024 (live API) |
| 🎭 **CLASS** | One of 8 archetypes (Artisan · Builder · Hustler · ...) | Atlas (ISCO clusters) |
| 🤖 **AI TIER** | 0–4 with concrete wage premium | Atlas (Oracle composite) |
| 🤝 **SQUAD** | Real local WhatsApp group of verified employers | Atlas + Employer side |

### 2.2 Employer (`/employer`)

Pseudonymous skill-density heatmap by ward + 4 KPIs + candidate list (filtered by ISCO + ward + privacy tier) + supply/demand chart.

| KPI | Source |
|---|---|
| Verified candidates by ISCO × ward | Postgres `AtlasCard` aggregation |
| % SMEs reporting skill gaps | World Bank Enterprise Surveys 2024 |
| Sector employment growth YoY | World Bank WDI 2024 |
| Mobile-money penetration | Global Findex 2024 |

**Privacy:** ward-level heatmap is T1 (always public). Candidate list is T2 (pseudonymous handles). Direct contact is T3 (consent-gated per WhatsApp intro).

### 2.3 Policymaker (`/policymaker`)

Aggregate dashboard with 6+ econometric signals.

| Chart | Source |
|---|---|
| Supply vs demand by skill cluster | Postgres aggregation × WBES |
| AI Tier distribution by cohort | Postgres `AtlasCard` aggregation |
| Frey-Osborne LMIC automation strip | Cached Frey-Osborne + ILO/WB reappraisal |
| Wittgenstein 2025–2035 cohort projection | Wittgenstein Centre |
| WBL gender legal score | WBL 2024 |
| Wage scenarios under skill-uplift | ILOSTAT × ATLAS_CLASSES × Tier premiums |

## 3. Country-agnostic spec

The brief (p. 4) requires these to be **configurable without changing the codebase**:

| Configurable | Where it lives in Atlas |
|---|---|
| Labor market data source / structure | `atlas/data/lmic/ilostat/{country}.json` + `atlas/src/lib/lmic/ilostat.ts` accessor |
| Education taxonomy / credential mapping | Country-specific in `atlas/src/lib/config/countries/{iso2}.json` |
| Language and script of the UI | Country `languages` + `primaryLanguage` field; Claude prompt receives this |
| Automation exposure calibration | `atlas/data/lmic/frey-osborne/lmic-reappraisal.json`, country-keyed |
| Opportunity types surfaced (formal · self-employment · gig · training pathway) | Country JSON `opportunityTypes` field |

**Live country swap demo (Phase 2):** GH ↔ BD switches all 3 surfaces in <30 seconds — same engine, same mechanics, same 12 minutes, three completely different lives.

## 4. Brief-compliance scope

| Brief module | Atlas implementation | Scope |
|---|---|---|
| **M1 — Skills Signal Engine** | ISCO-08 + O*NET task content + STEP rubrics; portable Atlas Card; human-readable | ✅ Full |
| **M2 — AI Readiness & Displacement Risk Lens** | AI Tier 0–4 (Atlas-original) + Frey-Osborne LMIC + Wittgenstein 2030 projections + adjacent-skill resilience | ✅ Full |
| **M3 — Opportunity Matching & Econometric Dashboard** | Player Atlas Card + Employer dashboard + Policymaker dashboard, dual interface, 6+ visible signals | ✅ Full |

**All three modules ship.** The brief requires ≥2; we ship 3.

## 5. Success metrics

| Metric | Target | Measured how |
|---|---|---|
| Player completes 8 chapters in ≤ 14 min | 80% of first-time players | `PlayerRun.completedAt - startedAt` |
| ISCO-08 assignment confidence | ≥ 0.6 average | `PlayerRun.iscoConfidence` |
| Econometric signals visible per Atlas Card | ≥ 4 | UI render count, manual audit |
| Country swap demo time on stage | ≤ 30s | Stopwatch on rehearsal |
| Real-data citation coverage | 100% of econometric values | UI audit: every `<DataSourceCitation>` resolves to live URL |
| Demo stability (3 country swaps + full player run + Atlas Card) without console error | 100% | Smoke test before submit |
| Vercel prod build time | ≤ 90s | CI |

## 5b. v2 deltas vs the v1 demo (from `demo_v1/TODO.docx`, Paola's pass)

These are the concrete UX/feature changes Paola identified after running the v1 demo. Every item below is wired into Phase 1–3 tasks in `TASKS.md`.

| Paola's TODO item | Atlas v2 response | Phase |
|---|---|---|
| **WhatsApp · Jeu** (game runs through real WhatsApp) | Twilio Sandbox webhook adapter + browser simulator (same `runChapter` engine, two channels) | P3 |
| **WhatsApp · Ajout à un groupe** (auto-add player to employer group at end) | Twilio Group API call on Tribe-chapter completion → adds the pseudonymous handle to a sample employer WA group → that's the 🤝 SQUAD reveal payoff on the Atlas Card | P3 |
| **Dashboard employeur · Lisibilité, jargon des skills normalisés** | Plain-language labels everywhere user-facing: never "ISCO-7421" alone, always **"Phone Repair Technician"** with the code as a tooltip / secondary line. Same for Frey-Osborne ("automation risk: 65%, source: ..."), NEET, WBES, etc. | P2 |
| **Dashboard employeur · Vérifier les data** | Every datum traces to `data/lmic/_meta.json` with `source.url` + `fetchedAt`. `<DataSourceCitation>` clickable link beside each value | P1+P2 |
| **Faire un mapping skills plus exhaustif** | ISCO-08 (433 unit-level occupations, universal ILO standard) + O*NET 28+ task content (LMIC-adapted via crosswalks) — far more exhaustive than the 5-occupation toy ESCO subset of v1 | P1 |
| **Demo Vercel** | `pnpm dlx vercel --prod` deploy gates each phase | P0 wake-up + P1+P2+P3 |
| **Pitch + Demo polish** | Paola's domain, ATLAS_BRIEF §8 5-slide outline as starting point | P2+P3 |
| **Map · Clusters sur les skills + chaque point = un user clickable** | **CSS grid of wards** (Madina/Mirpur) colored by skill density. Click a ward → expanded panel with pseudonymous candidate handles + their AI Tier badges. No Leaflet — faster, more demo-friendly | P2 |
| **Liste skills · Recherche selon filtres** | Search bar + chip filters (ISCO major group · ward · AI Tier · gender) on `/employer`. React state, no extra lib | P2 |
| **Adresser le problème des shared devices** | (1) "🗑️ Clear my data from this phone" button after Atlas Card reveal; (2) anonymous-by-default handle toggle; (3) shared-device disclosure in the privacy banner; (4) session timeout on `/player` after 30 min idle | P3 |

### Paola's Phase 2 brainstorm (post-hackathon, not v1 scope)

- **AI agent qui rappelle de jouer** — gamified retention loop with adaptive incentive based on past responses. Cool, but not stage-demo material in 8h. Roadmap.
- **Zelda-style NPC in the game** — Paola herself flagged this as "c'est de la triche" (not really an AI agent feature). Skip.

## 6. Non-goals (Phase 1 — hackathon)

- ❌ Production WhatsApp Cloud API (use Twilio Sandbox)
- ❌ Two-way voice (Whisper STT only, no TTS)
- ❌ Native mobile app / on-device LLM (Phase 2 roadmap; addressed via offline-graceful UX in P3)
- ❌ Auth + login (pseudonymous handle, phone hash for attestor)
- ❌ ESCO (LMIC-inappropriate)
- ❌ Psychometric IRT calibration (hackathon-grade rubrics, disclosed)
- ❌ Production Frey-Osborne reappraisal paper (use ILO/WB 2018 LMIC adaptation; cite)
- ❌ Multi-attestor flow (one attestor per Tribe chapter for v1)
- ❌ Employer billing / verified-employer onboarding (story only, no Stripe)

## 7. Privacy spec

3-tier, country × gender aware, WBL 2024-driven defaults:

| Tier | Visibility | Default |
|---|---|---|
| **T1 — Aggregate** | Ward-level heatmap, counts only, no identifiers | Always public |
| **T2 — Pseudonymous** | Handle (e.g. `AT-7421-Madina-T3`) + skill tier badges, no name | Default for most users |
| **T3 — Identified** | Name · photo · contact, only after explicit per-employer consent in WhatsApp | Always opt-in |

**Country defaults:** the privacy default for female users in Bangladesh / Pakistan / Iran / Saudi Arabia / Myanmar is **T1 (aggregate-only)** — WBL 2024 score + WGI rule-of-law score drives this. Resolved at runtime in `atlas/src/lib/privacy.ts`.

## 8. Honest-about-limits disclosure

Visible on every UI surface via `<HonestLimitsBanner>`:

> Atlas v0 uses hackathon-grade STEP-equivalent rubrics, calibrated against Ghana 2013 STEP anchors but **not psychometrically validated**. Production calibration requires 1000+ players × 6 months of IRT item-bank work. Scores are directional, not absolute. LMIC econometrics are real (sources cited inline). WhatsApp is via Twilio Sandbox in this submission; production deploys to Meta WhatsApp Cloud API.

This is a feature, not a confession. World Bank judges respect "the best teams know exactly what they don't know" (brief, p. 5).

## 9. Phase 2 roadmap (post-hackathon)

- IRT psychometric calibration (1000+ players × 6 months in Ghana pilot)
- Production Meta WhatsApp Cloud API + SMS Twilio fallback
- On-device LLM (Llama 3.2 1B / Gemma 2B) for true offline-first in low-bandwidth zones
- Multilingual native-speaker TTS (Twi, Bengali, Tagalog, Bahasa, Swahili)
- ESCO-LMIC fine-tune for informal-sector skills vocabulary
- Anti-gaming behavioral consistency layer
- Geographic expansion: Nigeria, Kenya, India, Philippines, Indonesia, Egypt, Pakistan
- Revenue: verified-employer subscriptions ($200/mo SME) + WB/NGO licensing + sponsored AI companions
