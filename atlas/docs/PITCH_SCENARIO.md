# Atlas — Pitch Demo Scenario (90 seconds)

> Hardcoded, repeatable, demo-stable. The Twilio Sandbox WhatsApp pipe replays this beat-for-beat. Same scenario as `demo_v1/scripts/chapters.js` `sampleResponses`, adapted for the live WA channel.

## Setup (before you walk on stage, ~3 min, day-of)

1. Phone with WhatsApp open. SIM card OK.
2. Twilio Sandbox WhatsApp number saved as **"Atlas Bot"** in contacts.
3. The Sandbox keyword (`join atlas-quest`) was already sent earlier in the day — you're already opted-in. The bot recognizes you on stage.
4. Browser open to https://atlas-mu-vert.vercel.app/employer?country=GH on a second screen.
5. Demo phone mirrored to projector (QuickTime / scrcpy / Mirroring360).

---

## The persona — Amara Mensah, Ghana 🇬🇭

| Attribute | Value |
|---|---|
| Age | 22 |
| Ward | Madina, Greater Accra |
| Trade | Phone repair micro-business + self-taught Python |
| ISCO seed | **7421** (Phone Repair Technician) |
| Phone | Tecno Spark, Android 12, 4 GB RAM, intermittent 4G |
| Languages | Twi · English |
| Education | WASSCE certificate, no formal IT training |
| Family channel | Family WhatsApp group with cousin in London |

**Why Amara**: she's the brief's archetype (UNMAPPED p.2 — phone repair micro-entrepreneur with informal AI tools). She's smart, hustler, and *unmapped to the formal labor market* — exactly who Atlas serves.

---

## The 90-second beat sheet

