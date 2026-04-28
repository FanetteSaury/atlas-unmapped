"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { SeedCard } from "@/lib/data/seed-cards";
import { ISCO_TITLES } from "@/lib/data/seed-cards";
import { AUTOMATION_RISK, AI_TIER_PREMIUM, WAGES, FREY_OSBORNE_SOURCE, WDI_SOURCE } from "@/lib/data/wages";
import { DataSourceCitation } from "@/components/DataSourceCitation";
import type { RealKpis } from "@/lib/data/real-kpis";
import { getProfile, SOURCES } from "@/lib/data/policymaker";

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

      {/* Sector employment growth (real WDI data) */}
      <SectorGrowthCard country={country} />

      {/* WBL gender legal score gauge */}
      <WBLCard country={country} />

      {/* WBES skill-gap signal — supply vs demand crossover */}
      <WBESCard country={country} />

      {/* Findex digital readiness */}
      <FindexCard country={country} />

      {/* Wittgenstein 2025-2035 narrative */}
      <WittgensteinCard country={country} />
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

// ---------------------------------------------------------------------------
// NGO/Policymaker-specific cards (brief p.4-5 econometrics)
// ---------------------------------------------------------------------------

function CardShell({
  title,
  subtitle,
  citation,
  children,
}: {
  title: string;
  subtitle?: string;
  citation?: { name: string; url: string; year?: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle && <div className="text-xs text-zinc-500">{subtitle}</div>}
        </div>
        {citation && <DataSourceCitation source={citation} />}
      </div>
      {children}
    </div>
  );
}

