"use client";

import { useEffect, useState } from "react";
import { CITY_CENTER, WARD_COORDS } from "@/lib/data/ward-coords";

interface Props {
  country: string;
  byWard: Record<string, number>;
  maxDensity: number;
  onSelectWard: (ward: string) => void;
}

export function WardMap({ country, byWard, maxDensity, onSelectWard }: Props) {
  const [Map, setMap] = useState<typeof import("./WardMapInner") | null>(null);

  useEffect(() => {
    let mounted = true;
    import("./WardMapInner").then((m) => {
      if (mounted) setMap(m);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!Map) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-zinc-950">
        <div className="text-sm text-zinc-500">Loading map…</div>
      </div>
    );
  }

  const InnerMap = Map.WardMapInner;
  const coords = WARD_COORDS[country.toUpperCase()] ?? [];
  const center = CITY_CENTER[country.toUpperCase()] ?? { lat: 0, lng: 0, zoom: 11 };

  return (
    <InnerMap
      center={center}
      coords={coords}
      byWard={byWard}
      maxDensity={maxDensity}
      onSelectWard={onSelectWard}
    />
  );
}
