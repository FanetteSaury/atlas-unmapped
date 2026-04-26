# Atlas — Project Brief

**Hack-Nation 2026 · Track 5: UNMAPPED · The World Bank Youth Summit**

> *Closing the distance between real skills and economic opportunity in the age of AI.*

Last updated: 2026-04-25

---

## 0. Executive Summary

**Atlas** is a WhatsApp-native conversational game that, in **12 minutes**, measures three things no existing tool measures for the **600 million unmapped young people** across **75 Low- and Lower-Middle-Income Countries (LIC + LMIC)**:

1. **STEP-equivalent skill scores** (cognitive · socio-emotional · job-specific)
2. **An ISCO-08 / ESCO occupation code assignment** with attestor-backed confidence
3. **An AI Fluency Tier (0–4)** — a measurement that does not exist in any public dataset

It then surfaces **six real econometric signals** (ILOSTAT wages, WDI sector growth, Frey-Osborne automation risk, WBES skill gaps, WBL gender legal context, Findex digital readiness) to give those measurements economic meaning, and routes the player to a real local WhatsApp squad of verified employers.

The demo includes three working surfaces (player chat · employer dashboard · policymaker dashboard), all running on a configurable backend that supports country swap (Ghana ↔ Bangladesh ↔ Vietnam) without changing code.

---

## 1. Today's Work — Chronological Summary

| Phase | What we did | Output |
|---|---|---|
| **1. Brief decoding** | Read all 4 hackathon tracks. Picked Track 5 (UNMAPPED) for marketer-led team fit. Decoded the brief's 3 modules + country-agnostic + real-data + design-for-constraint + honest-about-limits requirements | Track selection + brief compliance map |
| **2. Persona research** | Built two grounded personas (Brian, Uganda LIC · Amara, Ghana LMIC). Pulled 2024-2026 data on LinkedIn penetration, WhatsApp dominance, mobile gaming, AI tool exposure | Persona dossier with verified statistics |
| **3. LMIC universe mapping** | Indexed all 75 LIC + LMIC countries by communication channel, dominant social media, top job platforms, informal recruiting paths | Master country table — 75 rows × 5 channels |
| **4. Family-WhatsApp insight** | Verified that family WhatsApp is the dominant labor matching channel in LMICs. 95-97% penetration in major African countries. India 620M users. 78% of Indian workers prioritize family in career decisions | Strategic foundation: build on top of family WhatsApp, not against it |
| **5. Econometric indicator analysis** | Mapped each brief data source against (skills validated, opportunity surfaced, measurability, LMIC density, build relevance). Selected 6 to wire in | Indicator matrix + final pick |
| **6. Measurement methodology** | Defined what Atlas MEASURES (STEP-equivalent + ISCO/ESCO + AI Tier) vs what it SURFACES (wages, growth, risk). Built the chapter-by-chapter measurement spec | Measurement deck — 8 chapters × 4 methods |
| **7. Game design (3 iterations)** | v1 form-disguised-as-questions → v2 weapon mechanics → **v3 universal Boss Fight + LLM Companion select**. Each iteration sharpened against "would a stranger play?" | Game design spec |
| **8. Atlas demo build** | Pivoted to local HTML in workspace. Built landing + player chat + employer + policymaker. Wired scoring engine + ESCO catalog + cached econometric data | **Working demo, runnable from `atlas/index.html`** |
| **9. Privacy architecture** | 3-tier privacy (public heatmap → pseudonymous → consent-gated) with country-aware defaults (stricter for Bangladesh / Pakistan / Iran female users). Disabled employer mapping in conflict zones | Safeguarding layer designed for World Bank judges |

---

## 2. The Logic Behind Atlas

### 2.1 The problem the brief asks us to solve

The UNMAPPED brief identifies **three structural failures** in LMIC labor markets:

| Failure | What it means |
|---|---|
| **Broken signals** | Education credentials don't translate to labor-market signals. A WASSCE certificate tells employers almost nothing meaningful |
| **AI disruption without readiness** | Routine work concentrated in LMIC youth faces highest automation risk — and they have no tools to navigate it |
| **No matching infrastructure** | Even where skills + jobs exist in the same place, informal hiring networks systematically exclude the most vulnerable |

