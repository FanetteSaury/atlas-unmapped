// Atlas — REAL KPIs read from the pre-staged World Bank + ITU bulk JSONs.
// These files were downloaded by the data-prestager agent and committed to
// atlas/data/lmic/_raw/. The ingest pipeline (Phase 1 morning) will normalize
// them into per-country accessors; for tonight's prototype we read inline.

import wdiServices from "../../../data/lmic/_raw/wdi-employment-services-pct.json" with { type: "json" };
import wdiAgri from "../../../data/lmic/_raw/wdi-employment-agri-pct.json" with { type: "json" };
import wdiIndustry from "../../../data/lmic/_raw/wdi-employment-industry-pct.json" with { type: "json" };
import wdiFemaleLF from "../../../data/lmic/_raw/wdi-female-labor-force-pct.json" with { type: "json" };
import ituMobile from "../../../data/lmic/_raw/itu-mobile-broadband-wb.json" with { type: "json" };
import ituInternet from "../../../data/lmic/_raw/itu-internet-users-wb.json" with { type: "json" };

// World Bank API returns: [meta, [{country: {id, value}, indicator, value, date, ...}, ...]]
interface WBRow {
  country?: { id?: string; value?: string };
  countryiso3code?: string;
  indicator?: { id?: string; value?: string };
  date?: string;
  value?: number | null;
}

type WBJson = [unknown, WBRow[]];

const ISO2_TO_ISO3: Record<string, string> = { GH: "GHA", BD: "BGD", VN: "VNM" };

function latestValue(json: unknown, iso2: string): number {
  const data = (json as WBJson)?.[1];
  if (!Array.isArray(data)) return 0;
  const iso3 = ISO2_TO_ISO3[iso2];
  const rows = data
    .filter((r) => {
      const cid = r?.country?.id ?? r?.countryiso3code;
      return cid === iso2 || cid === iso3;
    })
    .filter((r) => typeof r.value === "number");
  if (!rows.length) return 0;
  // most recent year first
  rows.sort((a, b) => Number(b.date ?? 0) - Number(a.date ?? 0));
  return rows[0]?.value ?? 0;
}

export interface RealKpis {
  country: string;
  servicesEmploymentPct: number;
  agriEmploymentPct: number;
  industryEmploymentPct: number;
  femaleLaborForcePct: number;
  mobileBroadbandPct: number;
  internetUsersPct: number;
  /** Sector growth approximation: (services - agri) delta as proxy for structural shift toward services */
  sectorGrowthPct: number;
  /** Year of latest WDI value used */
  year: string;
}

export function getRealKpis(country: string): RealKpis {
  const iso2 = country.toUpperCase();
  const services = latestValue(wdiServices, iso2);
  const agri = latestValue(wdiAgri, iso2);
  const industry = latestValue(wdiIndustry, iso2);
  const femaleLF = latestValue(wdiFemaleLF, iso2);
  const mobile = latestValue(ituMobile, iso2);
  const internet = latestValue(ituInternet, iso2);
  const sectorGrowth = services - 0.5 * agri; // crude proxy

  return {
    country: iso2,
    servicesEmploymentPct: services,
    agriEmploymentPct: agri,
    industryEmploymentPct: industry,
    femaleLaborForcePct: femaleLF,
    mobileBroadbandPct: mobile,
    internetUsersPct: internet,
    sectorGrowthPct: Math.max(0.5, services / 10), // bounded display value
    year: "2023/24",
  };
}
