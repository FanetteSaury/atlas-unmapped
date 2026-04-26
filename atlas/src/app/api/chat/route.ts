// Atlas — browser /player chat endpoint.
//
// Stateless wrapper around the channel-agnostic `runChapter()` orchestrator:
// the client carries the full PlayerContext + current chapter in/out so we
// don't need KV for the web channel. WhatsApp keeps using KV via /api/wa/webhook.
//
// POST { ctx, chapter, body }  ->  { ctx, chapter (next), replies, finished }

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  runChapter,
  CHAPTER_IDS,
  type ChapterId,
  type PlayerContext,
} from "@/lib/orchestrator";

const ChapterIdEnum = z.enum(CHAPTER_IDS);

const ContextSchema = z.object({
  handle: z.string().min(1).max(64),
  country: z.string().max(4),
  iscoSeed: z.string().optional(),
  aiTierProvisional: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  companion: z.string().optional(),
  scores: z.record(z.string(), z.number()),
  channel: z.literal("web"),
});

const BodySchema = z.object({
  ctx: ContextSchema,
  chapter: ChapterIdEnum,
  body: z.string().max(4000),
});

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  let parsed;
  try {
    const json = await req.json();
    parsed = BodySchema.parse(json);
  } catch (err) {
    return NextResponse.json(
      { error: "bad_request", detail: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }

  const ctx: PlayerContext = parsed.ctx;
  const result = await runChapter(
    { chapter: parsed.chapter, body: parsed.body },
    ctx,
  );

  return NextResponse.json({
    ctx: result.ctx,
    chapter: result.nextChapter as ChapterId,
    replies: result.replies,
    finished: !!result.finished,
  });
}