The brief's call: **build infrastructure (not a product) — an open, localizable layer that any government, NGO, training provider, or employer can plug into.**

### 2.2 The non-obvious insights we built on

| Insight | Source | Why it matters |
|---|---|---|
| LinkedIn isn't missing in LMICs — it's there but **structurally exclusionary** to informal-sector youth | DataReportal Ghana: 3.1M LinkedIn users (~9% of population), concentrated Accra-elite | Don't build "LinkedIn for Africa." Build **upstream credentialing** that feeds INTO LinkedIn, WhatsApp, Jobberman, Bdjobs |
| **Family WhatsApp = the de facto labor matching channel** in 73 of 75 LMICs | 95-97% WA penetration · 78% India workers prioritize family in career · 800M global WA groups · $22.7B Egypt remittances flow through family WhatsApp | Build the credential layer that makes family-WhatsApp matching **auditable, portable, and credible** to recruiters |
| **AI fluency is the highest-leverage individual skill in 2026 labor markets** — and nobody is measuring it for informal-sector youth | Indeed/Valuvox 2025 · Meta dropping degree requirements · WEF Future of Jobs 2025 | This is Atlas's **moat**. STEP doesn't measure it. ESCO doesn't. ILO doesn't. We do |
| **Mobile gaming is universal** — Free Fire + PUBG each have 15M+ MAU in Africa, India 560M+ mobile gamers | Africa Gaming Market 2024 · DemandSage 2026 · GSMA | The thumb-muscle memory exists. Gamified skill assessment will outperform forms |
| **STEP only covers ~17 LMICs**. ESCO is EU-built. O*NET is US. Frey-Osborne is US-native | World Bank STEP Microdata · ESCO ec.europa.eu · ILO LMIC adaptations | Atlas extends STEP-equivalent measurement to **all 75 LIC + LMIC** at scale |

### 2.3 The wedge

Atlas does ONE thing no other tool does:

> **It measures, in 12 minutes on a phone Amara already owns, the two skill dimensions that recruiters in 2026 actually pay for — and routes her to where she can monetize them.**

The two dimensions: **(1) verified skill profile** (STEP-equivalent + ESCO codes + community attestor) + **(2) AI fluency Tier 0-4**. The first dimension makes her legible. The second tells the labor market what she's worth in the AI era.

### 2.4 The moat

| Moat layer | What competitors can't copy |
|---|---|
| **AI fluency measurement** | First public dataset of individual AI capability for informal-sector youth |
| **STEP at scale** | First STEP-equivalent measurement engine that runs on a phone in 75 countries (vs ~17 with paper STEP today) |
| **WhatsApp + family viral loop** | First credentialing protocol that piggybacks on the world's largest social graph |
| **Country-agnostic infrastructure** | First labor-market layer that swaps across Ghana / Bangladesh / Vietnam / Egypt / Philippines without code changes |
| **Privacy-aware by country** | First credential platform with country-tier privacy defaults (stricter for Bangladesh / Pakistan / Iran female users by default) |

---

## 3. The Solution — Atlas

### 3.1 Three surfaces, one configurable backend

```
                     ┌──────────────────────────────────┐
                     │ CONFIGURABLE BACKEND              │
                     │ • Conversation orchestrator       │
                     │ • ESCO/ISCO mapper                │
                     │ • Scoring engine (rubrics)        │
                     │ • ILOSTAT/WDI/WBES cache + API    │
                     │ • Country config layer (JSON)     │
                     │ • Privacy-tiered identity         │
                     └────┬───────────┬────────────┬────┘
                          │           │            │
                  ┌───────▼──┐  ┌─────▼─────┐  ┌──▼──────────┐
                  │ Player   │  │ Employer  │  │ Policymaker │
                  │ Quest    │  │ Squad +   │  │ Aggregate + │
                  │ (chat)   │  │ Heatmap   │  │ Econometric │
                  └──────────┘  └───────────┘  └─────────────┘
```

**Why three surfaces, not one**: this IS the "infrastructure not product" framing the brief demands. Three plug-in points. Same engine. Country-swap-able.

