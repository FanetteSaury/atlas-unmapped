"""Atlas — LMIC data ingest pipeline (Python).

Each module fetches one source and writes JSON to data/lmic/{source}/{country}.json
with citation block + fetched-at timestamp. Phase 1 (08:00 → 10:00 Paris) fills in
the real fetchers; this scaffold ensures the package is importable.

Sources (per PIPELINE.md):
- ilostat:        live SDMX/REST (wage by ISCO × country)
- wdi:            World Bank WDI live REST (sector growth, NEET, GDP per cap)
- frey_osborne:   committed CSV + ILO/WB LMIC reappraisal (automation risk)
- wbl:            committed Women, Business and the Law CSV (gender legal score)
- wbes:           World Bank Enterprise Surveys (skill gaps, hiring difficulty)
- findex:         Global Findex 2024 (mobile money, digital inclusion)
- wittgenstein:   Wittgenstein Centre 2025-2035 cohort projections
- hci:            Human Capital Index live REST
- isco:           ILO ISCO-08 hierarchy CSV
- onet:           O*NET 28+ task content (LMIC-adapted)

Run all in parallel via `python -m scripts.ingest.all`.
"""
