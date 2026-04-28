# Atlas — Brief-Compliance Ledger

> Append-only log of every commit-review against the official hackathon brief.
> Maintained by `brief-guardian`. One entry per commit-review request from `team-lead`.
>
> Format per entry: VERDICT, BRIEF ALIGNMENT (page-cited), DATASETS check (vs brief p.4-5),
> WEAK-SUBMISSION pitfalls (brief p.5), GO/NO-GO + smallest action to unblock if flagged.

---

## Entry 0 — Baseline (pre-commit-review state)

**Date:** 2026-04-25
**Reviewer:** `brief-guardian`
**Stake:** Baseline assessment of repo state at strategy-doc commit `0f56702` (latest before brief-guardian goes live). Future commits compared to this.

[VERDICT: ⚠️ flagged]

BRIEF ALIGNMENT (page-cited):
- Module 1 Skills Signal Engine (p.3) → ISCO-08 + O*NET + STEP planned, Atlas Card portable + human-readable. Spec strong; **zero code shipped** (Phase 1 not started).
- Module 2 AI Readiness + Displacement (p.3, requires ≥1 real automation dataset) → Frey-Osborne 2013 CSV staged in `_raw/`, LMIC reappraisal multiplier promised but not implemented. AI-Tier 0–4 is original IP, not the brief's automation lens — must surface Frey-Osborne **on the Atlas Card itself**, not buried.
- Module 3 Opportunity Matching + Dual Interface (p.3) → 3 surfaces planned (Player + Employer + Policymaker = exceeds dual). Currently only landing page exists.
- Country-agnostic (p.4) → JSON config schema in place for GH/BD/VN; live country toggle is unbuilt.

DATASETS check (vs brief p.4-5):
- **ILOSTAT** ❌ ignored at staging (no _raw file) — must fetch in Phase 1; this is THE wage signal, p.4 calls it "primary real-world labor signal source"
- **WDI** ✅ used (4 sector employment + female LFP JSONs staged)
- **HCI** ❌ ignored at staging — Phase 1 must add (live REST is trivial)
- **ISCO-08** ✅ used (1313-row CSV staged)
- **Wittgenstein** ✅ staged (RDS format, needs pyreadr)
- **UN Pop** 📋 staged catalogs only, /data endpoint blocked (401) — acceptable defer
- **UNESCO UIS** ✅ staged (SDG 2026-02 zip)
- **Frey-Osborne** ✅ staged (community mirror — flag on honest-limits banner per p.5 honesty req)
- **STEP** ❌ ignored at staging — rubric anchor only per PRD; brief p.5 lists STEP as required-or-equivalent for Module 2; must commit at least the Ghana-2013 anchor CSV to repo
- **ILO Future of Work** (task-content indices) ❌ ignored — p.5 lists explicitly; covers 40+ countries, would meaningfully strengthen Module 2
- **ITU** ✅ staged (mobile broadband + internet users)
- **O*NET** ❌ not yet staged — taxonomy backbone

LEFT ON THE TABLE that Phase 1 must rectify: **ILOSTAT, HCI, STEP, ILO Future of Work, O*NET**. None of these have stated Phase-2 cuts; silent omission would be a brief violation.

WEAK-SUBMISSION pitfalls (brief p.5):
- ☑ "beautiful dashboard you already knew" — STRATEGY.md §4 explicitly flags this as a managed risk on the Employer view; mitigation = surface AI Tier × wage premium uniquely. Watch closely.
- ☐ "generic 'youth' user" — well-handled: Amara/Riya/Tuan named personas in PRD §1, ISCO-seeded.
- ☐ "localizability as a slide" — well-handled: live country swap is in P2 demo, 3 country JSONs shipped, schema exists.
- ☐ "overengineered tech / underengineered UX" — well-handled: stack tightened explicitly (no Postgres, no shadcn, no Leaflet, no Vitest, no ESCO). Stay disciplined.

GO / NO-GO: **GO with 5 dataset gaps to close in Phase 1 ingest (ILOSTAT, HCI, STEP, ILO Future of Work, O*NET).**

If FLAGGED or BLOCKED: smallest concrete action to unblock — Phase 1 ingest scripts must produce on-disk JSON for ILOSTAT (wages by ISCO × country), HCI (live REST one-liner), STEP (Ghana-2013 anchor CSV committed), ILO Future of Work task indices (CSV committed), and O*NET task content (LMIC subset). Until these land, repo cannot honestly claim "≥2 econometric signals visible" from the *brief's required* set — current visible set leans heavily on WDI+Frey-Osborne, both of which alone do not satisfy Module 1's labor-market grounding.

