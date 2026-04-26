# Atlas LMIC pre-staging report

**Run:** 2026-04-25 ~02:00 → ~01:57 Paris
**Run by:** `data-prestager` subagent (Atlas team `atlas-hackathon`)
**Purpose:** ground Phase 1 ingest in real, on-disk source files so 08:00 ingest = parsing local data, not fighting flaky public APIs.

---

## P0 — All OK ✅

| Dataset | Status | File | Size | Source URL | License | Notes |
|---|---|---|---|---|---|---|
| Frey-Osborne 2013 (automation probabilities) | ✅ | `frey-osborne-2013.csv` | 106 KB | Plotly community mirror of Oxford Martin appendix table | academic, derivative | 702 occupations. Cross-check rows against official Oxford Martin PDF appendix in Phase 1 |
| WBL 2024 (Women, Business and the Law) | ✅ | `wbl-2024.xlsx` | 9.2 MB | `worldbank.org` dam path (WBL 1.0 historical panel 1971-2024) | CC-BY-4.0 | needs `openpyxl` to parse; rename to `.xlsx` if Excel doesn't open |
| ISCO-08 hierarchy (ILO official) | ✅ | `isco-08-hierarchy.csv` | 220 KB | ILO official | public-domain | 1313 rows. Includes ISCO-88/68 too — filter on `ISCO_version == 'ISCO-08'` |

## P1 — All OK ✅ (mostly)

| Dataset | Status | File | Size | Notes |
|---|---|---|---|---|
| WDI smoke (Ghana sector employment) | ⚠️ slow | `wdi-gh-smoke.json` | 1.4 KB | World Bank API works but **slow**: 31s on 3rd attempt; first 2 timed out at 30s/60s. **Phase 1 ingest must use ≥60s timeout, retry-with-backoff** |
| WDI employment by sector — agriculture % | ✅ | `wdi-employment-agri-pct.json` | 484 KB | bulk indicator, all countries |
| WDI employment by sector — industry % | ✅ | `wdi-employment-industry-pct.json` | 478 KB | bulk indicator |
| WDI employment by sector — services % | ✅ | `wdi-employment-services-pct.json` | 478 KB | bulk indicator |
| WDI female labor force participation | ✅ | `wdi-female-labor-force-pct.json` | 519 KB | bulk indicator |
| Wittgenstein SSP2 epop (education-pop) | ✅ | `wittgenstein-epop-ssp2.rds` | 8.5 MB | RDS format — needs `pip install pyreadr` to parse |
| Wittgenstein SSP2 bpop | ✅ | `wittgenstein-pop-by-edu-ssp2.rds` | 862 KB | same |
| ITU mobile broadband subscriptions | ✅ | `itu-mobile-broadband-wb.json` | 434 KB | via WB mirror, no auth |
| ITU internet users % | ✅ | `itu-internet-users-wb.json` | 430 KB | via WB mirror, no auth |
| ITU Facts & Figures 2024 methodology | ✅ | `itu-ff-2024-methodology.pdf` | 1.7 MB | for citation block |

## P2 — Partial

| Dataset | Status | File | Notes |
|---|---|---|---|
| UNESCO SDG 2026-02 | ✅ | `unesco-sdg-2026-02.zip` | 33 MB → 374 MB unzipped, 7 CSVs incl. `SDG_DATA_NATIONAL.csv` (75 MB) |
| UN Data Portal — indicators catalog | ⚠️ partial | `un-dataportal-indicators.json` | 96 KB |
| UN Data Portal — locations catalog | ⚠️ partial | `un-dataportal-locations.json` | 33 KB |
| UN Population Projections /data endpoint | ❌ blocked (401) | — | endpoint requires API key debug, deferred |

## Blockers

- **UN WPP 2024 bulk CSV.gz**: every direct path returned 404. Site is a JS SPA with dynamic URL generation. Workaround = use Data Portal API after fixing the 401 (Phase 1+).
- **Frey-Osborne canonical CSV**: doesn't exist as official asset (paper publishes only PDF appendix). Plotly community mirror is the best public CSV; reasonable for hackathon scope, **flag on the Atlas honest-limits banner**.
- **Wittgenstein static CSV**: doesn't exist; Shiny backend at `wicshiny2023.iiasa.ac.at/wcde-data/wcde-v3-batch/{scenario}/{indicator}.rds` is the only public format. Solved via RDS download; needs `pip install pyreadr`.

## Recommended Phase-1 ingest order (easiest first)

1. **ISCO-08** (CSV → JSON, no API calls) — 5 min
2. **Frey-Osborne** (CSV → JSON, attach LMIC reappraisal multiplier) — 10 min
3. **WDI bulk** (4 already-downloaded JSONs + 2 ITU JSONs through one generic loader) — 15 min
4. **WBL Excel** (one-shot extraction with `pandas.read_excel`) — 10 min
5. **UNESCO SDG zip** (extract + filter to LIC+LMIC countries) — 10 min if needed P0
6. **Wittgenstein RDS** (`pip install pyreadr` then load) — 10 min
7. **WDI live API** (only for fresh data on demand, low priority since bulk dumps cover most) — defer
8. **UN WPP** (defer until Data Portal 401 unblocked) — Phase 2 or beyond

## Total Phase 1 ingest estimate (revised)

If Phase 1 just **parses on-disk files** (no network), wired through one Python loader pattern: **~50 min** for all 6 P0+P1 sources, leaving 70 min of the 2h Phase 1 budget for orchestrator + scoring + smoke test.

This is the high-leverage outcome of pre-staging: **Phase 1 is now bandwidth-independent.**