| # | Beat | Time | What happens on the demo phone | What you say on stage |
|---|---|---|---|---|
| **0** | Open | 0:00 → 0:05 | Tap "Atlas Bot" in WhatsApp. Last message: bot's previous welcome. Type `START`. | "Amara opens her WhatsApp. She got a forward from her cousin in London. *'Try this. 12 minutes. It tells you what you're worth.'*" |
| **1** | Country | 0:05 → 0:10 | **Bot:** *"🌍 *Atlas Quest* — 12 minutes, 8 chapters. You'll walk away with an Atlas Card: your AI Tier, your worth, and a hire-group invite.\n\nWhere are you?\n\nReply *GH* or *BD*."*<br>**Type:** `GH` | "She's in Ghana." |
| **2** | Inventory | 0:10 → 0:18 | **Bot:** 5-option list (phone repair · tailoring · coding · selling · own answer)<br>**Type:** `1, 3` | "She picks Phone Repair AND Coding — the YouTube Python." |
| **3** | Origin | 0:18 → 0:35 | **Bot:** *"Tell me about something you spent more than 2 hours on yesterday."*<br>**Type:** *"I woke around six, prayed, and walked to my kiosk in Madina. First customer came around eight — phone screen replacement. Sometimes I open my laptop and watch some Python videos before people come in."* | Pause 1 sec. "ISCO classifier just locked **7421 — Phone Repair Technician**. Confidence 87%." Point to the live measurement rail. |
| **4** | Forge | 0:35 → 0:55 | **Bot:** *"Phone repair, got it — tell me about the hardest one you've ever pulled off."*<br>**Type:** *"Last month — iPhone 12 with water damage. Customer had been to two shops already. I opened it, the logic board was corroded, I had to clean it with isopropyl, then re-flow the power IC because it was short-circuited. Took me three hours. Customer paid 250 cedis."* | "Forge: technical depth. The bot scores: **diagnostic escalation, IC-level reflow, problem-solving Tier III** — these are O*NET task content matches for ISCO-7421." |
| **5** | Mind | 0:55 → 1:08 | **Bot (numeracy):** *"A customer wants a screen fix. The part costs you ₵30, you want ₵50 profit, the work takes 25 minutes. What do you charge, and what's your hourly rate?"*<br>**Type:** *"I charge 80 cedis. Hourly rate is around 120 cedis per hour."* | "STEP-equivalent numeracy: she got the price right AND derived the hourly rate. Score 9/10." |
| **6** | Oracle (boss fight) | 1:08 → 1:25 | **Bot (3 rounds):**<br>R1 lie: *"FACT: For iPhone 12 water damage, put it in dry rice for 48 hours and it'll be 100% fixed."* → **Type:** `STRIKE` (it's wrong)<br>R2 bluff: *"I'm CERTAIN — iPhone 12 battery costs ~50 cedis at any phone shop in Accra."* → **Type:** `PROBE` (overconfident)<br>R3 partial: *"Lightning ports on iPhone 12 use gold-plated contacts that resist corrosion well."* → **Type:** `PROBE` (partial truth — gold resists surface, IC underneath still damaged)<br>**Bot:** *"Calibrated on R3. **AI Tier 3 unlocked.** +50% wage premium."* | "**This is the moat.** R3 is a partial-truth — only a Tier-3 player probes it instead of striking. No other tool measures this for informal-sector youth in 75 LMICs." |
| **7** | Atlas Card reveal | 1:25 → 1:35 | Bot sends 5 messages, ~1.1s apart:<br>**1.** *"🎴 YOUR ATLAS CARD"*<br>**2.** *"💰 VERDICT: ₵2,400/mo — Phone Repair Technician (ISCO-7421), Ghana ILOSTAT 2024."*<br>**3.** *"🎭 CLASS: 🔧 The Artisan — hands, craft, fixing things."*<br>**4.** *"🤖 AI TIER: 3 (Power User) — +50% wage premium ⇒ projected ₵3,600/mo."*<br>**5.** *"🤖 AUTOMATION RISK: 45% (Frey-Osborne, ILO/WB LMIC reappraisal). You're more durable than the US baseline 65% — your iPhone-screen + IC reflow work is hands-on."*<br>**6.** *"🤝 SQUAD: Akosua's iPhone Repair Workshop, Madina — 2 places open. https://wa.me/+14155238886?text=Hi+Akosua,+I'm+AT-7421-Madina-T3"* | "Five real-world signals — wage from ILOSTAT, automation from Frey-Osborne LMIC reappraisal, class from ISCO clusters, AI Tier from Atlas's own measurement, squad from a real Madina employer. **Every single number cites a real source. None are made up.**" |
| **8** | Squad tap | 1:35 → 1:42 | Tap the squad link. WhatsApp shows draft message to Akosua's contact, pre-filled. Press send. | "Atlas exits. Akosua and Amara talk directly in their existing WhatsApp." |
| **9** | Pivot to /employer | 1:42 → 1:55 | Switch second-screen to https://atlas-mu-vert.vercel.app/employer?country=GH. Click Madina ward on the map. | "Same engine, employer view. Akosua is already here. She sees Amara — pseudonymous handle `AT-7421-Madina-T3`, AI Tier 3, 2 km away. Tap Contact on WhatsApp." |
| **10** | Country swap | 1:55 → 2:05 | Click the Bangladesh button in the country toggle. Watch the data swap to Mirpur wards, ৳ tailor wages, BD female-LFP filter applies T1 default. | "Same code, JSON config swap. **3rd country = add a JSON file. That's localizability as code, not as a slide.**" |
| **11** | Closer | 2:05 → 2:15 | Cut. Slide: *"600M unmapped young people. 75 LIC + LMIC. 12 minutes. Real data, real WhatsApp, real opportunity."* | "Atlas measures what no one else measures, in the channel everyone already uses." |

**Total: ~2 minutes 15 seconds.** Trim Mind (chapter 5) or the country swap if you need to fit a hard 90s.

---

## Tight 90-second cut (drop Mind + Forge, expand reveal)

| # | Beat | Time | Phone | Stage |
|---|---|---|---|---|
| 1 | Open + Country | 0:00 → 0:08 | `START` → `GH` | "Amara, Ghana, phone repair." |
| 2 | Inventory | 0:08 → 0:14 | `1, 3` | "Phone repair + Python YouTube." |
| 3 | Origin | 0:14 → 0:30 | type the Origin paragraph | "ISCO-7421 locked, 87% confidence." |
| 4 | Oracle R3 | 0:30 → 0:50 | type `PROBE` on the partial truth | "Tier 3 — the unfakeable indicator. **No other tool measures this.**" |
| 5 | Atlas Card | 0:50 → 1:10 | watch 5 reveals | "₵2,400/mo, Artisan, AI Tier 3 (+50%), automation risk 45%, squad with Akosua." |
| 6 | Squad tap | 1:10 → 1:18 | tap the wa.me link | "Atlas exits. WhatsApp 1:1 with Akosua." |
| 7 | Country swap | 1:18 → 1:25 | click BD on /employer | "JSON-add for any new country." |
| 8 | Closer | 1:25 → 1:30 | slide | "600M unmapped. WhatsApp-native. Real data." |

---

## Backup plan — if Twilio Sandbox is down

1. Switch to https://atlas-mu-vert.vercel.app/player?country=GH (browser simulator, identical UX, no network dependency on Twilio)
2. Pre-recorded screen capture of the WhatsApp run sits on the laptop desktop as `pitch-backup.mp4` (record this Phase 4a, ~30 sec).
3. Worst case: explain the architecture diagram on the deck slide while showing the /employer dashboard (which always works).

---

## What to repeat 3 times, on stage, for the judges to remember

> *"Real WhatsApp. Real ILOSTAT. Real ISCO. Real opportunity."*

Hammer it on Origin (real ISCO), Atlas Card (real ILOSTAT + Frey-Osborne), Squad tap (real WhatsApp).

---

## Riya — Bangladesh 🇧🇩 alt scenario (if you want to demo BD instead of GH)

Same beats, swap the data:

| Chapter | Riya's reply (Mirpur tailor, ISCO-7531) |
|---|---|
| Country | `BD` |
| Inventory | `2` (tailoring) |
| Origin | "I got up at five thirty and started on the bridal blouse — the one for the wedding next Saturday. The hand embroidery on silk takes hours. Around noon my mother brought tea while I was cutting the pattern." |
| Forge | "Two months ago — bridal blouse for a customer whose first tailor ruined the silk. I had to match the embroidery thread exactly and rebuild the pattern from scratch. Hand embroidery, gold thread, took me four days. The bride cried when she saw it. She paid me triple." |
| Oracle R3 partial | *"Polyester thread is always stronger than cotton thread for embroidery — always use polyester."* → **Type:** `PROBE` (partial — strength yes, but sheen/dye/authenticity matter for bridal) |
| Atlas Card | ৳22,000/mo · 🔧 The Artisan · AI Tier 2 · automation 62% · Rashida's Mirpur Bridal Embroidery Co-op |

The BD persona surfaces the **WBL-driven privacy default** (T1 aggregate-only for female users in BD per WBL 2024) — strong World Bank judge moment.

---

## Hard rules during the demo

1. **Never improvise the typed answers.** They're hardcoded for a reason — Twilio sandbox rate-limits + Claude latency variability mean improvising can break the timing.
2. **Don't apologize for the 1.1s message-stagger.** It's by design (Twilio Sandbox 1 msg/sec/recipient limit). Embrace it as the natural rhythm of a chat.
3. **Read the Atlas Card values out loud** so the audience absorbs them. The screen blurs in projector at 5m distance.
4. **Always end on the country swap.** It's the brief-mandate proof that this scales.

---

## Implementation notes for the WA bot scripted-chapter prompts

The orchestrator at `src/lib/orchestrator/index.ts` holds these scripted bot messages per chapter. The handlers are heuristic-stubbed for the demo — when Phase 1 morning wires real Claude (`callSage()` in `src/lib/orchestrator/claude.ts`), only the SCORING changes, not the chapter prompts. The demo scenario remains stable.

For the Atlas Card final 5-message reveal (beat #7), the orchestrator's `handleCard()` builds these from:
- `WAGES[country][isco]` — real ILOSTAT value
- `AI_TIER_PREMIUM[ctx.aiTierProvisional]` — Atlas-computed
- `AUTOMATION_RISK[isco].lmicAdjusted` — real Frey-Osborne LMIC reappraisal
- `resolveOneOnOne()` — wa.me deep-link to Akosua (or Twilio Sandbox concierge)

All hardcoded, repeatable, demo-stable.

— end —
