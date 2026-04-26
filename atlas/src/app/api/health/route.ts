// Atlas — prod readiness probe.
//
// Reports whether the two services that judges actually exercise are reachable:
//   1. Anthropic (chat orchestrator) — checks ANTHROPIC_API_KEY is set.
//   2. Vercel KV (storage) — pings llen on a known key.
//
// GET /api/health -> { anthropic: bool, kv: bool, kvCount: number }

import { NextResponse } from "next/server";
import { storageHealth } from "@/lib/storage/cards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const anthropic = !!process.env.ANTHROPIC_API_KEY;
  const kv = await storageHealth("GH");
  return NextResponse.json({
    anthropic,
    kv: kv.reachable,
    kvCountGH: kv.count,
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
  });
}
