# PIPELINE.md — Atlas LMIC data ingest

> **Brief mandate (p. 4):** *"Your tool must be grounded in real economic data — not synthetic proxies. You are required to incorporate and surface at least two econometric signal categories."*
>
> Atlas surfaces **6+** econometric signals from **10** real LMIC sources. All ingested via `atlas/scripts/ingest/*.ts`, written to `atlas/data/lmic/{source}/{country}.json` with citation + fetched-at timestamp, served through typed accessors in `atlas/src/lib/lmic/`. The repo never invents a number.

## 0. Layout

```
atlas/
├── data/lmic/                          # JSON cache, committed to repo
│   ├── _meta.json                      # source-index: name, url, license, fetchedAt
│   ├── ilostat/{gh,bd,vn,...}.json
│   ├── wdi/{gh,bd,vn,...}.json
│   ├── wbes/{gh,bd,vn,...}.json
│   ├── findex/{gh,bd,vn,...}.json
│   ├── wbl/{gh,bd,vn,...}.json
│   ├── frey-osborne/global.json + lmic-reappraisal.json
│   ├── wittgenstein/{gh,bd,vn,...}.json
│   ├── hci/{gh,bd,vn,...}.json
│   ├── isco/hierarchy.json
│   └── onet/{isco}.json
├── scripts/ingest/                     # ingest scripts, idempotent
│   ├── all.ts                          # parallel runner (npm run ingest)
│   ├── ilostat.ts
│   ├── wdi.ts
│   ├── wbes.ts
│   ├── findex.ts
│   ├── wbl.ts
│   ├── frey-osborne.ts
│   ├── wittgenstein.ts
│   ├── hci.ts
│   ├── isco.ts
│   └── onet.ts
└── src/lib/lmic/                       # typed accessors over JSON cache
    ├── index.ts                        # unified getX(country, isco) → { value, source, citation }
    ├── ilostat.ts
    ├── wdi.ts
    ├── wbes.ts
    ├── findex.ts
    ├── wbl.ts
    ├── frey-osborne.ts
    ├── wittgenstein.ts
    └── hci.ts
```

## 1. Cache file shape (every JSON file)

```jsonc
{
  "data": { /* source-specific shape, see per-source spec below */ },
  "source": {
    "name": "ILOSTAT",
    "url": "https://www.ilo.org/sdmx/rest/data/...",
    "license": "CC-BY-4.0",
    "fetchedAt": "2026-04-26T08:14:33Z",
    "fetchMethod": "live-rest" // or "bulk-csv-committed"
  },
  "citation": "ILO. (2024). ILOSTAT: Wages and earnings by occupation [Data set]. International Labour Organization."
}
```

Every UI rendering of an econometric value goes through `<DataSourceCitation source={...}>` so judges can click through to the live source URL.

## 2. Sources (the canonical list)

### 2.1 LABOR MARKET & EMPLOYMENT

| Source | Endpoint / Bulk | Refresh | What we extract | Where surfaced |
|---|---|---|---|---|
| **ILOSTAT** (ILO) | Live SDMX REST: `https://www.ilo.org/sdmx/rest/data/{flowRef}/{key}?format=jsondata` | On-demand at ingest; weekly cron in production | Wage by ISCO × country, employment, informal employment, hours worked, gender breakdown | Player Atlas Card 💰 VERDICT · Employer KPI · Policymaker chart |
| **World Bank WDI** | Live REST: `https://api.worldbank.org/v2/country/{iso2}/indicator/{ind}?format=json&per_page=200` | On-demand; daily cron | Sector employment growth YoY, NEET %, GDP per capita, female LFP, learning-adjusted years of schooling | Player Atlas Card · Employer KPI · Policymaker chart |
| **World Bank Enterprise Surveys (WBES)** | API: `https://api.enterprisesurveys.org/api/indicator/all/{iso3}` | On-demand; quarterly (data updated every 3–5 yrs) | Firm-level skill gaps, hiring difficulty, unfilled vacancies, female employment shares | Employer KPI · Policymaker chart |
| **World Bank Human Capital Index (HCI)** | Live REST: `https://api.worldbank.org/v2/country/{iso2}/indicator/HD.HCI.OVRL?format=json` | Annual | Learning-adjusted years of schooling | Policymaker context |
| **ILO ISCO-08** | Bulk CSV download from `https://www.ilo.org/public/english/bureau/stat/isco/isco08/` (committed) | Annual (rare changes) | Occupation hierarchy: major (1) → submajor (2) → minor (3) → unit (4) | `atlas/src/lib/skills/isco.ts` |

### 2.2 EDUCATION PROJECTIONS

| Source | Endpoint / Bulk | Refresh | What we extract | Where surfaced |
|---|---|---|---|---|
| **Wittgenstein Centre** | JSON download from `http://dataexplorer.wittgensteincentre.org/wcde-v3/` (committed) | Annual | Education level projections by country / age / sex 2025–2035+ | Policymaker chart (Module 2 — "where the landscape is shifting") |
| **UNESCO UIS** | API: `http://api.uis.unesco.org/sdmx/data/...` | Annual | Enrollment rates, completion rates, gender parity | Policymaker context |
| **UN Population Projections** | Bulk: `https://population.un.org/wpp/Download/Standard/Population/` | Annual | Age-sex population to 2100 | Policymaker context (skill-population divergence) |

### 2.3 AUTOMATION & AI READINESS

