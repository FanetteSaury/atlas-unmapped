// Atlas — recent live Atlas Cards by country.
//
// Reads Vercel KV via `getCardsByCountry`. Best-effort: returns [] if KV
// unreachable or empty. Dashboards merge with seed cards client-side.

import { NextResponse } from "next/server";
import { getCardsByCountry } from "@/lib/storage/cards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const country = (url.searchParams.get("country") ?? "GH").toUpperCase();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  const cards = await getCardsByCountry(country, limit);
  return NextResponse.json({ country, count: cards.length, cards });
}
