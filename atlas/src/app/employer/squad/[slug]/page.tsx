// Atlas — fake WhatsApp group chat preview for a posted project.
//
// Real WA group creation is not possible via Twilio Sandbox (Meta restriction).
// For the demo video we ship a high-fidelity simulator: a chat-bubble UI with
// pre-scripted realistic message exchange so judges see the moment the room
// "comes alive". This is disclosed in HonestLimits.

import Link from "next/link";
import { getProjectBySlug } from "@/lib/storage/projects";
import { ISCO_TITLES, SEED_CARDS, type SeedCard } from "@/lib/data/seed-cards";
import { GroupChatSimulator } from "./_components/GroupChatSimulator";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SquadGroupPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
          <div className="text-4xl">🔎</div>
          <h1 className="mt-3 text-lg font-semibold">Project not found</h1>
          <p className="mt-1 text-sm text-zinc-500">This squad room may have expired (30 day TTL).</p>
          <Link href="/employer" className="mt-4 inline-block rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const allCards: SeedCard[] = SEED_CARDS[project.country] ?? [];
  const matched = allCards
    .filter((c) => c.iscoCode === project.iscoCode && c.aiTier >= 1)
    .slice(0, 4);
  const iscoTitle = ISCO_TITLES[project.iscoCode] ?? "Worker";

  return (
    <GroupChatSimulator
      project={{
        slug: project.slug,
        title: project.title,
        ward: project.ward,
        dayNeeded: project.dayNeeded,
        iscoTitle,
        employerHandle: project.employerHandle ?? "Atlas Employer",
        notes: project.notes,
      }}
      candidates={matched.map((c) => ({
        handle: c.handle,
        ward: c.ward,
        aiTier: c.aiTier,
      }))}
    />
  );
}
