// Atlas — pre-seeded sample Atlas Cards for the employer + policymaker dashboards.
// "First cohort, April 2026" — disclosed honestly in HonestLimitsBanner.
// Pseudonymous handles only. No real PII.

import { WAGES } from "./wages";

export interface SeedCard {
  handle: string; // AT-<isco>-<ward>-T<tier>
  country: string;
  iscoCode: string;
  iscoTitle: string;
  atlasClass: string;
  aiTier: 0 | 1 | 2 | 3 | 4;
  ward: string;
  matchPct: number; // 0..100
  distanceKm: number;
  issuedAt: string; // ISO date
}

const GHANA_WARDS = [
  "Madina",
  "East Legon",
  "Adabraka",
  "Nima",
  "Osu",
  "Achimota",
  "Tema West",
  "Dansoman",
  "Tesano",
  "Lapaz",
];

const BANGLADESH_WARDS = [
  "Mirpur",
  "Dhanmondi",
  "Gulshan",
  "Mohammadpur",
  "Uttara",
  "Bashundhara",
  "Tejgaon",
  "Banani",
];

const CLASS_BY_ISCO_PREFIX: Record<string, string> = {
  "1": "🧠 Solver",
  "2": "💻 Builder",
  "3": "🎨 Storyteller",
  "4": "🧠 Solver",
  "5": "🤝 Dealmaker",
  "6": "🌾 Grower",
  "7": "🔧 Artisan",
  "8": "🔧 Artisan",
  "9": "⚡ Hustler",
};

const atlasClassFor = (isco: string) => CLASS_BY_ISCO_PREFIX[isco.charAt(0)] ?? "⚡ Hustler";

function buildSet(country: string, wards: string[], iscos: string[]): SeedCard[] {
  const cards: SeedCard[] = [];
  const seedDay = new Date(2026, 3, 25);
  let i = 0;
  for (const isco of iscos) {
    const wage = WAGES[country]?.[isco];
    if (!wage) continue;
    const baseTitle = wage.iscoTitle;
    // 5-12 candidates per occupation, distributed across wards
    const count = 5 + ((isco.charCodeAt(0) + isco.charCodeAt(1)) % 8);
    for (let n = 0; n < count; n++) {
      const ward = wards[(n + i) % wards.length];
      // bias tier distribution: more T1-T2, fewer T3-T4
      const tierRoll = (n * 7 + isco.charCodeAt(2)) % 10;
      const aiTier = (tierRoll < 1 ? 0 : tierRoll < 4 ? 1 : tierRoll < 7 ? 2 : tierRoll < 9 ? 3 : 4) as 0 | 1 | 2 | 3 | 4;
      const matchPct = 60 + ((isco.charCodeAt(3) + n * 11) % 38);
      const distance = ((n * 2.7 + i * 0.4) % 8.5).toFixed(1);
      const handle = `AT-${isco}-${ward.replace(/[^A-Za-z]/g, "").slice(0, 6)}-T${aiTier}`;
      const daysAgo = (n + i) % 25;
      const issuedAt = new Date(seedDay.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      cards.push({
        handle,
        country,
        iscoCode: isco,
        iscoTitle: baseTitle,
        atlasClass: atlasClassFor(isco),
        aiTier,
        ward,
        matchPct,
        distanceKm: Number(distance),
        issuedAt,
      });
    }
    i++;
  }
  return cards;
}

export const SEED_CARDS: Record<string, SeedCard[]> = {
  GH: buildSet("GH", GHANA_WARDS, ["7421", "7531", "2519", "5223"]),
  BD: buildSet("BD", BANGLADESH_WARDS, ["7531", "7421"]),
};

export const ALL_WARDS: Record<string, string[]> = {
  GH: GHANA_WARDS,
  BD: BANGLADESH_WARDS,
};

export const ISCOS_BY_COUNTRY: Record<string, string[]> = {
  GH: ["7421", "7531", "2519", "5223"],
  BD: ["7531", "7421"],
};

export const ISCO_TITLES: Record<string, string> = {
  "7421": "Phone Repair Technician",
  "7531": "Tailor / Hand Embroiderer",
  "2519": "Software Developer",
  "5223": "Shop Sales Assistant",
};

// Squad WhatsApp invite links are resolved at runtime from env vars by
// `src/lib/wa/squad.ts` (`resolveSquadInvite(country, isco)`). The links live
// in Vercel env (`WA_GROUP_<COUNTRY>_<ISCO>`) and are never committed.
//
// `SQUAD_INVITES` below remains exported for callers that need a country×isco
// table at module-load time, but it's now derived from the resolver — flip an
// env var, the link flips here too. Phase 2 production: Twilio Conversations
// API for dynamic group creation. See `docs/WHATSAPP_GAME.md` §roadmap.
import { resolveSquadInvite } from "@/lib/wa/squad";

export const SQUAD_INVITES: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(ISCOS_BY_COUNTRY).map(([country, iscos]) => [
    country,
    Object.fromEntries(iscos.map((isco) => [isco, resolveSquadInvite(country, isco).url])),
  ]),
);