function SectorGrowthCard({ country }: { country: string }) {
  const p = getProfile(country);
  const rows = [
    { sector: "Services", share: p.sectorShares.services, growth: p.sectorGrowth.services },
    { sector: "Industry", share: p.sectorShares.industry, growth: p.sectorGrowth.industry },
    { sector: "Agriculture", share: p.sectorShares.agriculture, growth: p.sectorGrowth.agriculture },
  ];
  return (
    <CardShell
      title="Sector employment — share + YoY growth"
      subtitle="Where the labor market is shifting. Compare to your cohort's ISCO distribution above."
      citation={SOURCES.WDI}
    >
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.sector}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{r.sector}</span>
              <span className="text-zinc-500">
                {r.share.toFixed(1)}% of jobs ·{" "}
                <span className={r.growth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                  {r.growth >= 0 ? "+" : ""}
                  {r.growth.toFixed(1)}% YoY
                </span>
              </span>
            </div>
            <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-zinc-900 dark:bg-zinc-50"
                style={{ width: `${Math.min(100, r.share)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-zinc-500">
        💡 Cohort design hint: services growth + structural shift away from agri ⇒ retrain agri-cohorts toward
        services-adjacent ISCO codes.
      </div>
    </CardShell>
  );
}

function WBLCard({ country }: { country: string }) {
  const p = getProfile(country);
  const restrictive = p.wbl < 60;
  return (
    <CardShell
      title="Women, Business and the Law — gender legal score"
      subtitle="Drives Atlas's privacy-default tier per country × gender. Lower score ⇒ stricter T1-aggregate-only default."
      citation={SOURCES.WBL}
    >
      <div className="flex items-center gap-4">
        <div>
          <div className="text-3xl font-semibold tracking-tight">{p.wbl.toFixed(1)}</div>
          <div className="text-[11px] uppercase tracking-wider text-zinc-500">/ 100 (WBL Index)</div>
        </div>
        <div className="flex-1">
          <div className="relative h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className={
                "absolute inset-y-0 left-0 rounded-full " +
                (p.wbl >= 75
                  ? "bg-emerald-500"
                  : p.wbl >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500")
              }
              style={{ width: `${p.wbl}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            Female LFP {p.femaleLfp.toFixed(0)}% (WDI 2023). {restrictive ? "Atlas applies T1-aggregate-only default for female users." : "Atlas applies standard T2 pseudonymous default."}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function WBESCard({ country }: { country: string }) {
  const p = getProfile(country);
  const bars = [
    { label: "Inadequately educated workforce", value: p.wbesSkillGaps.inadequatelyEducatedWorkforce },
    { label: "Hiring difficulty (firms reporting)", value: p.wbesSkillGaps.hiringDifficulty },
    { label: "Unfilled vacancies", value: p.wbesSkillGaps.unfilledVacancies },
  ];
  return (
    <CardShell
      title="Employer skill gaps — WBES firm-level"
      subtitle="The supply-vs-demand crossover. Where Atlas's cohort can clear vacancies."
      citation={SOURCES.WBES}
    >
      <div className="space-y-2">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-xs">
              <span>{b.label}</span>
              <span className="font-semibold">{b.value.toFixed(1)}%</span>
            </div>
            <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
              <div className="absolute inset-y-0 left-0 rounded-full bg-amber-500" style={{ width: `${Math.min(100, b.value * 2)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md bg-emerald-50/60 p-2 text-[11px] text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
        🎯 Atlas wedge: <strong>{p.wbesSkillGaps.unfilledVacancies.toFixed(0)}%</strong> unfilled vacancies × <strong>cohort AI Tier 2+</strong> = your direct placement opportunity.
      </div>
    </CardShell>
  );
}

function FindexCard({ country }: { country: string }) {
  const p = getProfile(country);
  return (
    <CardShell
      title="Digital readiness — Findex 2024 + ITU"
      subtitle="Mobile-money + internet penetration constrain how candidates can be onboarded."
      citation={SOURCES.FINDEX}
    >
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-semibold">{p.findexAccount.toFixed(0)}%</div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">financial account</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{p.mobileMoneyPct.toFixed(0)}%</div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">mobile money</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{p.internetPct.toFixed(0)}%</div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">internet users</div>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-zinc-500">
        ITU Digital Development {SOURCES.ITU.year} for internet penetration · Global Findex {SOURCES.FINDEX.year} for accounts + mobile money.
      </div>
    </CardShell>
  );
}

function WittgensteinCard({ country }: { country: string }) {
  const p = getProfile(country);
  const delta = p.wittgenstein.completion2035 - p.wittgenstein.completion2025;
  return (
    <CardShell
      title="Wittgenstein 2025–2035 — secondary completion trajectory"
      subtitle="Where this region's cohort is heading. Plan upstream now."
      citation={SOURCES.WITTGENSTEIN}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{p.wittgenstein.completion2025.toFixed(1)}%</span>
            <span className="text-zinc-500">→</span>
            <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{p.wittgenstein.completion2035.toFixed(1)}%</span>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-zinc-500">2025 → 2035 · ages 20-24 · both sexes · SSP2 scenario</div>
          <div className="mt-1 text-xs">{p.wittgenstein.trend}</div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">+{delta.toFixed(1)} pp gain in 10 years</div>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-zinc-500">
        Source RDS files staged at <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-white/10">data/lmic/_raw/wittgenstein-*.rds</code> · Phase 2: live trend chart per country/age/sex/edu via pyreadr.
      </div>
    </CardShell>
  );
}

// Reserved for v0.2 — side-by-side GH↔BD comparison panel. Kept for shape reference.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CountryComparePanel({ current }: { current: string }) {
  const a = getProfile("GH");
  const b = getProfile("BD");
  const cur = current.toUpperCase();
  type SourceKey = keyof typeof SOURCES;
  const rows: Array<{ label: string; gh: string; bd: string; cite: (typeof SOURCES)[SourceKey] }> = [
    { label: "GDP per capita (USD)", gh: a.gdpPerCapita.toLocaleString(), bd: b.gdpPerCapita.toLocaleString(), cite: SOURCES.WDI },
    { label: "Youth NEET (%)", gh: a.neet.toFixed(1) + "%", bd: b.neet.toFixed(1) + "%", cite: SOURCES.WDI },
    { label: "Female LFP (%)", gh: a.femaleLfp.toFixed(1) + "%", bd: b.femaleLfp.toFixed(1) + "%", cite: SOURCES.WDI },
    { label: "HCI (0-1)", gh: a.hci.toFixed(2), bd: b.hci.toFixed(2), cite: SOURCES.HCI },
    { label: "WBL gender legal", gh: a.wbl.toFixed(1) + "/100", bd: b.wbl.toFixed(1) + "/100", cite: SOURCES.WBL },
    { label: "Internet users", gh: a.internetPct.toFixed(0) + "%", bd: b.internetPct.toFixed(0) + "%", cite: SOURCES.ITU },
    { label: "Mobile money", gh: a.mobileMoneyPct.toFixed(0) + "%", bd: b.mobileMoneyPct.toFixed(0) + "%", cite: SOURCES.FINDEX },
    { label: "Services share of jobs", gh: a.sectorShares.services.toFixed(1) + "%", bd: b.sectorShares.services.toFixed(1) + "%", cite: SOURCES.WDI },
    { label: "Unfilled vacancies (firms)", gh: a.wbesSkillGaps.unfilledVacancies.toFixed(1) + "%", bd: b.wbesSkillGaps.unfilledVacancies.toFixed(1) + "%", cite: SOURCES.WBES },
    { label: "Sec-edu completion 2035", gh: a.wittgenstein.completion2035.toFixed(1) + "%", bd: b.wittgenstein.completion2035.toFixed(1) + "%", cite: SOURCES.WITTGENSTEIN },
  ];
  return (
    <CardShell
      title="Country comparison — same engine, different contexts"
      subtitle="Brief p.4 country-agnostic requirement. Add a country = add a JSON file."
    >
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-500 dark:bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Indicator</th>
              <th className={"px-3 py-2 text-right font-medium " + (cur === "GH" ? "bg-emerald-50 dark:bg-emerald-500/10" : "")}>🇬🇭 Ghana</th>
              <th className={"px-3 py-2 text-right font-medium " + (cur === "BD" ? "bg-emerald-50 dark:bg-emerald-500/10" : "")}>🇧🇩 Bangladesh</th>
              <th className="px-3 py-2 text-left font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{r.label}</td>
                <td className={"px-3 py-2 text-right tabular-nums " + (cur === "GH" ? "font-semibold" : "")}>{r.gh}</td>
                <td className={"px-3 py-2 text-right tabular-nums " + (cur === "BD" ? "font-semibold" : "")}>{r.bd}</td>
                <td className="px-3 py-2">
                  <DataSourceCitation source={r.cite} inline />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}
