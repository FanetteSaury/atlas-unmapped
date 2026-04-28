# Atlas — UX strategy for Player + Employer surfaces

> Pre-code strategy doc. Validates with the hackathon brief BEFORE we build. The brief-reviewer agent runs against this doc.

## 1. Player side — the game

### 1.1 Discovery loop (how Amara learns Atlas exists)

We don't build acquisition tomorrow, but the UX must SUPPORT every channel below — so a single share-link can land any cold visitor straight into the quest:

| Channel | Mechanic | UI requirement |
|---|---|---|
| **Family WhatsApp** (the dominant LMIC labor channel — 95% WA penetration in West Africa per Sources §10) | Cousin sends Amara a link `atlas.app/q/<sharer-slug>` → opens directly to "Hi! [Sharer name] thought you should try this. 12 min, get your AI Tier + your worth." | Deep-link with attribution slug; landing has zero-friction `START` button |
| **Diaspora viral** | Uncle in London sends "show me your AI Tier" with their own card preview | Atlas Card shareable as image + WA-share intent URL |
| **NGO field officer** (BRAC / Pratham / Generation cohorts) | Officer scans QR, hands tablet to youth | QR generator + cohort tag in URL: `/q/?cohort=BRAC-DHK-2026-04` |
| **Employer-led** | Madina phone-repair shop owner posts QR "scan, 12 min, join hire group" | Same `/q?employer=<id>` flow → at end, auto-add to that employer's WA group |
| **Government program** | National Youth Service adopts Atlas as upstream credentialing | `?cohort=<gov-program>` → cards labelled with program affiliation in employer view |

**Design decision**: ALL channels converge on the same `/player?country=GH&ref=<slug>` URL. The `ref` slug just tags the run for attribution; the experience is identical. **One quest, many doors.**

### 1.2 The 12-minute quest (already specified in PRD §2.1)

Reminder: 8 chapters, ~12 min total, ends with Atlas Card reveal + 3 outbound actions (forward to attestor / share card / join squad).

