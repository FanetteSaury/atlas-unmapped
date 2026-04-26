// Atlas — Atlas Card persistence in Vercel KV (Upstash Redis).
//
// Storage decisions locked 2026-04-26 ~9h00 (PRD.md §B2B + TASKS.md #13):
//   Q1: Vercel KV (no Postgres / Supabase for hackathon)
//   Q2: Open share link (`/c/<slug>`) — no token gating in v1
//   Q3: Channel-native handle (phone hash WA, web session id browser)
//   Q4: Pseudonymous only (handle + scores + ISCO + ward, NO raw PII)
//   Q5: 30-day TTL on the card record + the country list entry
//   Q6: Live aggregation (lrange + Array.filter at request time)
//
// Phase 2 paths: Supabase migration when auth + multi-tenancy needed,
// signed HMAC share tokens, RGPD right-to-delete API, nightly snapshot.
//
// Key shape:
//   atlas:card:<slug>           -> StoredCard JSON (TTL 30d)
//   atlas:cards:<country>       -> sorted list of slugs (LPUSH on save, LTRIM cap 1000, TTL 30d)
//
// All operations are best-effort: KV unavailable -> log + return null/empty,
// callers fall back to seed-cards. Never throws on the hot path.

import { kv } from "@vercel/kv";

const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const COUNTRY_LIST_CAP = 1000; // hard cap per-country to prevent runaway growth

const slugKey = (slug: string) => `atlas:card:${slug}`;
const countryKey = (country: string) => `atlas:cards:${country.toUpperCase()}`;

/**
 * The persisted shape — pseudonymous, no raw PII.
 * Q4 contract: handle + scores + ISCO + ward only.
 */
export interface StoredCard {
  /** URL-safe slug, e.g. "ak3z9c2t1f". Generated at save time. */
  slug: string;
  /** Pseudonymous handle: `AT-<isco>-<ward>-T<tier>` (or `web:<sessionId>` / `wa:<phoneHash>` provenance). */
  handle: string;
  country: string;
  iscoCode: string;
  iscoTitle: string;
  iscoConfidence: number;
  atlasClass: string;
  aiTier: 0 | 1 | 2 | 3 | 4;
  ward?: string;
  /** All accumulated chapter scores (forge depth, oracle calibration, etc.). */
  scores: Record<string, number | string>;
  /** O*NET task matches if the orchestrator captured them. */
  oNetTasks?: string[];
  /** Player's stated future skill gap (Phase 2 = surface in /policymaker). */
  skillGap?: string;
  channel: "wa" | "web";
  issuedAt: string; // ISO-8601
}

const SLUG_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/** URL-safe slug, ~52 bits of entropy (10 chars × log2(36)). */
export function generateSlug(): string {
  let s = "";
  const bytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < bytes.length; i++) {
    s += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return s;
}

export async function saveCard(card: StoredCard): Promise<void> {
  try {
    const country = card.country.toUpperCase();
    await kv.set(slugKey(card.slug), card, { ex: TTL_SECONDS });
    await kv.lpush(countryKey(country), card.slug);
    await kv.ltrim(countryKey(country), 0, COUNTRY_LIST_CAP - 1);
    await kv.expire(countryKey(country), TTL_SECONDS);
  } catch (err) {
    console.error("[storage/cards] saveCard failed (best-effort)", err);
  }
}

export async function getCardBySlug(slug: string): Promise<StoredCard | null> {
  try {
    const card = await kv.get<StoredCard>(slugKey(slug));
    return card ?? null;
  } catch (err) {
    console.error("[storage/cards] getCardBySlug failed", err);
    return null;
  }
}

export async function getCardsByCountry(
  country: string,
  limit = 200,
): Promise<StoredCard[]> {
  try {
    const slugs = await kv.lrange<string>(countryKey(country), 0, limit - 1);
    if (!slugs.length) return [];
    const cards = await Promise.all(slugs.map((s) => kv.get<StoredCard>(slugKey(s))));
    return cards.filter((c): c is StoredCard => c !== null);
  } catch (err) {
    console.error("[storage/cards] getCardsByCountry failed", err);
    return [];
  }
}

/** Health-check helper: is KV reachable + has any cards?. */
export async function storageHealth(country: string): Promise<{ reachable: boolean; count: number }> {
  try {
    const len = await kv.llen(countryKey(country));
    return { reachable: true, count: typeof len === "number" ? len : 0 };
  } catch {
    return { reachable: false, count: 0 };
  }
}