### 3.2 The Player Quest — 8 chapters in ~12 minutes

| # | Chapter | Time | What player does | What Atlas measures |
|---|---|---|---|---|
| 0a | **Inventory** | 45s | Multi-select AI tools used | Breadth of AI awareness |
| 0b | **Companion Select** | 20s | Pick one as guide for the quest | Preferred tool / depth indicator |
| 0c | **Drill-In** | 30s | Tell story of last AI use | Recency · concreteness · iteration · output use |
| 1 | **The Origin** | 90s | Story of yesterday's 2-hour task | ISCO occupation seed · language profile · narrative cognition |
| 2 | **The Forge** | 120s | Hardest professional achievement | ESCO skill codes · technical tier · grit · problem-solving |
| 3 | **The Mind** | 60s | Timed numeracy problem in their domain | STEP numeracy · speed × accuracy |
| 4 | **The Storm** | 90s | Conflict / angry-customer story | STEP socio-emotional · hostile attribution · emotion regulation |
| 5 | **The Oracle** | 180s | Boss fight: 3 phases (Intel · Loadout · Duel) | **AI Tier 0-4** (final composite) |
| 6 | **The Future** | 60s | Three-door choice + skill-gap | STEP openness · transfer reasoning · self-awareness |
| 7 | **The Tribe** | 90s | Forward to one attestor in their network | Network density · trust tier · response latency |
| F | **Atlas Card reveal** | 60s | View 4 reveals + 3 doors forward | — |

### 3.3 The 4 reveals on the Atlas Card

| # | Reveal | Hook | Source |
|---|---|---|---|
| 💰 | **VERDICT** | What you're worth (real ₵/$/৳/đ wage) | ILOSTAT 2024 (surfaced) |
| 🎭 | **CLASS** | One of 8 archetypes (Artisan / Builder / Hustler / etc.) | Atlas measures (ESCO clusters) |
| 🤖 | **AI TIER** | 0-4, with concrete wage premium | Atlas measures (Oracle composite) |
| 🤝 | **SQUAD** | Real local WhatsApp group of verified employers | Atlas + Employer side |

### 3.4 The Companion Select — Mario Kart for AI

The character pick screen is itself the **first AI capability measurement**. Real LLM tools listed by name (ChatGPT · Claude · Gemini · Copilot · DeepSeek · Meta AI · regional LLMs · None). Player multi-selects breadth, picks one as guide, tells last-use story.

| Player picks | Character archetype |
|---|---|
| Claude | 🧙 SAGE (thoughtful, careful) |
| ChatGPT | ⚡ SPARK (versatile, energetic) |
| Gemini | 🦅 SCOUT (search-savvy, multimodal) |
| Copilot | 🎯 KIRA (technical specialist) |
| DeepSeek / open-source | 🔥 EMBER (raw, bold) |
| Local / regional LLM | 🌅 ZURI (local-fluent) |