**Critical UX moments** (where we don't compromise):

1. **Companion Select** (chapter 0b) — Mario-Kart-style character pick = the first AI capability measurement. Verbatim from `demo_v1`.
2. **Live measurement rail** — top-right strip showing ISCO seed forming, AI Tier provisional, ESCO chips lighting up as chapters complete. *"You're being measured, transparently."*
3. **Boss fight Oracle** (chapter 5) — 3-phase real-time mechanic with HP bars. The wedge moment.
4. **Atlas Card reveal** — 4 reveals with sound + animation: 💰 verdict, 🎭 class, 🤖 AI tier, 🤝 squad. The **emotional payoff**.
5. **Forward to tribe** — at end, "Share your Atlas Card. One person who knows your work." → WhatsApp share intent with pre-filled message.

### 1.3 Output: 3 outbound CTAs at end-of-quest

After the Atlas Card reveal modal:

```
   [📤 Share with my tribe]    ← WA share intent, pre-filled "I just got my Atlas Card. AI Tier 3. Worth ₵2,400/mo. Try yours: <link>"
   [🤝 Join my squad]          ← Tap → joins pre-seeded WA group based on country × ISCO (e.g. Madina Phone Repair Squad)
   [🏛️ Send to my training program]  ← Show QR + cohort tag selector
```

**This is what closes the loop.** The Atlas Card alone is a curiosity; these 3 CTAs make it infrastructure.

### 1.4 Persistence + handle

- No login. Phone number → SHA-256 hash → pseudonymous handle `AT-<isco>-<ward>-T<tier>` (e.g. `AT-7421-Madina-T3`).
- Atlas Card stored in Vercel KV under `card:<shareSlug>` for 30 days (share link works).
- Player run state in KV during the 12-min run (key `wa:state:<phoneHash>`, 2h TTL).

---

## 2. Employer side — the dashboard

### 2.1 Job to be done

A Madina phone-repair shop owner needs to **hire 2 people in the next 30 days who can fix iPhone screens AND have started using AI tools**. She has 4 minutes between customers to look. She wants:

- Visual sense of "are there candidates near me right now?"
- Filter by what she actually needs (ISCO + AI Tier + ward)
- Click → join a WA group with these candidates → talk to them in her own channel (WA), not a foreign dashboard.

### 2.2 Surface design — `/employer?country=GH`

```
┌────────────────────────────────────────────────────────────────────┐
│  🌍 Atlas — Employer · Ghana ▾                          [profile] │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────┐  ┌──────────────────────────────────┐ │
│  │ FILTERS                │  │ KPI ROW                           │ │
│  │ ─────                  │  │ 147 verified · 28% AI T2+ ·      │ │
│  │ Skill type             │  │ wage range ₵1.4-2.8k · WDI +4.2% │ │
│  │  ☑ Phone repair (7421) │  │                                   │ │
│  │  ☐ Tailoring (7531)    │  │ source: ILOSTAT 2024 · WDI 2024  │ │
│  │  ☐ Software (2519)     │  └──────────────────────────────────┘ │
│  │  ☐ Sales (5223)        │                                        │
│  │                        │  TABS:  [🗺️ Map]  [📋 List]  [📊 Chart]│
│  │ AI Tier                │  ┌──────────────────────────────────┐ │
│  │  T0 ☐  T1 ☑  T2 ☑     │  │                                   │ │
│  │  T3 ☑  T4 ☑           │  │  CSS GRID OF MADINA WARDS         │ │
│  │                        │  │  ┌──┬──┬──┬──┬──┐                │ │
│  │ Ward                   │  │  │ 3│12│ 7│ 2│ 1│  ← count       │ │
│  │  ☑ Madina              │  │  ├──┼──┼──┼──┼──┤                │ │
│  │  ☐ East Legon          │  │  │ 5│18│ 9│ 4│ 0│  ← shaded by  │ │
│  │  ☐ Nima                │  │  ├──┼──┼──┼──┼──┤    density    │ │
│  │  ☐ Adabraka            │  │  │ 1│ 6│ 4│ 8│ 2│                │ │
│  │                        │  │  └──┴──┴──┴──┴──┘                │ │
│  │ Privacy                │  │                                   │ │
│  │ ─                      │  │  Hover ward → 4 candidate badges  │ │
│  │ Showing T2 (pseudo)    │  │  Click ward → expand to LIST tab  │ │
│  │ T3 contact: opt-in     │  └──────────────────────────────────┘ │
│  │                        │                                        │
│  │                        │  ┌──────────────────────────────────┐ │
│  │ [Reset]                │  │ TOP CANDIDATES (filtered)         │ │
│  │                        │  │ ─                                  │ │
│  └────────────────────────┘  │ AT-7421-Madina-T3 · iPhone repair │ │
│                              │ AI Tier 3 · 95% match · 2km      │ │
│  ⚠️ Hackathon-grade rubrics. │ [🤝 Join Madina Repair Squad]    │ │
│  Calibration disclosure on   │                                   │ │
│  every score.                │ AT-7421-Madina-T2 · phone +       │ │
│                              │  Python · AI Tier 2 · 87% · 3km   │ │
│                              │ [🤝 Join Madina Repair Squad]    │ │
│                              │ ...                                │ │
│                              └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### 2.3 Map vs List — both, no click required

The user said *"pas besoin de pouvoir cliquer forcément sur la carte, il est aussi possible d'avoir la liste"*.

**Decision**: ship BOTH views as tabs. Map is the wow + spatial context, List is the work-tool. Default = Map for new visitors, List for return visitors (localStorage preference).

| Map view | List view |
|---|---|
| CSS grid of N wards (5×5 for Madina, configurable per country) | sortable table: handle · ISCO · AI Tier · ward · wage range · "Join squad" CTA |
| Each cell colored by candidate count under current filters | filter sidebar = same as map view |
| Hover cell → tooltip with 3-4 candidate badges (handles, no names) | row click → drawer with full candidate card |
| Click cell → expand to List view filtered to that ward | infinite scroll |
| **No real geo coords** — wards are CSS rectangles. We don't pretend to be Google Maps. | exportable CSV for the recruiter (Phase 2) |

### 2.4 The squad WhatsApp group — the closing magic

**This is what makes Atlas more than a dashboard.** Brief mandate: *"connect a user's skills profile to realistic, reachable opportunities."*

**Hackathon-grade implementation:**

1. Atlas pre-creates **3 sample WA groups** per country (manual, by Fanette's phone):
   - Ghana: "Atlas · Madina Phone Repair Squad", "Atlas · Accra Tailors", "Atlas · East Legon Devs"
   - Bangladesh: similar
2. Group invite links are stored as env vars: `WA_GROUP_GH_7421`, `WA_GROUP_GH_7531`, etc.
3. **Employer side**: clicking "Join squad" on any candidate card opens `https://chat.whatsapp.com/<link>` for that ward × ISCO. Employer joins.
4. **Player side**: at end-of-quest, the Atlas Card reveal includes "🤝 Join your squad: Madina Phone Repair Squad" → tap → joins same group.
5. **Result**: employer + candidate are now in the same WA group, can talk directly. Atlas exits the conversation.

**Production roadmap (Phase 2):**
- Twilio Conversations API to create groups dynamically
- Verified-employer onboarding gate (subscription)
- Per-employer dedicated groups instead of shared by ward

### 2.5 Filter-by-skill — what the recruiter actually needs

| Filter | Source | Format |
|---|---|---|
| **Skill type** | ISCO major group + ISCO unit code | Checkbox list. Plain language ("Phone repair") with code as tooltip ("ISCO-7421"). Per Paola's TODO. |
| **AI Tier** | from Atlas Card | Multi-select chips: T0/T1/T2/T3/T4 |
| **Ward** | from candidate location | Checkbox list of country-specific wards |
| **Recency** | from card.issuedAt | "All" / "Last 30 days" / "Last 7 days" |
| **Gender** (optional, privacy-aware) | from optional self-disclosure | If country WBL score ≥70: filter visible. Else: aggregate-only. |

---

## 3. Map clusters — what "clusters" actually means here

The user said *"clusters sur les skills"*. Two readings:

| Interpretation | Implementation | Decision |
|---|---|---|
| (a) Geo-clusters of candidates near each other | Mapbox / Leaflet with marker clustering | ❌ Cut — Leaflet was already cut for tech-stack-tightening |
| (b) Skill-density visualization per ward | CSS grid where each ward is colored by count of candidates matching the current filters | ✅ Ship this |

**Cluster = density per ward × current filters.** Not Google-Maps-style markers; rather, "Madina has 18 phone repair Tier 2+ folks under 30, East Legon has 4". That's the recruiter's actual question.

---

## 4. Brief compliance — preliminary self-check

| Brief requirement (page) | Atlas response | Risk |
|---|---|---|
| Module 1: Skills Signal Engine, profile portable + human-readable (p.3) | ISCO-08 + O*NET + STEP, plain-language labels (Paola TODO), share link with QR | ✅ |
| Module 2: AI Readiness + Displacement Risk (p.3, must use ≥1 real automation dataset) | Frey-Osborne LMIC reappraisal surfaced in Atlas Card 🤖 + employer view | ✅ |
| Module 3: Opportunity Matching + Dashboard, dual interface (p.3) | Player view + Employer view + Policymaker view = 3 surfaces | ✅✅ |
| Country-agnostic, configurable (p.4) | JSON configs, live country toggle, Phase 1 ships GH/BD | ✅ |
| Real economic data, ≥2 econometric signals visible (p.4-5) | 6+ on Atlas Card (wage, growth, automation risk, AI premium, gender legal, digital readiness) | ✅✅ |
| **Strong: show the data** | DataSourceCitation on every value | ✅ |
| **Strong: design for constraint** | Low-bandwidth chat, voice-ready, shared-device toggle, country-aware privacy | ✅ |
| **Strong: localizability with real evidence** | Live country swap on stage | ✅ |
| **Strong: honest about limits** | HonestLimitsBanner everywhere | ✅ |
| **Weak avoid: beautiful dashboard you knew** | RISK if employer view just shows "phone repair density". Mitigation: surface AI Tier × wage premium uniquely | ⚠️ Manage |
| **Weak avoid: generic 'youth'** | Amara/Riya named personas | ✅ |
| **Weak avoid: localizability as slide** | Live country toggle | ✅ |
| **Weak avoid: overengineered tech, underengineered UX** | Stack tightened (no Postgres, no shadcn, no Leaflet, no Vitest) | ✅ |

---

## 5. Open questions for Paola (when she joins 10:00)

1. **Sample WA groups** — which phone(s) should host the 3 Ghana groups? (Yours, mine, or a burner number?) Decision needed before stage demo.
2. **Pitch framing for employer view** — do we lead with "find verified candidates" (recruiter-first) or "see your local talent pool" (policymaker/program-officer first)? Brief module 3 says "dual interface for youth + policymaker/program officer" — we should lean program-officer in the pitch wording even if the actual demo shows recruiter use.
3. **Privacy default for the demo** — should the candidate list show **handles only** (T2) or include city + skill summary (still T2 but richer)? Trade-off: more visible info = more compelling demo, but pushes toward T3 territory.
4. **Squad group name format** — "Atlas · Madina Phone Repair Squad" vs more local-feeling "Madina Repair Hire Group" vs generic "Phone Repair Hire" — needs Paola's marketing eye.

---

## 6. Implementation feasibility (08:00 → 14:00 budget)

| Surface | Time | Feasibility |
|---|---|---|
| **Player side** (2 chapters wired + Atlas Card reveal + share button) | 2h | ✅ |
| **Employer side** (filter sidebar + CSS grid map + list view + 50 pre-seeded sample cards) | 2h | ✅ |
| **Squad WA groups** (manual creation + invite links + integration in both flows) | 30 min Fanette + 5 min Paola's phone | ✅ |
| **Brief reviewer + final smoke** | 30 min | ✅ |
| **Total** | ~5h | Within Phase 1 + 2 + 3 budget |

---

## 7. What we DON'T build (explicit cuts)

- ❌ Real Twilio Conversations API for dynamic group creation (Phase 2)
- ❌ Verified-employer onboarding flow with subscription (Phase 2)
- ❌ Real geo-map with marker clustering (CSS grid is the substitute)
- ❌ Employer auth / login (pre-seeded employer accounts for hackathon demo)
- ❌ Player-to-employer direct chat outside WA groups (groups are the channel)
- ❌ Notifications / push (Phase 2)

---

## 8. Validation plan

Before coding:
1. ✅ Spawn `brief-reviewer` agent against THIS document → confirm we cover Module 3 fully.
2. ✅ Spawn `chrome-verifier` agent against landing page → baseline screenshot.
3. ✅ Manager (Claude main loop) reads the verifier reports.
4. ✅ Paola (10:00) signs off on §5 open questions.
5. ✅ Fanette + Claude pair-code Phase 2 in 2h.
6. ✅ Re-run brief-reviewer at 12:00 (post-Phase-2) for course correction.
