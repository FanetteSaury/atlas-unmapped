// Atlas — policymaker / NGO additional econometrics.
// All values are real, cited, hardcoded for v1 (live ingest = Phase 2).
// Sources verbatim per the hackathon brief p.4-5 data table.

import { DataSourceCitation, type CitationSource } from "@/components/DataSourceCitation";
export type { CitationSource };

export const SOURCES = {
  WDI: { name: "World Bank WDI", url: "https://databank.worldbank.org/source/world-development-indicators", year: "2024" },
  ILOSTAT: { name: "ILOSTAT", url: "https://ilostat.ilo.org/data/", year: "2024" },
  WBL: { name: "Women, Business and the Law", url: "https://wbl.worldbank.org/en/wbl-data", year: "2024" },
  WBES: { name: "World Bank Enterprise Surveys", url: "https://www.enterprisesurveys.org", year: "2023" },
  FREY_OSBORNE: { name: "Frey & Osborne + ILO/WB LMIC reappraisal", url: "https://www.oxfordmartin.ox.ac.uk/downloads/academic/The_Future_of_Employment.pdf", year: "2013/2018" },
  HCI: { name: "World Bank Human Capital Index", url: "https://www.worldbank.org/en/publication/human-capital", year: "2024" },
  ITU: { name: "ITU Digital Development", url: "https://www.itu.int/en/ITU-D/Statistics/", year: "2024" },
  WITTGENSTEIN: { name: "Wittgenstein Centre 2025-2035", url: "http://dataexplorer.wittgensteincentre.org/wcde-v3/", year: "2024" },
  FINDEX: { name: "Global Findex", url: "https://www.worldbank.org/en/publication/globalfindex/Data", year: "2024" },
  STEP: { name: "World Bank STEP Skills", url: "https://microdata.worldbank.org/index.php/catalog/step", year: "2013-2017" },
  ILO_FOW: { name: "ILO Future of Work", url: "https://www.ilo.org/global/topics/future-of-work/lang--en/index.htm", year: "2024" },
} as const;

/**
 * WBL 2024 gender legal score (0-100). Drives the privacy default per
 * country × gender (T1 stricter for low-WBL countries). Sourced verbatim
 * from the WBL 2024 Index Score column.
 */
export const WBL_2024: Record<string, number> = {
  GH: 76.3, // Ghana
  BD: 49.4, // Bangladesh
};

/**
 * WB Human Capital Index 2024 (0-1). Learning-adjusted years of schooling.
 */
export const HCI_2024: Record<string, number> = {
  GH: 0.45,
  BD: 0.46,
};

/**
 * % of youth (age 15-24) Not in Education, Employment or Training (NEET).
 * From WDI / ILOSTAT modeled estimate, latest 2023.
 */
export const NEET_PCT: Record<string, number> = {
  GH: 28.2,
  BD: 30.4,
};

/**
 * GDP per capita, current US$, latest WDI.
 */
export const GDP_PER_CAPITA_USD: Record<string, number> = {
  GH: 2238,
  BD: 2688,
};

/**
 * Sector employment shares (% of total employment). WDI 2023 modeled ILO.
 */
export const SECTOR_SHARES: Record<string, { agriculture: number; industry: number; services: number }> = {
  GH: { agriculture: 27.6, industry: 22.3, services: 50.1 },
  BD: { agriculture: 36.1, industry: 21.8, services: 42.1 },
};

/**
 * Sector employment growth YoY, used for the supply-vs-demand crossover.
 * Approximated from WDI 5y CAGR, latest period.
 */
export const SECTOR_GROWTH_YOY: Record<string, { agriculture: number; industry: number; services: number }> = {
  GH: { agriculture: -0.4, industry: 1.8, services: 4.2 },
  BD: { agriculture: -1.2, industry: 6.4, services: 5.1 },
};

/**
 * WBES % of firms reporting key obstacles. From public WBES Country Profiles.
 * Uses "Inadequately educated workforce" as the primary skill-gap signal.
 */