The pick determines the rival in the boss fight (your guide vs the AI you DIDN'T pick — testing cross-tool judgment).

### 3.5 The Oracle Boss Fight — three phases

| Phase | What happens | Measures |
|---|---|---|
| **Phase 1 — Intel (45s)** | Player tells war story → earns starter weapon class | Real AI use authenticity |
| **Phase 2 — Loadout (60s)** | Player voices a domain-specific prompt → forge weapon tier (Iron / Steel / Mythril) | Prompt fluency across 5 dimensions |
| **Phase 3 — Duel (90s)** | 3 rounds vs SPARK with TRUST / STRIKE / PROBE choices, HP bars, calibration trap | Hallucination detection + calibration (R3 partial truth = the unfakeable Tier 3 indicator) |

### 3.6 The 6 econometric signals (brief-mandated visible data)

| # | Signal | Source | Where surfaced |
|---|---|---|---|
| 1 | **Wage by ISCO occupation × country** | ILOSTAT 2024 | Player score reveal · Employer KPI · Policymaker scenario |
| 2 | **Sector employment growth (YoY)** | World Bank WDI 2024 | Player score reveal · Employer KPI · Policymaker chart |
| 3 | **Automation probability (LMIC-adapted)** | Frey-Osborne + ILO/WB 2024 reappraisal | Player score reveal · Policymaker chart |
| 4 | **Employer skill gaps (% SMEs)** | World Bank Enterprise Surveys 2024 | Employer KPI · Policymaker chart |
| 5 | **Gender legal score** | Women Business & Law (WBL) 2024 | Privacy-default driver (backend) · Policymaker block |
| 6 | **Mobile-money + digital connectivity** | Global Findex 2024 | Employer KPI · Player viability check |

### 3.7 Privacy architecture — 3 tiers + country-aware defaults

| Tier | Visibility | Default in conflict / restrictive countries |
|---|---|---|
| T1 — Aggregate | Ward-level heatmap, counts only, no identifiers | Always public |
| T2 — Pseudonymous | `@AT-7421-Madina-T3` handle + skill tier badges | Disabled for female users in BD / PK / IR / SA / MM |
| T3 — Identified | Name · photo · contact (only after explicit per-employer consent in WhatsApp) | Always opt-in, never auto-granted |

Backend driven by WBL 2024 score + WGI rule-of-law indicator → privacy default level resolved per country × gender.

---

## 4. What's Built — Demo Inventory

The working demo lives in `demo_v1/`.

### 4.1 File inventory

| File | Lines | Purpose |
|---|---|---|
| `index.html` | ~110 | Landing page · 3 entry buttons · brief-compliance table · stat row |
| `player.html` | ~85 | Player shell · WhatsApp-style phone frame · live measurement rail |
| `employer.html` | ~190 | Country-toggle · 4 KPIs · ward-level heatmap · candidate list · supply/demand chart |
| `policymaker.html` | ~280 | Aggregate KPIs · supply/demand × growth · AI Tier strat · wage scenario · Frey-Osborne · Wittgenstein · WBL |
| `styles/main.css` | ~250 | Brand · landing · responsive |
| `styles/player.css` | ~310 | WhatsApp visual · weapon row · gem tracker · Atlas Card modal |
| `styles/dashboard.css` | ~180 | Heatmap · bar charts · candidate list · privacy banner |
| `scripts/configs.js` | ~110 | Countries (GH/BD/VN) · AI tools · Characters · Atlas Classes · Weapons · Bonus gems |
| `scripts/scoring.js` | ~250 | Inventory · Origin · Forge · Mind · Heart · PromptFlex · Duel · AI Tier composite · Class assignment · Verdict |
| `scripts/chapters.js` | ~150 | Chapter prompts · sample responses · Oracle SPARK lies × occupation |
| `scripts/player.js` | ~600 | Main quest orchestrator with state machine, typing animation, weapon row, HP bars, Atlas Card reveal |
| `scripts/landing.js` | ~25 | Landing micro-interactions |
| `data/econometric.js` | ~110 | ILOSTAT × WDI × Frey-Osborne × WBES × WBL × Findex × Wittgenstein for GH/BD/VN |
| `data/esco.js` | ~75 | ESCO catalog (5 ISCO occupations × ~6 skills each) |

### 4.2 What works end-to-end

| Feature | Status |
|---|---|
| Landing page with 3 entry points | ✅ Working |
| Country toggle (Ghana / Bangladesh / Vietnam) | ✅ All 3 surfaces |
| Player WhatsApp-style chat with typing animation | ✅ Working |
| Inventory phase (multi-select AI tools + companion select + drill-in) | ✅ Working |
| 7 chapters with sample-answer fallback for reliable demo | ✅ Working |
| Live measurement rail (ISCO · AI Tier · ESCO chips · all 6 STEP scores) | ✅ Working |
| Boss fight with HP bars, weapon row, 3-round duel, calibration trap | ✅ Working |
| Atlas Card final reveal modal | ✅ Working |
| Employer dashboard with heatmap + candidate list + supply/demand | ✅ Working |
| Policymaker dashboard with 6 econometric signals + AI strat + scenario | ✅ Working |
| Privacy banner + 3-tier visibility logic | ✅ Working |

### 4.3 To run the demo

```bash
# Option A — open the file directly
open atlas/index.html

# Option B — local server (recommended for some browsers)
cd atlas && python3 -m http.server 8765
# then open http://localhost:8765
```

---

## 5. Brief Compliance — Where Atlas Hits Each Requirement

| Brief requirement | Atlas implementation | Status |
|---|---|---|
| **Infrastructure, not product** | 3 surfaces (Player / Employer / Policymaker) on one configurable backend with JSON country configs | ✅ |
| **Build ≥ 2 of 3 modules** | Module 1 (Skills Signal Engine — STEP-eq + ESCO assignment) + Module 3 (Opportunity Matching + Dual Interface) + Module 2 lite (Frey-Osborne risk surfaced + AI Tier as readiness measure) | ✅✅ |
| **Country-agnostic — configurable, not hardcoded** | JSON config: language · taxonomy · wage source · currency · channel · geo · privacy default · sample player. Three countries shipped (GH/BD/VN). Live country toggle in all three views | ✅ |
| **Real economic data, not synthetic** | ILOSTAT × WDI × Frey-Osborne × WBES × WBL × Findex — 6 signals × 3 countries, all from authoritative 2024 sources | ✅ |
| **Surface ≥ 2 econometric signals visibly** | Player Atlas Card surfaces wage (ILOSTAT), demand growth (WDI), automation risk (Frey-Osborne), employer skill gap (WBES). 4 signals in the player view alone | ✅✅ |
| **Specific constrained user (not generic 'youth')** | Voice-first design (text fallback for demo), low-bandwidth assumed, shared-device aware, navigator-assistable, attestor-driven trust. Personas: Amara (Ghana phone repair) · Riya (Bangladesh tailor) · Tuan (Vietnam dev) | ✅ |
| **Design for constraint** | WhatsApp-native = no app install, lightweight chat UI, voice-friendly architecture, offline-capable design. Privacy defaults adapt to country safety context | ✅ |
| **Demonstrate localizability with real evidence** | Ghana ↔ Bangladesh ↔ Vietnam swap is functional. Numeracy questions in local currency. ESCO/ISCO codes are universally portable. Chapter content adapts via LLM (production) or sample data (demo) | ✅ |
| **Honest about limits** | Hackathon-grade rubrics not psychometrically validated. Production calibration requires 1000+ players × 6 months of IRT. Disclosed on Player rail + README. World Bank judges will recognize this honesty as integrity | ✅ |

---

## 6. What's Already Aligned With Track 5 — Pitch-Ready Talking Points

These are the lines, framings, and demos that are **ready to drop into the pitch deck right now**.

### 6.1 The opening hook
> *"600 million unmapped young people. 75 countries. 3 minutes to find out where they live, what they do, and what they're worth — without one of them filling out a form."*

### 6.2 The differentiation slide
> *"Other tools tell Amara her job is 65% automatable. Atlas measures whether Amara can out-think the AI in her own domain. That's the difference between fear and readiness."*

### 6.3 The infrastructure pitch
> *"WhatsApp is the labor market in 73 of 75 LMICs. But it doesn't know it. We turn it into one. We are upstream of LinkedIn. Upstream of WhatsApp. Upstream of Telegram. We're the credential, not the channel."*

### 6.4 The country-swap demo line
> *"Same engine. Same mechanics. Same 12 minutes. Three completely different lives, three completely different professions, three completely different languages — all measured on the same scale. That's infrastructure."*

### 6.5 The methodology integrity slide
> *"Atlas v0 is a hackathon-grade approximation of STEP — calibrated against Ghana 2013 STEP anchors, but psychometrically not validated. We score directionally, not absolutely. Production Atlas needs 1000 players and 6 months of IRT calibration. We're showing the engine, not the calibration."*

### 6.6 The viral / family-WhatsApp slide
> *"Remittances flow $1.2 trillion from rich diaspora to home villages — through family WhatsApp. We use the same rails to flow Amara's credential the other way. Every diaspora cousin becomes a verified recruiter."*

### 6.7 The closer
> *"In 2026, AI fluency is the highest-leverage individual skill in the global economy. Big tech screens for it. Top consultants train for it. No one — not the World Bank, not the ILO, not McKinsey — measures it for the 600M unmapped young people. Atlas does. In 12 minutes. On a phone."*

---

## 7. What Remains To Be Done

### 7.1 Hackathon-day priorities (next 24h before pitching)

| Priority | Task | Who | Time |
|---|---|---|---|
| 🔴 **P0** | Decide hackathon start time + your timezone | Paola | 0 min |
| 🔴 **P0** | Confirm dev's stack experience (Python/Node, WhatsApp Cloud API touched?) | Paola + dev | 5 min |
| 🔴 **P0** | Lock names: Atlas (platform) · Sage/Spark/Zuri/Kira (companions) · game name (My Atlas / Worth It / etc.) | Paola | 5 min |
| 🟠 P1 | Live LLM hookup — replace sample-answer paths with real Anthropic API calls | Dev | 3-4h |
| 🟠 P1 | Voice STT/TTS — wire OpenAI Whisper + ElevenLabs/OpenAI TTS for true voice-first demo | Dev | 2-3h |
| 🟠 P1 | One real interview with an LMIC youth (cousin, NGO contact, HEC student) — 30 min Zoom | Paola | 30 min |
| 🟡 P2 | Fix any console errors, polish chat scrolling, test all 3 country swaps end-to-end | Both | 2h |
| 🟡 P2 | Build pitch deck (5 slides max: problem · insight · demo · methodology · ask) | Paola | 3-4h |
| 🟡 P2 | Write 90-second demo script word-for-word, rehearse 8x with backup video recorded | Paola | 2h |
| 🟢 P3 | Add Telegram channel posting stub (Ethiopia / Uzbekistan demo extension) | Dev | 1h |
| 🟢 P3 | Add gender disaggregation toggle to policymaker dashboard | Dev | 1h |
| 🟢 P3 | One-pager handout for judges | Paola | 1.5h |

### 7.2 Phase 2 (post-hackathon, 0-6 months to production)

| Stream | Work |
|---|---|
| **Calibration** | Recruit 1000+ players in Ghana × 6 months · IRT item-bank build · published validation paper |
| **WhatsApp Cloud API** | Production WhatsApp deployment (currently demo runs in browser-mock) |
| **Voice end-to-end** | Multilingual voice TTS with native-speaker calibration in 20+ languages |
| **ESCO LMIC fine-tune** | Native-speaker mappings for Twi, Bengali, Vietnamese, Tagalog, Bahasa, Swahili informal-skills vocabulary |
| **Anti-gaming detection** | Behavioral consistency layer · longitudinal tracking · adversarial robustness tuning |
| **Distribution** | Partnerships: World Bank Youth Summit, NGO field-officer programs (BRAC, Pratham, Generation), Mastercard Foundation Youth Africa Works |
| **Revenue model** | Verified-employer subscriptions (~$200/mo per SME) + government/NGO licensing (per-cohort pricing) + sponsored AI companion characters (Anthropic / OpenAI / Google co-marketing) |
| **Geographic expansion** | All 75 LIC + LMIC; priority order: Ghana → Bangladesh → Vietnam → Nigeria → Kenya → India → Philippines → Indonesia |

### 7.3 Open product decisions still to make

| Decision | Options |
|---|---|
| Game player-facing name | "Atlas Quest" / "My Atlas" / "Worth It" / "The Verdict" — pick one |
| Country pair vs triple for demo | Ghana ↔ Bangladesh (simpler) OR Ghana ↔ Bangladesh ↔ Vietnam (Zalo angle, more impressive) |
| Demo persona(s) | Amara (Ghana, repair) · Riya (Bangladesh, tailor) · Tuan (Vietnam, dev) — decide which 1-3 to feature live |
| Voice-first or text-first for v1 | Voice = more authentic + brief-aligned; text = more reliable for stage demo |
| LLM provider | Anthropic Claude (recommended for AI Tier judging — strong rubric reasoning) vs OpenAI GPT-4 (vs both, with Claude as judge) |

---

## 8. The Pitch Deck Outline (5 slides)

| Slide | Headline | Content | Time on stage |
|---|---|---|---|
| 1 | **Amara is the median, not the margin** | The 600M number · the 3 failures · the 1.2 trillion remittance line | 30s |
| 2 | **The wedge — what we measure that no one else does** | STEP at scale · ESCO assignment · **AI Tier 0-4** (the moat) · 6 econometric signals to give it meaning | 30s |
| 3 | **Demo (live)** | Amara plays the Atlas Quest. Boss fight in real time. Atlas Card reveals. Country swap: Ghana → Bangladesh in 30 sec | **90s** |
| 4 | **Methodology + brief compliance** | The measurement matrix · the data sources · the calibration honesty disclosure | 30s |
| 5 | **Distribution + the ask** | World Bank · NGO field officers · diaspora viral loop · what we need from you (calibration partners + WB pilot countries) | 30s |

**Total**: 3 minutes 30 seconds. Demo is the centerpiece. Everything else supports.

---

## 9. The Risks To Address Before Pitching

| Risk | Mitigation |
|---|---|
| **Demo crashes mid-pitch** | Pre-record a 90-second backup video at full polish. Always have it ready |
| **Judges grill on STEP psychometrics** | Honest-about-limits slide already drafted. Lead with it, don't hide it |
| **"You're just LinkedIn for Africa"** | Reframe immediately: "we're upstream of LinkedIn — the credential, not the channel" |
| **"Why would anyone play?"** | Hook = real wage + Atlas Class + AI threat survival + real WhatsApp squad. Not gems for gems' sake |
| **"How do you scale to 75 countries?"** | Country-swap demo (live) + JSON config layer + ESCO universal taxonomy. Show the config file if asked |
| **"What's the business model?"** | Verified-employer subscriptions ($200/mo SME) + WB/NGO licensing + sponsored companions. Slide on roadmap |
| **"Privacy / GBV concerns for women"** | 3-tier privacy + WBL-driven country defaults + STOP/block command. Lead with the safeguarding slide |

---

## 10. Sources Cited

### Primary data sources
- **ILOSTAT** — 2024 wage, employment, informal-employment statistics by ISCO occupation × country
- **World Bank WDI** — sector employment growth, youth NEET, female labor force participation, GDP per capita
- **World Bank Enterprise Surveys (WBES) 2024** — firm-level skill gaps, hiring difficulty, unfilled vacancies
- **Frey & Osborne 2013** + **ILO/WB LMIC adaptation** + **Frey-Osborne 2024 reappraisal** — automation probability scores
- **Women, Business and the Law (WBL) 2024** — country-level gender legal scores
- **Global Findex 2024** — mobile money, digital financial inclusion
- **ESCO** — EU skills/occupations taxonomy (free public REST API)
- **ISCO-08** — International Standard Classification of Occupations
- **Wittgenstein Centre** — education projections by country/age/sex to 2030+
- **World Bank STEP Skills Measurement Program** — calibration anchor (Ghana 2013 + 16 other LMICs)

### Persona / market research
- DataReportal Digital 2025 (LinkedIn Ghana, Nigeria, Africa)
- GSMA Mobile Economy Sub-Saharan Africa 2025
- Mastercard Foundation Africa Youth Employment Outlook 2026
- AfDB Jobs for Youth in Africa 2016-2025
- ILO Global Employment Trends for Youth 2024 / WESO 2025-2026
- Africa Gaming Market Research 2024-2029
- Africa Report — Senegal informal economy on social media
- Indeed/Valuvox 2025 — 78% Indian workers prioritize family in career

### Methodology references
- WEF Future of Jobs Report 2025
- McKinsey 2024 — Africa's informal economy
- Brookings Foresight Africa 2024 — digital economy
- Mobile Mutuality of Being — Sage 2025 (Quechua kinship + WhatsApp)

---

## 11. Working Document Status

This document is a living working document. As we ship the next milestones (LLM live integration · voice · pitch deck · 90-sec demo script · partner outreach · post-hackathon roadmap), update sections **§7 (What Remains)** and **§4 (What's Built)** accordingly.

Atlas v0 ready for stage. Atlas v1 ready in 6 months. Atlas at scale = the open skills-credentialing protocol for 80% of humanity.

— end —
