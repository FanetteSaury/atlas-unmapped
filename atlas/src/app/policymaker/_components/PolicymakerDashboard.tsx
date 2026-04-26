"use client";

import { useSearchParams } from "next/navigation";
import { ProgramOfficerView } from "@/app/employer/_components/ProgramOfficerView";
import { SEED_CARDS, type SeedCard } from "@/lib/data/seed-cards";
import { getRealKpis } from "@/lib/data/real-kpis";

export function PolicymakerDashboard() {
  const search = useSearchParams();
  const country = (search.get("country") ?? "GH").toUpperCase();
  const allCards: SeedCard[] = SEED_CARDS[country] ?? [];
  const kpis = getRealKpis(country);

  return <ProgramOfficerView country={country} cards={allCards} kpis={kpis} />;
}
