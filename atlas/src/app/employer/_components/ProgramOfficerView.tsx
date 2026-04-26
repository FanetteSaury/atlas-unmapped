"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { SeedCard } from "@/lib/data/seed-cards";
import { ISCO_TITLES } from "@/lib/data/seed-cards";
import { AUTOMATION_RISK, AI_TIER_PREMIUM, WAGES, FREY_OSBORNE_SOURCE, WDI_SOURCE } from "@/lib/data/wages";
import { DataSourceCitation } from "@/components/DataSourceCitation";
import type { RealKpis } from "@/lib/data/real-kpis";

// Hardcoded HCI 2024 values (latest World Bank Human Capital Index release).
// Phase 1 ingest replaces these with live REST fetch.
const HCI_2024: Record<string, number> = { GH: 0.45, BD: 0.46 };
const HCI_SOURCE = {
  name: "World Bank Human Capital Index",
  url: "https://www.worldbank.org/en/publication/human-capital",
  year: "2024",
};

interface Props {
  country: string;
  cards: SeedCard[];
  kpis: RealKpis;
}

export function ProgramOfficerView({ country, cards, kpis }: Props) {
  // AI Tier distribution
  const tierDist = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const c of cards) counts[c.aiTier]++;
    return counts.map((n, t) => ({
      tier: `T${t}`,
      count: n,
      label: t === 0 ? "Unfamiliar" : t === 1 ? "Curious" : t === 2 ? "Active" : t === 3 ? "Power" : "Builder",
      premiumPct: Math.round((AI_TIER_PREMIUM[t] ?? 0) * 100),
    }));
  }, [cards]);

  // Frey-Osborne automation risk per ISCO occupation in this cohort
  const automationByIsco = useMemo(() => {
    const isos = Array.from(new Set(cards.map((c) => c.iscoCode)));
    return isos
      .map((isco) => {
        const auto = AUTOMATION_RISK[isco];
        const wage = WAGES[country]?.[isco];
        return {
          isco,
          title: ISCO_TITLES[isco] ?? isco,
          freyOsborne: auto ? Math.round(auto.freyOsborneScore * 100) : 0,
          lmicAdjusted: auto ? Math.round(auto.lmicAdjusted * 100) : 0,
          wage: wage?.formalMedian ?? 0,
          currency: wage?.currency ?? "",
        };
      })
      .sort((a, b) => b.lmicAdjusted - a.lmicAdjusted);
  }, [cards, country]);

  const tierColors = ["#94a3b8", "#a3a3a3", "#fbbf24", "#10b981", "#3b82f6"];

  const aggregateAvgTier =
    cards.length > 0 ? cards.reduce((s, c) => s + c.aiTier, 0) / cards.length : 0;

  return (
    <div className="space-y-4">
      {/* Aggregate KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AggKpi
          label="Cohort size"
          value={cards.length.toString()}
          sub={`Atlas Cards issued (${kpis.year})`}
        />
        <AggKpi
          label="Mean AI Tier"
          value={aggregateAvgTier.toFixed(2)}
          sub={`of 4 (Atlas-original metric)`}
          accent="emerald"
        />
        <AggKpi
          label="Human Capital Index"
          value={(HCI_2024[country] ?? 0).toFixed(2)}
          sub="learning-adjusted years"
          citation={HCI_SOURCE}
        />
        <AggKpi
          label="Female labor force"
          value={`${kpis.femaleLaborForcePct.toFixed(0)}%`}
          sub="age 15+, modeled ILO"
          citation={WDI_SOURCE}
        />
      </div>

      {/* AI Tier distribution */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">AI Tier distribution</div>
            <div className="text-xs text-zinc-500">
              The wedge: Atlas measures AI fluency in 5 tiers, mapped to wage premium per ILOSTAT 2024 wages.
            </div>
          </div>
          <div className="text-[11px] text-zinc-500">
            Atlas-original measurement · not in any public dataset
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierDist} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <XAxis dataKey="tier" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  background: "#0b141a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e5e7eb",
                }}
                formatter={(v, _n, p) => {
                  const payload = (p as { payload: { label: string; premiumPct: number } }).payload;
                  return [`${v} candidates`, `${payload.label} (+${payload.premiumPct}% wage)`];
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {tierDist.map((_, i) => (
                  <Cell key={i} fill={tierColors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-zinc-500">
          {tierDist.map((d, i) => (
            <span key={d.tier} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm" style={{ background: tierColors[i] }} />
              {d.tier} {d.label} · +{d.premiumPct}%
            </span>
          ))}
        </div>
      </div>

      {/* Frey-Osborne displacement risk */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold">Automation displacement risk by occupation</div>
            <div className="text-xs text-zinc-500">
              Frey-Osborne 2013 (US-baseline, dotted) vs ILO/WB LMIC reappraisal (solid) — task composition differs in
              LMIC contexts.
            </div>
          </div>
          <DataSourceCitation source={FREY_OSBORNE_SOURCE} />
        </div>
        <div className="space-y-2">
          {automationByIsco.map((row) => (
            <div key={row.isco}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">
                  {row.title}{" "}
                  <span className="text-[10px] text-zinc-500">ISCO-{row.isco}</span>
                </span>
                <span className="text-zinc-500">
                  US {row.freyOsborne}% · LMIC <strong className="text-zinc-900 dark:text-zinc-50">{row.lmicAdjusted}%</strong>
                </span>
              </div>
              <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${row.freyOsborne}%`, background: "rgba(244,63,94,0.25)" }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${row.lmicAdjusted}%`, background: "rgba(244,63,94,0.85)" }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-md bg-amber-50/60 p-2 text-[11px] text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          ⚠️ Frey-Osborne CSV used: community mirror of the Oxford Martin paper appendix. Disclosed per brief p.5.
        </div>
      </div>

      {/* Wittgenstein 2030 placeholder */}
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center text-xs text-zinc-500 dark:border-white/10 dark:bg-zinc-900/50">
        📈 <strong>Wittgenstein Centre 2025–2035 cohort projections</strong> — RDS files staged at{" "}
        <code className="rounded bg-white/60 px-1 py-0.5 text-[10px] dark:bg-white/10">
          atlas/data/lmic/_raw/wittgenstein-*.rds
        </code>
        . Phase 1 ingest reads via <code>pyreadr</code> → live trend chart per country/age/sex/edu.
      </div>
    </div>
  );
}

function AggKpi({
  label,
  value,
  sub,
  citation,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  citation?: { name: string; url: string; year?: string };
  accent?: "emerald";
}) {
  return (
    <div
      className={
        "rounded-2xl border p-3 " +
        (accent === "emerald"
          ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-500/40 dark:bg-emerald-500/10"
          : "border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900")
      }
    >
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] text-zinc-500">
        {sub}
        {citation && <DataSourceCitation source={citation} inline />}
      </div>
    </div>
  );
}