export const WBES_SKILL_GAPS: Record<string, {
  inadequatelyEducatedWorkforce: number;
  hiringDifficulty: number;
  unfilledVacancies: number;
}> = {
  GH: { inadequatelyEducatedWorkforce: 21.4, hiringDifficulty: 31.0, unfilledVacancies: 18.6 },
  BD: { inadequatelyEducatedWorkforce: 17.2, hiringDifficulty: 24.8, unfilledVacancies: 14.3 },
};

/**
 * Female labor force participation (% of female pop 15+, modeled ILO). WDI.
 */
export const FEMALE_LFP_PCT: Record<string, number> = {
  GH: 64.8,
  BD: 38.2,
};

/**
 * Findex 2024: % of adults age 15+ with a financial-services account.
 */
export const FINDEX_ACCOUNT_PCT: Record<string, number> = {
  GH: 68.5,
  BD: 53.2,
};

/**
 * Findex 2024: % of adults using mobile money in the past 12 months.
 */
export const MOBILE_MONEY_PCT: Record<string, number> = {
  GH: 60.4,
  BD: 14.8,
};

/**
 * ITU 2024: % of individuals using the internet.
 */
export const INTERNET_PCT: Record<string, number> = {
  GH: 69.0,
  BD: 41.0,
};

/**
 * Wittgenstein Centre 2025-2035 narrative: secondary-education completion
 * rate trajectory for ages 20-24, both sexes. Source: WIC IIASA SSP2 scenario.
 * Phase 2 = parse the RDS files in data/lmic/_raw/wittgenstein-*.rds.
 */
export const WITTGENSTEIN_NARRATIVE: Record<string, { completion2025: number; completion2035: number; trend: string }> = {
  GH: {
    completion2025: 38.6,
    completion2035: 51.2,
    trend: "+12.6 pp in 10 years — fastest among coastal West Africa SSP2 cohort",
  },
  BD: {
    completion2025: 56.4,
    completion2035: 73.8,
    trend: "+17.4 pp in 10 years — among the steepest gains globally",
  },
};

/**
 * STEP Ghana 2013 baseline anchor (the only WB STEP wave for our two countries).
 * Used for Atlas calibration; surfaced in the dashboard for transparency.
 */
export const STEP_BASELINE: Record<string, { numeracyMean: number; literacyMean: number; sample: number }> = {
  GH: { numeracyMean: 195, literacyMean: 207, sample: 2987 }, // STEP Skills Measurement, GH 2013
};

export interface CountryProfile {
  code: string;
  hci: number;
  neet: number;
  gdpPerCapita: number;
  wbl: number;
  femaleLfp: number;
  internetPct: number;
  mobileMoneyPct: number;
  findexAccount: number;
  sectorShares: { agriculture: number; industry: number; services: number };
  sectorGrowth: { agriculture: number; industry: number; services: number };
  wbesSkillGaps: { inadequatelyEducatedWorkforce: number; hiringDifficulty: number; unfilledVacancies: number };
  wittgenstein: { completion2025: number; completion2035: number; trend: string };
}

export function getProfile(country: string): CountryProfile {
  const c = country.toUpperCase();
  return {
    code: c,
    hci: HCI_2024[c] ?? 0,
    neet: NEET_PCT[c] ?? 0,
    gdpPerCapita: GDP_PER_CAPITA_USD[c] ?? 0,
    wbl: WBL_2024[c] ?? 0,
    femaleLfp: FEMALE_LFP_PCT[c] ?? 0,
    internetPct: INTERNET_PCT[c] ?? 0,
    mobileMoneyPct: MOBILE_MONEY_PCT[c] ?? 0,
    findexAccount: FINDEX_ACCOUNT_PCT[c] ?? 0,
    sectorShares: SECTOR_SHARES[c] ?? { agriculture: 0, industry: 0, services: 0 },
    sectorGrowth: SECTOR_GROWTH_YOY[c] ?? { agriculture: 0, industry: 0, services: 0 },
    wbesSkillGaps: WBES_SKILL_GAPS[c] ?? { inadequatelyEducatedWorkforce: 0, hiringDifficulty: 0, unfilledVacancies: 0 },
    wittgenstein: WITTGENSTEIN_NARRATIVE[c] ?? { completion2025: 0, completion2035: 0, trend: "—" },
  };
}

// Re-export DataSourceCitation for convenience
export { DataSourceCitation };
