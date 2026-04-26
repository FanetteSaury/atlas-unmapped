// Atlas — employer-posted projects.
//
// POST /api/projects -> create a project, compute match count from KV cards,
// return the project + a chat.whatsapp.com group invite link.
// GET  /api/projects?country=GH -> list recent projects for that country.

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateProjectSlug,
  getProjectsByCountry,
  saveProject,
  type StoredProject,
} from "@/lib/storage/projects";
import { getCardsByCountry } from "@/lib/storage/cards";
import { resolveSquadInvite } from "@/lib/wa/squad";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PostSchema = z.object({
  country: z.string().min(2).max(4),
  iscoCode: z.string().min(1).max(8),
  title: z.string().min(2).max(120),
  ward: z.string().min(1).max(80),
  dayNeeded: z.string().min(1).max(80),
  headcount: z.number().int().min(1).max(50).default(1),
  notes: z.string().max(500).optional(),
  employerHandle: z.string().max(80).optional(),
});

export async function POST(req: Request): Promise<Response> {
  let body;
  try {
    body = PostSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "bad_request", detail: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }

  const country = body.country.toUpperCase();
  const cards = await getCardsByCountry(country, 200);
  const matchedCount = cards.filter(
    (c) =>
      c.iscoCode === body.iscoCode &&
      (!c.ward || c.ward === body.ward) &&
      c.aiTier >= 1,
  ).length;

  const project: StoredProject = {
    slug: generateProjectSlug(),
    country,
    iscoCode: body.iscoCode,
    title: body.title,
    ward: body.ward,
    dayNeeded: body.dayNeeded,
    headcount: body.headcount,
    notes: body.notes,
    employerHandle: body.employerHandle,
    matchedCount,
    createdAt: new Date().toISOString(),
  };
  await saveProject(project);

  const invite = resolveSquadInvite(country, body.iscoCode);

  return NextResponse.json({
    project,
    invite: { url: invite.url, name: invite.groupName, configured: invite.configured },
  });
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const country = (url.searchParams.get("country") ?? "GH").toUpperCase();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
  const projects = await getProjectsByCountry(country, limit);
  return NextResponse.json({ country, count: projects.length, projects });
}
