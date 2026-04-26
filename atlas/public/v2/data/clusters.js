// Atlas — informal-skill clusters (10) wired into policymaker.js via window.ATLAS_CLUSTERS.
window.ATLAS_CLUSTERS = [
  {
    id: "artisan", name: "The Artisan", emoji: "🔧", tagline: "Hands. Craft. Fixing things.",
    sample_iscos: ["7411", "7421", "7531", "7212", "7232", "7233"],
    isco_majors: [7, 8], sub_majors: ["741", "742", "753"], skill_level: 2,
    cohort_pct: { GH: 18.4, BD: 14.1 }, wage_band: { GH: "₵1,050–1,400", BD: "৳9,800–13,500" },
    skill_gap_demand_pct: { GH: 58, BD: 51 }, sector_growth_pct: { GH: 3.2, BD: 4.1 },
    automation_risk_pct: 58, female_share_pct: 32,
    informal_skills: ["soldering", "diagnostic reasoning", "hand embroidery", "pattern cutting"],
    flagship_persona: "Amara — Madina, Ghana"
  },
  {
    id: "grower", name: "The Grower", emoji: "🌾", tagline: "Patience. Cycles. Earth.",
    sample_iscos: ["6111", "6121", "6130", "6210", "6224", "9211"],
    isco_majors: [6, 9], sub_majors: ["611", "612", "613"], skill_level: 1,
    cohort_pct: { GH: 11.2, BD: 19.8 }, wage_band: { GH: "₵720–950", BD: "৳6,400–8,800" },
    skill_gap_demand_pct: { GH: 28, BD: 32 }, sector_growth_pct: { GH: 1.1, BD: 1.8 },
    automation_risk_pct: 18, female_share_pct: 47,
    informal_skills: ["seasonal planning", "weather judgment", "livestock health", "irrigation timing"],
    flagship_persona: "Sub-Saharan + South Asian rural cohorts"
  },
  {
    id: "dealmaker", name: "The Dealmaker", emoji: "🤝", tagline: "Negotiation. Networks. Flow.",
    sample_iscos: ["5211", "5212", "5223", "5221", "5230", "9520"],
    isco_majors: [5, 9, 1], sub_majors: ["521", "522"], skill_level: 2,
    cohort_pct: { GH: 21.5, BD: 18.7 }, wage_band: { GH: "₵720–1,100", BD: "৳7,200–11,500" },
    skill_gap_demand_pct: { GH: 60, BD: 54 }, sector_growth_pct: { GH: 5.6, BD: 6.2 },
    automation_risk_pct: 92, female_share_pct: 58,
    informal_skills: ["price negotiation", "supplier networks", "ice-supply timing", "credit & susu"],
    flagship_persona: "Lagos / Dakar / Dhaka / Hà Nội traders"
  },
  {
    id: "guardian", name: "The Guardian", emoji: "🛡️", tagline: "Care. Protect. Teach.",
    sample_iscos: ["5311", "5312", "5321", "2342", "3412", "5414"],
    isco_majors: [5, 3], sub_majors: ["531", "532", "234"], skill_level: 2,
    cohort_pct: { GH: 12.8, BD: 11.2 }, wage_band: { GH: "₵850–1,200", BD: "৳7,800–10,400" },
    skill_gap_demand_pct: { GH: 46, BD: 42 }, sector_growth_pct: { GH: 2.8, BD: 2.5 },
    automation_risk_pct: 22, female_share_pct: 81,
    informal_skills: ["child care", "basic literacy teaching", "first aid", "community health outreach"],
    flagship_persona: "Care economy women"
  },
  {
    id: "storyteller", name: "The Storyteller", emoji: "💡", tagline: "Voice. Audience. Persuasion.",
    sample_iscos: ["5113", "5141", "5142", "2654", "3431", "5142"],
    isco_majors: [5, 3], sub_majors: ["511", "514", "265"], skill_level: 2,
    cohort_pct: { GH: 8.1, BD: 6.7 }, wage_band: { GH: "₵900–1,500", BD: "৳7,000–12,000" },
    skill_gap_demand_pct: { GH: 38, BD: 35 }, sector_growth_pct: { GH: 4.3, BD: 5.0 },
    automation_risk_pct: 64, female_share_pct: 63,
    informal_skills: ["tour guiding", "on-camera presence", "salon styling", "events MC"],
    flagship_persona: "Creator economy entrants"
  },
  {
    id: "builder", name: "The Builder", emoji: "💻", tagline: "Logic. Systems. Code.",
    sample_iscos: ["2511", "2512", "2513", "2519", "2521", "3514"],
    isco_majors: [2, 3], sub_majors: ["251", "252"], skill_level: 4,
    cohort_pct: { GH: 4.2, BD: 7.9 }, wage_band: { GH: "₵3,800–6,400", BD: "৳25,000–48,000" },
    skill_gap_demand_pct: { GH: 71, BD: 68 }, sector_growth_pct: { GH: 8.4, BD: 9.6 },
    automation_risk_pct: 14, female_share_pct: 21,
    informal_skills: ["frontend frameworks", "API integration", "git workflows", "debugging under pressure"],
    flagship_persona: "Tuan — Hà Nội"
  },
  {
    id: "hauler", name: "The Hauler", emoji: "🚛", tagline: "Routes. Loads. Reliability.",
    sample_iscos: ["8322", "8331", "9621", "8332", "9333", "9624"],
    isco_majors: [8, 9], sub_majors: ["832", "833", "962"], skill_level: 2,
    cohort_pct: { GH: 9.7, BD: 8.4 }, wage_band: { GH: "₵800–1,300", BD: "৳7,500–11,200" },
    skill_gap_demand_pct: { GH: 41, BD: 39 }, sector_growth_pct: { GH: 2.4, BD: 3.1 },
    automation_risk_pct: 78, female_share_pct: 6,
    informal_skills: ["route memory", "vehicle maintenance basics", "haggling fares", "dispatch coordination"],
    flagship_persona: "Trotro / rickshaw drivers"
  },
  {
    id: "healer", name: "The Healer", emoji: "💉", tagline: "Symptoms. Care. Response.",
    sample_iscos: ["3221", "3222", "3253", "5329", "2230", "3258"],
    isco_majors: [3, 5, 2], sub_majors: ["322", "325"], skill_level: 3,
    cohort_pct: { GH: 5.8, BD: 6.2 }, wage_band: { GH: "₵1,400–2,100", BD: "৳12,400–18,000" },
    skill_gap_demand_pct: { GH: 64, BD: 61 }, sector_growth_pct: { GH: 4.8, BD: 5.2 },
    automation_risk_pct: 12, female_share_pct: 74,
    informal_skills: ["triage", "vital signs", "vaccination logistics", "patient communication"],
    flagship_persona: "CHWs + rural midwives"
  },
  {
    id: "hospitality", name: "The Host", emoji: "🍲", tagline: "Welcome. Feed. Host.",
    sample_iscos: ["5120", "5131", "5132", "5152", "5141", "9412"],
    isco_majors: [5, 9], sub_majors: ["512", "513", "515"], skill_level: 2,
    cohort_pct: { GH: 4.6, BD: 3.9 }, wage_band: { GH: "₵700–1,050", BD: "৳6,000–9,200" },
    skill_gap_demand_pct: { GH: 32, BD: 28 }, sector_growth_pct: { GH: 3.7, BD: 4.4 },
    automation_risk_pct: 48, female_share_pct: 67,
    informal_skills: ["recipe scaling", "stock rotation", "guest reading", "shift coordination"],
    flagship_persona: "Phở stalls / chop bars / tea shops"
  },
  {
    id: "networker", name: "The Networker", emoji: "📞", tagline: "Match. Bridge. Refer.",
    sample_iscos: ["3322", "4222", "4223", "5212", "3339", "3343"],
    isco_majors: [3, 4, 5], sub_majors: ["332", "422"], skill_level: 3,
    cohort_pct: { GH: 3.7, BD: 3.1 }, wage_band: { GH: "₵1,100–1,800", BD: "৳9,500–14,000" },
    skill_gap_demand_pct: { GH: 52, BD: 48 }, sector_growth_pct: { GH: 4.1, BD: 4.7 },
    automation_risk_pct: 70, female_share_pct: 53,
    informal_skills: ["follow-up discipline", "trust building", "WhatsApp group ops", "referrals"],
    flagship_persona: "Insurance / mobile-money agents"
  }
];
