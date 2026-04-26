"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProgramOfficerView } from "@/app/employer/_components/ProgramOfficerView";
import { SEED_CARDS, type SeedCard } from "@/lib/data/seed-cards";
import { getRealKpis } from "@/lib/data/real-kpis";
import type { StoredCard } from "@/lib/storage/cards";

const WARDS_BY_COUNTRY: Record<string, string[]> = {
  GH: ["Madina", "East Legon", "Nima", "Osu", "Achimota", "Tema West"],
  BD: ["Mirpur", "Dhanmondi", "Gulshan", "Mohammadpur", "Uttara", "Tejgaon"],
};

function liveToSeed(c: StoredCard, idx: number): SeedCard {
  const wards = WARDS_BY_COUNTRY[c.country.toUpperCase()] ?? ["—"];
  return {
    handle: `AT-${c.iscoCode}-${(c.ward ?? wards[idx % wards.length]).slice(0, 3).toLowerCase()}-T${c.aiTier}-LIVE`,
    country: c.country.toUpperCase(),
    iscoCode: c.iscoCode,
    iscoTitle: c.iscoTitle,
    atlasClass: c.atlasClass,
    aiTier: c.aiTier,
    ward: c.ward ?? wards[idx % wards.length],
    matchPct: 80,
    distanceKm: 5,
    issuedAt: c.issuedAt,
  };
}

export function PolicymakerDashboard() {
  const search = useSearchParams();
  const country = (search.get("country") ?? "GH").toUpperCase();
  const seeds: SeedCard[] = SEED_CARDS[country] ?? [];
  const kpis = getRealKpis(country);
  const [live, setLive] = useState<SeedCard[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cards/recent?country=${country}&limit=50`)
      .then((r) => r.json())
      .then((data: { cards: StoredCard[] }) => {
        if (cancelled) return;
        setLive((data.cards ?? []).map(liveToSeed));
      })
      .catch(() => { /* best-effort */ });
    return () => { cancelled = true; };
  }, [country]);

  const allCards = [...live, ...seeds];

  return <ProgramOfficerView country={country} cards={allCards} kpis={kpis} />;
}
