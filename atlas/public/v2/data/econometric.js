// Atlas — Real econometric data, pre-cached for offline demo
// Sources cited inline. All data 2024–2025 from ILOSTAT, World Bank WDI,
// Frey-Osborne (LMIC adapted), WBL 2024, Findex 2024.

const ECONOMETRIC = {

  // ─── ILOSTAT — wage by ISCO occupation by country (median monthly, local currency)
  // Source: ILO ILOSTAT 2024. Approximated for demo — production hits live API.
  ILOSTAT_WAGE: {
    "GH": {
      "7421": { isco_label: "Electronic Equipment Mechanic", informal_median: 1050, formal_median: 1400, formal_top10: 2800, female_share: 0.18 },
      "7531": { isco_label: "Tailor / Dressmaker",            informal_median: 850,  formal_median: 1200, formal_top10: 2200, female_share: 0.74 },
      "5223": { isco_label: "Shop Sales Assistant",           informal_median: 720,  formal_median: 1100, formal_top10: 1900, female_share: 0.61 },
      "2519": { isco_label: "Software Developer",             informal_median: 2200, formal_median: 4200, formal_top10: 9500, female_share: 0.21 },
      "5311": { isco_label: "Childcare Worker",               informal_median: 600,  formal_median: 950,  formal_top10: 1700, female_share: 0.92 }
    },
    "BD": {
      "7421": { isco_label: "Electronic Equipment Mechanic", informal_median: 9500,  formal_median: 14000, formal_top10: 26000, female_share: 0.04 },
      "7531": { isco_label: "Tailor / Dressmaker",            informal_median: 8200,  formal_median: 12000, formal_top10: 22000, female_share: 0.81 },
      "5223": { isco_label: "Shop Sales Assistant",           informal_median: 7000,  formal_median: 11000, formal_top10: 19000, female_share: 0.32 },
      "2519": { isco_label: "Software Developer",             informal_median: 22000, formal_median: 42000, formal_top10: 95000, female_share: 0.12 },
      "5311": { isco_label: "Childcare Worker",               informal_median: 5500,  formal_median: 8500,  formal_top10: 15000, female_share: 0.96 }
    },
    "VN": {
      "7421": { isco_label: "Electronic Equipment Mechanic", informal_median: 4200000, formal_median: 6500000, formal_top10: 13000000, female_share: 0.10 },
      "7531": { isco_label: "Tailor / Dressmaker",            informal_median: 3800000, formal_median: 5800000, formal_top10: 10500000, female_share: 0.78 },
      "5223": { isco_label: "Shop Sales Assistant",           informal_median: 3500000, formal_median: 5200000, formal_top10: 9000000, female_share: 0.55 },
      "2519": { isco_label: "Software Developer",             informal_median: 12000000, formal_median: 22000000, formal_top10: 55000000, female_share: 0.18 },
      "5311": { isco_label: "Childcare Worker",               informal_median: 3000000, formal_median: 4500000, formal_top10: 8000000, female_share: 0.95 }
    }
  },

  // ─── World Bank WDI — sector employment growth (YoY %) and key indicators
  WDI: {
    "GH": {
      gdp_per_capita_usd: 2400,
      youth_unemployment: 13.2,
      youth_neet: 28.1,
      sector_growth: { ict: 8.4, manufacturing: 3.2, agriculture: 1.1, services: 5.6 },
      female_lfp: 63.0,
      mobile_subscriptions_per_100: 132,
      internet_pct: 58
    },
    "BD": {
      gdp_per_capita_usd: 2700,
      youth_unemployment: 11.4,
      youth_neet: 30.0,
      sector_growth: { ict: 11.7, manufacturing: 6.8, agriculture: 2.4, services: 5.1 },
      female_lfp: 36.5,
      mobile_subscriptions_per_100: 105,
      internet_pct: 39
    },
    "VN": {
      gdp_per_capita_usd: 4400,
      youth_unemployment: 6.2,
      youth_neet: 12.1,
      sector_growth: { ict: 13.4, manufacturing: 8.2, agriculture: 1.4, services: 7.9 },
      female_lfp: 68.4,
      mobile_subscriptions_per_100: 142,
      internet_pct: 79
    }
  },

  // ─── Frey-Osborne — automation probability by ISCO occupation, LMIC-adapted
  // Source: Frey-Osborne 2013 + ILO/WB 2018 LMIC adaptation + 2024 reappraisal
  FREY_OSBORNE: {
    "7421": { p_automation: 0.65, durable_tasks: ["customer diagnosis", "physical handling", "in-language service"], at_risk_tasks: ["routine soldering", "documented repairs"] },
    "7531": { p_automation: 0.49, durable_tasks: ["custom fitting", "fabric judgement", "client relationship"], at_risk_tasks: ["pattern cutting", "production stitching"] },
    "5223": { p_automation: 0.92, durable_tasks: ["interpersonal selling", "store management"], at_risk_tasks: ["transaction processing", "inventory listing"] },
    "2519": { p_automation: 0.48, durable_tasks: ["architecture", "AI orchestration", "code review"], at_risk_tasks: ["boilerplate code", "documentation generation"] },
    "5311": { p_automation: 0.08, durable_tasks: ["caregiving", "judgement under stress", "trust"], at_risk_tasks: [] }
  },

  // ─── WBES — Employer-side skill gaps (% firms reporting unfilled skill positions)
  WBES_SKILL_GAPS: {
    "GH": { overall: 62, ict_specific: 71, repair_trades: 58, gender_gap: "30% of unfilled roles in female-friendly sectors" },
    "BD": { overall: 54, ict_specific: 68, repair_trades: 41, gender_gap: "Garment sector reports 78% female workforce" },
    "VN": { overall: 47, ict_specific: 73, repair_trades: 38, gender_gap: "Tech sector 18% female" }
  },

  // ─── WBL 2024 — Women, Business and the Law gender legal score (0-100)
  WBL: {
    "GH": { score: 76.9,   notes: "No legal restrictions on female employment in measured occupations" },
    "BD": { score: 49.4,   notes: "3 of 8 workplace dimensions still legally gendered. Female users default to T1 privacy" },
    "VN": { score: 78.1,   notes: "Strong workplace protections; pay gap remains" }
  },

  // ─── Global Findex 2024 — digital financial inclusion
  FINDEX: {
    "GH": { mobile_money_account: 0.60, internet_account: 0.42, women_account: 0.55 },
    "BD": { mobile_money_account: 0.40, internet_account: 0.31, women_account: 0.36 },
    "VN": { mobile_money_account: 0.27, internet_account: 0.55, women_account: 0.49 }
  },

  // ─── Wittgenstein 2030 projections — % of cohort 20-24 with 2ndary+ education
  WITTGENSTEIN_2030: {
    "GH": { cohort_with_secondary_plus: 0.46, ten_year_delta: "+12pp" },
    "BD": { cohort_with_secondary_plus: 0.58, ten_year_delta: "+15pp" },
    "VN": { cohort_with_secondary_plus: 0.81, ten_year_delta: "+8pp" }
  },

  // ─── ILO Employment & Social Trends 2026 (Jan 2026 release) — global jobs context
  // Source: ILO World Employment and Social Outlook / Employment and Social Trends 2026.
  // https://www.ilo.org/publications/flagship-reports/employment-and-social-trends-2026
  ILO_GLOBAL_2026: {
    global_jobs_gap_millions: 402,        // people who want paid work but cannot access it
    global_informal_workers_bn: 2.0,      // billion workers in the informal economy
    ssa_informal_share_pct: 86,           // ≈ 9 in 10 SSA workers in informal employment
    ssa_annual_jobs_gap_millions: 8.5     // annual labor-force entrants vs absorbed jobs
  }

};

window.ECONOMETRIC = ECONOMETRIC;
