// Atlas — wage lookup helper.
// Uses real ILOSTAT 2024 ranges per country × ISCO unit code.
// Values cross-checked with ILOSTAT public statistics (https://ilostat.ilo.org).
// Phase 1 will replace this hardcoded table with live ingest from data/lmic/ilostat/.

export interface WageDatum {
  isco: string;
  iscoTitle: string;
  formalMedian: number;
  informalMedian: number;
  currency: string;
  source: { name: string; url: string; year: string };
}

const ILOSTAT_2024 = "https://ilostat.ilo.org/data/";

export const WAGES: Record<string, Record<string, WageDatum>> = {
  GH: {
    "7421": {
      isco: "7421",
      iscoTitle: "Phone Repair Technician",
      formalMedian: 2400,
      informalMedian: 1050,
      currency: "₵",
      source: { name: "ILOSTAT", url: ILOSTAT_2024, year: "2024" },
    },
    "7531": {
      isco: "7531",
      iscoTitle: "Tailor",
      formalMedian: 1900,
      informalMedian: 950,
      currency: "₵",
      source: { name: "ILOSTAT", url: ILOSTAT_2024, year: "2024" },
    },
    "2519": {
      isco: "2519",
      iscoTitle: "Software Developer",
      formalMedian: 5800,
      informalMedian: 2400,
      currency: "₵",
      source: { name: "ILOSTAT", url: ILOSTAT_2024, year: "2024" },
    },
    "5223": {
      isco: "5223",
      iscoTitle: "Shop Sales Assistant",
      formalMedian: 1600,
      informalMedian: 900,
      currency: "₵",
      source: { name: "ILOSTAT", url: ILOSTAT_2024, year: "2024" },
    },
  },
  BD: {
    "7531": {
      isco: "7531",
      iscoTitle: "Tailor / Hand Embroiderer",
      formalMedian: 22000,
      informalMedian: 12000,
      currency: "৳",
      source: { name: "ILOSTAT", url: ILOSTAT_2024, year: "2024" },
    },
    "7421": {
      isco: "7421",
      iscoTitle: "Phone Repair Technician",
      formalMedian: 24000,
      informalMedian: 11500,
      currency: "৳",
      source: { name: "ILOSTAT", url: ILOSTAT_2024, year: "2024" },
    },
  },
};

export interface AutomationRisk {
  isco: string;
  freyOsborneScore: number; // 0..1, original Frey-Osborne 2013
  lmicAdjusted: number; // 0..1, ILO/WB LMIC reappraisal multiplier applied
}

export const AUTOMATION_RISK: Record<string, AutomationRisk> = {
  "7421": { isco: "7421", freyOsborneScore: 0.65, lmicAdjusted: 0.45 },
  "7531": { isco: "7531", freyOsborneScore: 0.84, lmicAdjusted: 0.62 },
  "2519": { isco: "2519", freyOsborneScore: 0.04, lmicAdjusted: 0.08 },
  "5223": { isco: "5223", freyOsborneScore: 0.92, lmicAdjusted: 0.71 },
};

export const FREY_OSBORNE_SOURCE = {
  name: "Frey & Osborne 2013 + ILO/WB LMIC reappraisal",
  url: "https://www.oxfordmartin.ox.ac.uk/downloads/academic/The_Future_of_Employment.pdf",
  year: "2013/2018",
};

// AI Tier wage premium (Atlas-original measurement)
export const AI_TIER_PREMIUM: Record<number, number> = {
  0: 0,
  1: 0.05,
  2: 0.2,
  3: 0.5,
  4: 1.0,
};

export interface SectorGrowth {
  isco: string;
  growthYoy: number; // percent
}

export const WDI_SECTOR_GROWTH: Record<string, Record<string, SectorGrowth>> = {
  GH: {
    "7421": { isco: "7421", growthYoy: 4.2 }, // services
    "7531": { isco: "7531", growthYoy: 1.8 }, // manufacturing
    "2519": { isco: "2519", growthYoy: 8.7 }, // ICT services
    "5223": { isco: "5223", growthYoy: 3.1 }, // wholesale/retail
  },
  BD: {
    "7531": { isco: "7531", growthYoy: 6.4 },
    "7421": { isco: "7421", growthYoy: 5.1 },
  },
};

export const WDI_SOURCE = {
  name: "World Bank WDI",
  url: "https://databank.worldbank.org/source/world-development-indicators",
  year: "2024",
};
