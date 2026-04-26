// Atlas — employer-posted projects (per-project ad-hoc WA rooms).
//
// Model pivot: instead of permanent guild groups (1 per ISCO×country),
// Atlas matches around *projects*. An employer posts a brief — title, ISCO,
// ward, day needed — and Atlas:
//   1. matches eligible candidates from Atlas Cards in KV
//   2. returns a chat.whatsapp.com group invite (one per country for the demo;
//      production: Twilio Conversations API creates a fresh room per project)
//   3. (production) WhatsApps each matched candidate the project + join link
//
// This file = the storage layer. /api/projects = the HTTP boundary. The
// employer dashboard renders the dialog + matched-count + group link.

import { kv } from "@vercel/kv";

const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const COUNTRY_LIST_CAP = 200;

const slugKey = (slug: string) => `atlas:project:${slug}`;
const countryKey = (country: string) => `atlas:projects:${country.toUpperCase()}`;

export interface StoredProject {
  slug: string;
  country: string;
  iscoCode: string;
  title: string;
  ward: string;
  dayNeeded: string; // ISO date or free-form ("Friday Nov 28")
  headcount: number;
  notes?: string;
  employerHandle?: string; // pseudonymous, e.g. "Karim's Phone Shop"
  matchedCount: number;
  createdAt: string; // ISO-8601
}

const SLUG_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

export function generateProjectSlug(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  return s;
}

export async function saveProject(p: StoredProject): Promise<void> {
  try {
    const country = p.country.toUpperCase();
    await kv.set(slugKey(p.slug), p, { ex: TTL_SECONDS });
    await kv.lpush(countryKey(country), p.slug);
    await kv.ltrim(countryKey(country), 0, COUNTRY_LIST_CAP - 1);
    await kv.expire(countryKey(country), TTL_SECONDS);
  } catch (err) {
    console.error("[storage/projects] saveProject failed (best-effort)", err);
  }
}

export async function getProjectsByCountry(
  country: string,
  limit = 50,
): Promise<StoredProject[]> {
  try {
    const slugs = await kv.lrange<string>(countryKey(country), 0, limit - 1);
    if (!slugs.length) return [];
    const projects = await Promise.all(slugs.map((s) => kv.get<StoredProject>(slugKey(s))));
    return projects.filter((p): p is StoredProject => p !== null);
  } catch (err) {
    console.error("[storage/projects] getProjectsByCountry failed", err);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<StoredProject | null> {
  try {
    return (await kv.get<StoredProject>(slugKey(slug))) ?? null;
  } catch {
    return null;
  }
}
