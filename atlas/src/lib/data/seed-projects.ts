// Atlas — sample employer hire projects (the "demand-side" of the marketplace).
//
// Real product model: an employer signs up with a SPECIFIC need (project name,
// occupation, ward, n_hires, deadline). Atlas creates a WhatsApp group named
// after the employer + project (e.g. "Atlas · Akosua's iPhone Repair · Apr 2026").
// Candidates who match the project's filter get routed into that group at the
// end of their quest.
//
// For the hackathon demo we pre-seed 2-3 sample projects per country.
// Phase 2 production: form-driven `/employer/new-project` + Twilio Conversations
// API for dynamic group creation.
//
// Pseudonymous employer names — these are demo placeholders, not real people.

import { resolveSquadInvite } from "@/lib/wa/squad";
import { ISCO_TITLES } from "./seed-cards";

export interface HireProject {
  id: string;
  country: string; // GH | BD
  iscoCode: string;
  iscoTitle: string;
  ward: string;
  /** Demo employer's first name (pseudonymous for privacy in this build). */
  employerFirstName: string;
  /** Display name of the employer's business / project. */
  projectTitle: string;
  /** Number of hires the employer is looking to make. */
  hiresNeeded: number;
  /** ISO date string. */
  postedAt: string;
  /** ISO date string. */
  closesAt: string;
  /** What the employer is offering / context blurb. */
  blurb: string;
}

export const HIRE_PROJECTS: HireProject[] = [
  {
    id: "gh-7421-akosua-apr26",
    country: "GH",
    iscoCode: "7421",
    iscoTitle: "Phone Repair Technician",
    ward: "Madina",
    employerFirstName: "Akosua",
    projectTitle: "iPhone Screen Repair Workshop",
    hiresNeeded: 2,
    postedAt: "2026-04-15",
    closesAt: "2026-05-15",
    blurb:
      "Hiring 2 phone repair techs for our Madina workshop. iPhone-screen specialty, willing to train on Pro models. AI-Tier 2+ preferred (you use Claude/ChatGPT for diagnostics).",
  },
  {
    id: "gh-7531-mariam-apr26",
    country: "GH",
    iscoCode: "7531",
    iscoTitle: "Tailor",
    ward: "Adabraka",
    employerFirstName: "Mariam",
    projectTitle: "Adabraka Tailoring Studio",
    hiresNeeded: 3,
    postedAt: "2026-04-10",
    closesAt: "2026-05-10",
    blurb:
      "Looking for 3 tailors comfortable with custom kente blouse work. Steady customer pipeline. Workshop is in Adabraka, walking distance from Kwame Nkrumah Circle.",
  },
  {
    id: "gh-2519-kwame-apr26",
    country: "GH",
    iscoCode: "2519",
    iscoTitle: "Software Developer",
    ward: "East Legon",
    employerFirstName: "Kwame",
    projectTitle: "Local fintech, Next.js team",
    hiresNeeded: 1,
    postedAt: "2026-04-20",
    closesAt: "2026-06-01",
    blurb:
      "Junior dev for a 6-month Next.js + Postgres project. Self-taught welcome if you can ship. Hybrid Madina/East Legon.",
  },
  {
    id: "bd-7531-rashida-apr26",
    country: "BD",
    iscoCode: "7531",
    iscoTitle: "Tailor / Hand Embroiderer",
    ward: "Mirpur",
    employerFirstName: "Rashida",
    projectTitle: "Mirpur Bridal Embroidery Co-op",
    hiresNeeded: 4,
    postedAt: "2026-04-12",
    closesAt: "2026-05-30",
    blurb:
      "Bridal hand-embroidery on blouses. Co-op model: piece-rate + group benefits. Female-led group, T1-Privacy default applied per WBL 2024.",
  },
  {
    id: "bd-7421-imran-apr26",
    country: "BD",
    iscoCode: "7421",
    iscoTitle: "Phone Repair Technician",
    ward: "Dhanmondi",
    employerFirstName: "Imran",
    projectTitle: "Dhanmondi Mobile Care Center",
    hiresNeeded: 2,
    postedAt: "2026-04-18",
    closesAt: "2026-05-25",
    blurb:
      "2 techs for our Dhanmondi store. Samsung + iPhone specialty. AI tools encouraged for diagnostics + customer comms.",
  },
];

export function projectsForCountry(country: string): HireProject[] {
  return HIRE_PROJECTS.filter((p) => p.country === country.toUpperCase());
}

export function projectsForCandidate(country: string, isco: string): HireProject[] {
  return HIRE_PROJECTS.filter((p) => p.country === country.toUpperCase() && p.iscoCode === isco);
}

export function findProject(id: string): HireProject | undefined {
  return HIRE_PROJECTS.find((p) => p.id === id);
}

export function projectGroupName(p: HireProject): string {
  const month = new Date(p.postedAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  return `Atlas · ${p.employerFirstName}'s ${p.iscoTitle} Hire · ${month}`;
}

/** Resolve a real WhatsApp invite via squad.ts (env-var driven), keyed by project. */
export function projectInvite(p: HireProject): { url: string; configured: boolean; groupName: string } {
  // We reuse the existing country×ISCO env-var slot as the project's group link.
  // Phase 2: switch to per-project env keys (`WA_GROUP_PROJ_<ID>`) once we ship
  // dynamic project creation.
  const r = resolveSquadInvite(p.country, p.iscoCode);
  return { url: r.url, configured: r.configured, groupName: projectGroupName(p) };
}

// Re-export for convenience
export { ISCO_TITLES };
