// Atlas — country config Zod schema
// Every country JSON in src/lib/config/countries/*.json must satisfy this shape.
// Add a country = drop a JSON file here, no code changes.

import { z } from "zod";

export const PrivacyTier = z.enum(["T1", "T2", "T3"]);
export type PrivacyTier = z.infer<typeof PrivacyTier>;

export const SamplePlayer = z.object({
  name: z.string(),
  domainHint: z.string(),
  iscoSeed: z.string().regex(/^\d{4}$/, "ISCO-08 unit code is 4 digits"),
});

export const CountryConfig = z.object({
  code: z.string().length(2),
  name: z.string(),
  flag: z.string(),
  currency: z.string(),
  currencyCode: z.string().length(3),
  isoAlpha2: z.string().length(2),
  isoAlpha3: z.string().length(3),
  languages: z.array(z.string()).min(1),
  primaryLanguage: z.string(),
  sampleCity: z.string(),
  messagingChannel: z.string(),
  privacyDefaultFemale: PrivacyTier,
  privacyDefaultMale: PrivacyTier,
  samplePlayer: SamplePlayer,
  uiStrings: z.record(z.string(), z.string()),
});
export type CountryConfig = z.infer<typeof CountryConfig>;

import gh from "./countries/gh.json" with { type: "json" };
import bd from "./countries/bd.json" with { type: "json" };

const RAW: Record<string, unknown> = { GH: gh, BD: bd };

const validated: Record<string, CountryConfig> = {};
for (const [code, raw] of Object.entries(RAW)) {
  validated[code] = CountryConfig.parse(raw);
}

export const COUNTRIES = validated;
export const COUNTRY_CODES = Object.keys(validated) as Array<keyof typeof validated>;

export function getCountry(code: string): CountryConfig {
  const c = COUNTRIES[code.toUpperCase()];
  if (!c) throw new Error(`Unknown country code: ${code}`);
  return c;
}
