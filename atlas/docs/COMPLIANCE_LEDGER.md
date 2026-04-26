# Atlas — Brief-Compliance Ledger

> Append-only log of every commit-review against the official UNMAPPED brief
> (`docs/05 - World Bank - Unmapped.docx - Google Docs.pdf`, 7 pages).
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
