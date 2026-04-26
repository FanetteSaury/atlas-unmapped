"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import type { WardCoord } from "@/lib/data/ward-coords";

interface Props {
  center: { lat: number; lng: number; zoom: number };
  coords: WardCoord[];
  byWard: Record<string, number>;
  maxDensity: number;
  onSelectWard: (ward: string) => void;
}

export function WardMapInner({ center, coords, byWard, maxDensity, onSelectWard }: Props) {
  return (
    <div className="h-[420px] overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={center.zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coords.map((c) => {
          const n = byWard[c.ward] ?? 0;
          const intensity = Math.max(0.15, n / Math.max(1, maxDensity));
          const radius = 10 + intensity * 22;
          return (
            <CircleMarker
              key={c.ward}
              center={[c.lat, c.lng]}
              radius={radius}
              pathOptions={{
                color: "#10b981",
                fillColor: "#10b981",
                fillOpacity: 0.18 + intensity * 0.5,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelectWard(c.ward),
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]}>
                <strong>{c.ward}</strong>: {n} candidate{n === 1 ? "" : "s"}
              </Tooltip>
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold">{c.ward}</div>
                  <div className="text-xs text-zinc-600">
                    {n} candidate{n === 1 ? "" : "s"} match your filters
                  </div>
                  <button
                    onClick={() => onSelectWard(c.ward)}
                    className="mt-1 rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    See list →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