| Source | Endpoint / Bulk | Refresh | What we extract | Where surfaced |
|---|---|---|---|---|
| **Frey & Osborne 2013 + ILO/WB LMIC reappraisal** | Paper supplementary CSV (committed): Frey-Osborne 2013 + ILO/WB 2018 adaptation | Static | Automation probability per occupation; LMIC-calibrated multiplier | Player Atlas Card 🤖 AI TIER (automation-risk strip) · Policymaker chart (Module 2) |
| **World Bank STEP** | Microdata + summary CSV (committed): https://microdata.worldbank.org/index.php/catalog/step | Static (16 LMICs surveyed 2012–2017) | Skill measurement reference rubrics; Ghana 2013 calibration anchor | `atlas/src/lib/skills/step.ts` (rubric anchor, not raw data shown) |
| **ILO Future of Work** task indices | Bulk CSV (committed) | Static | Task-content indices by occupation (routine vs non-routine, cognitive vs manual) for 40+ countries | Cross-checked against Frey-Osborne |

### 2.4 SKILLS TAXONOMIES

| Source | Endpoint / Bulk | Refresh | What we extract | Where surfaced |
|---|---|---|---|---|
| **O*NET 28+ (US DOL)** | Bulk download `https://www.onetcenter.org/database.html` (committed) | Twice yearly | Task content per ISCO (LMIC-adapted via crosswalks) | `atlas/src/lib/skills/onet.ts` |
| **~~ESCO~~** | — | — | NOT USED. Eurocentric, doesn't fit LMIC informal-sector reality. | — |

### 2.5 GENDER & LEGAL

| Source | Endpoint / Bulk | Refresh | What we extract | Where surfaced |
|---|---|---|---|---|
| **Women, Business and the Law (WBL) 2024** | Bulk CSV from `https://wbl.worldbank.org/en/wbl-data` (committed) | Annual | Country-level gender legal score (0–100) across 8 indicators | Privacy default driver in `atlas/src/lib/privacy.ts` · Policymaker block |
| **World Bank Worldwide Governance Indicators (WGI)** | API: `https://api.worldbank.org/v2/country/{iso2}/indicator/RL.EST` | Annual | Rule-of-law score | Privacy default driver (combined with WBL) |

### 2.6 DIGITAL READINESS

| Source | Endpoint / Bulk | Refresh | What we extract | Where surfaced |
|---|---|---|---|---|
| **Global Findex 2024** | Bulk CSV from `https://www.worldbank.org/en/publication/globalfindex/Data` (committed) | Triennial (last: 2024) | Mobile money penetration, digital financial inclusion, account ownership | Employer KPI · Player Atlas Card viability check |
| **ITU Digital Development** | API: `https://www.itu.int/en/ITU-D/Statistics/Pages/stat/default.aspx` | Annual | Mobile broadband subscriptions, internet penetration | Policymaker context |

## 3. Failure modes + fallbacks

| Source | Live API down | Fallback |
|---|---|---|
| ILOSTAT | 5xx, rate-limit (60 req/min) | Bulk SDMX archive + retry-with-backoff (3 tries, 2s/4s/8s) |
| WDI | 5xx | Cached fallback in `data/lmic/wdi/{country}.json`, mark `fetchedAt` as stale |
| WBES | 5xx, sparse coverage | Skip indicator; UI shows "—" with "data not available for this country" link to source |
| HCI | rare | Cached fallback |
| Wittgenstein | manual download | Always cached (committed CSV→JSON converter) |
| Frey-Osborne / STEP / O*NET | static papers | Always cached (committed) |
| WBL / Findex | rare | Cached |

**Hard rule:** if a source is unreachable AND no cached value exists, the UI shows `—` with a `<DataSourceCitation>` linking to the source. We never substitute a synthetic number.

## 4. Refresh strategy

- **Phase 1 (08:00–10:00 tomorrow):** initial fetch of every source for GH / BD. Commit results to `data/lmic/`. `_meta.json` records `fetchedAt`.
- **Phase 2+:** ingest is idempotent. `pnpm ingest` re-runs everything in parallel. `pnpm ingest:ilostat --country GH` for one source/country.
- **Production roadmap:** Vercel Cron job runs `pnpm ingest` weekly; opens a PR with the diff.

## 5. Ingest script template

Every script in `atlas/scripts/ingest/*.ts` follows this shape:

```ts
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const Schema = z.object({ /* validates fetched payload */ });

export async function ingestX(country: string): Promise<void> {
  const url = `https://...`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`X fetch failed for ${country}: ${res.status}`);
  const raw = await res.json();
  const data = Schema.parse(raw);

  const out = {
    data,
    source: {
      name: "X",
      url,
      license: "CC-BY-4.0",
      fetchedAt: new Date().toISOString(),
      fetchMethod: "live-rest" as const,
    },
    citation: "X (2024). [Data set]. ...",
  };

  const outPath = path.join("data/lmic/x", `${country.toLowerCase()}.json`);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2));
}
```

## 6. Citation hygiene

**Every UI surface that renders an econometric value must:**
- Use the typed accessor: `getWage(country, isco) → { value, source, citation }`
- Wrap with `<DataSourceCitation source={...}>` so the citation is one click away
- Never inline a hardcoded number ✗ — always read through `lib/lmic/` ✓

**Phase 4 (pre-submit) audit:** open every chart and Atlas Card, click every citation, confirm it resolves to a live source URL. Document in `TASKS.md` as a P0 acceptance gate.

## 7. The brief-compliance contract

| Brief requirement (p. 5) | This pipeline's response |
|---|---|
| "Show the data" | All 10 sources ingested, surfaced, cited inline |
| "≥ 2 econometric signal categories" | We surface 6+ on the player Atlas Card alone (wage, sector growth, automation risk, AI Tier premium, gender legal, digital readiness) |
| "Real economic data, not synthetic" | Every JSON file has a `source.url` and `fetchedAt` |
| "Honest about limits" | Section 3 above lists every fallback explicitly. Banner discloses cached vs live. |

— *last updated: Phase 0 scaffold, 2026-04-25*