---

## Entry 1 — WhatsApp scaffold close + GH/BD scope tightening

**Date:** 2026-04-25
**Reviewer:** `brief-guardian`
**Stake:** Closes wa-builder's WA scaffold (channel-agnostic `runChapter`, Twilio Sandbox webhook with signature validation + dedupe, KV state machine with phone-hash + 2h TTL, env-driven squad invite resolver, `SETUP_TWILIO.md` + `WHATSAPP_GAME.md` docs, `.env.example` keys). This commit specifically: 5 files, +10 /-14, copy + type-comment changes only — no logic. Tightens the country accept-list from GH/BD/VN to GH/BD across orchestrator, handler, prompt, and state-machine doc. Real Claude wiring inside `runChapter` deferred to Phase 1 morning (heuristics for now; `callSage()` Anthropic wrapper ready). Build green.

[VERDICT: ✅ aligned]

BRIEF ALIGNMENT (page-cited):
- Country-agnostic requirement (p.4) → JSON-driven config + live country toggle is what brief demands. Demo-scope reduction GH/BD does NOT violate p.4 — brief asks the *system* to be re-configurable without code changes, demoed on "one context, then show what it would take to reconfigure for a second." Two contexts (Sub-Saharan Africa urban-informal: GH; South Asia urban-informal: BD) satisfies the "show two contexts" demo requirement cleanly. Risk: pitch must clearly state "two countries shipped, JSON-add for any new country" — STRATEGY.md already frames it correctly.
- Module 3 dual interface (p.3) → Note from prior commit: policymaker folded into /employer. Brief demands "dual interface: one for the youth user, one for a policymaker or program officer." A merged Employer/Policymaker view is acceptable IFF aggregate-signal mode and recruiter mode are both present; verify on next dashboard-touching commit. This commit does not affect that surface.
- Module 1 portability (p.3) → Atlas Card portable across borders is unaffected by demo-country reduction; ISCO-08 + O*NET still drive a global-portable profile.
- Weak-submission "localizability as a slide" (p.5) → STILL safe: live country toggle GH↔BD is real evidence, and "add a country = add a JSON" is demonstrable. But: dropping VN means we MUST show the JSON-add story crisply on stage, not handwave it.

DATASETS check (vs brief p.4-5):
- ILOSTAT, WDI, HCI, ISCO-08, Wittgenstein, UN Pop, UNESCO UIS, Frey-Osborne, STEP, ILO Future of Work, ITU, O*NET
- Status unchanged from Entry 0: WDI ✅ · ISCO-08 ✅ · Wittgenstein ✅ · UNESCO UIS ✅ · Frey-Osborne ✅ · ITU ✅ · UN Pop 📋 · ILOSTAT ❌ · HCI ❌ · STEP ❌ · ILO Future of Work ❌ · O*NET ❌
- This commit touches ZERO datasets — copy-only diff. No utilization regression, no progress either.
- LEFT ON THE TABLE that Phase 1 must still rectify (carry-over from Entry 0): ILOSTAT, HCI, STEP, ILO Future of Work, O*NET. Reason: Phase 1 morning ingest deferred per `team-lead`'s plan; not a silent omission.

WEAK-SUBMISSION pitfalls (brief p.5):
- ☐ "beautiful dashboard you already knew" — N/A this commit (no UI changes).
- ☐ "generic 'youth' user" — Amara/Riya named personas preserved (Tuan dropped with VN; acceptable since two specific constrained personas > three).
- ☐ "localizability as a slide" — Now LOAD-BEARING: with only 2 demo countries, the live country swap GH↔BD must be unambiguously crisp on stage AND the "add a country = add a JSON" story must be shown in the demo or pitch (e.g. open `bd.json` in a code editor for 5 seconds). Flag for `team-lead`: rehearse this beat.
- ☐ "overengineered tech / underengineered UX" — This commit reduces complexity (-14 lines, removed a country branch, removed a dummy env example). UX direction unaffected.

GO / NO-GO: **GO.** Pure scope-tightening, zero new dependencies, dataset utilization unchanged, build green, no brief regressions. Ship it.

If FLAGGED or BLOCKED: n/a (✅).

Carry-over watch for next reviews (no action this commit):
1. Phase 1 ingest must close ILOSTAT/HCI/STEP/ILO-FoW/O*NET gaps before any commit claims "Module 1/2 complete."
2. Verify policymaker-mode (aggregate-signal view) is preserved when /employer is touched, to keep p.3 dual-interface claim honest.
3. Rehearse "JSON-add for a third country" story on stage — now load-bearing for p.4 country-agnostic claim.

---
