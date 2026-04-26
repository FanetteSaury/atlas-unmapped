// Atlas — squad-invite resolution for WhatsApp groups.
//
// Hackathon-grade (Option A from the WA design doc):
//   1. Fanette manually creates one WA group per (country × ISCO) on her phone.
//   2. She copies the chat.whatsapp.com invite link from each group.
//   3. Links go into Vercel env vars (NOT committed):
//        WA_GROUP_GH_7421="https://chat.whatsapp.com/AbCdEf..."
//        WA_GROUP_GH_7531="https://chat.whatsapp.com/GhIjKl..."
//        WA_GROUP_BD_7531="..."
//   4. This module reads them at runtime.
//
// Both the Atlas Card reveal (player flow) and the employer "Join Squad"
// button call `resolveSquadInvite()`. If no env var is set for that pair,
// the function falls back to a placeholder URL that 404s — surfaced in the
// admin health-check so we know which combos still need real groups.
//
// Phase 2 production: replace this with Twilio Conversations API calls that
// create/lookup a group conversation per employer + invite participants
// programmatically. See docs/WHATSAPP_GAME.md §roadmap.

// Inline minimal ISCO title map to avoid a circular import via seed-cards.ts
// (which itself imports resolveSquadInvite from this file).
const ISCO_TITLES: Record<string, string> = {
  "7421": "Phone Repair Technician",
  "7531": "Tailor",
  "2519": "Software Developer",
  "5223": "Shop Sales Assistant",
};

export interface SquadInvite {
  url: string;
  groupName: string;
  /** True when the link is a real env-configured group; false for a stub. */
  configured: boolean;
}

const PLACEHOLDER_PREFIX = "https://chat.whatsapp.com/atlas-pending-";

function envKey(country: string, isco: string): string {
  return `WA_GROUP_${country.toUpperCase()}_${isco}`;
}

function nameFor(country: string, isco: string): string {
  const title = ISCO_TITLES[isco] ?? "Workers";
  const country3 = { GH: "Ghana", BD: "Bangladesh" }[country.toUpperCase()] ?? country;
  return `Atlas · ${country3} ${title}`;
}

export function resolveSquadInvite(country: string, isco: string): SquadInvite {
  const key = envKey(country, isco);
  const url = process.env[key];
  if (url && url.startsWith("https://chat.whatsapp.com/")) {
    return { url, groupName: nameFor(country, isco), configured: true };
  }
  return {
    url: `${PLACEHOLDER_PREFIX}${country.toLowerCase()}-${isco}`,
    groupName: nameFor(country, isco),
    configured: false,
  };
}

/** All combos we expect to have a configured group. Used by the health check. */
export const EXPECTED_GROUPS: Array<{ country: string; isco: string }> = [
  { country: "GH", isco: "7421" },
  { country: "GH", isco: "7531" },
  { country: "GH", isco: "2519" },
  { country: "GH", isco: "5223" },
  { country: "BD", isco: "7531" },
  { country: "BD", isco: "7421" },
];

/**
 * 1:1 WhatsApp deep-link, the simplest matching primitive.
 * Recruiter taps "Contact" on a candidate card -> opens WhatsApp on their phone
 * with a pre-filled introduction message addressed to Atlas's concierge number
 * (Twilio Sandbox by default, override via WA_CONCIERGE_NUMBER).
 *
 * The candidate handle is pseudonymous (AT-<isco>-<ward>-T<tier>); Atlas does
 * the consent-gated bridge to the candidate's real number. For tonight's demo
 * the bridge is manual (Fanette's phone); Phase 2 production wires Twilio
 * Conversations API.
 */
export interface OneOnOneLink {
  url: string;
  /** True when WA_CONCIERGE_NUMBER is set; false when we fall back to the Twilio Sandbox demo number. */
  configured: boolean;
}

const TWILIO_SANDBOX_DEFAULT = "+14155238886";

export function resolveOneOnOne(opts: {
  country: string;
  isco: string;
  candidateHandle: string;
  ward?: string;
  recruiterFirstName?: string;
}): OneOnOneLink {
  const phone = (process.env["WA_CONCIERGE_NUMBER"] ?? TWILIO_SANDBOX_DEFAULT).replace(/[^\d+]/g, "");
  const title = ISCO_TITLES[opts.isco] ?? "candidate";
  const recruiter = opts.recruiterFirstName ? `, I'm ${opts.recruiterFirstName}` : "";
  const wardPart = opts.ward ? ` near ${opts.ward}` : "";
  const text = `Hi Atlas${recruiter} — I'd like to chat with ${opts.candidateHandle}${wardPart} about a ${title} role.`;
  const url = `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(text)}`;
  return { url, configured: phone !== TWILIO_SANDBOX_DEFAULT };
}

export function squadHealth(): { configured: number; missing: string[] } {
  const missing: string[] = [];
  let configured = 0;
  for (const { country, isco } of EXPECTED_GROUPS) {
    const r = resolveSquadInvite(country, isco);
    if (r.configured) configured++;
    else missing.push(envKey(country, isco));
  }
  return { configured, missing };
}
