"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { COUNTRIES, getCountry } from "@/lib/config/schema";
import {
  SEED_CARDS,
  ALL_WARDS,
  ISCOS_BY_COUNTRY,
  ISCO_TITLES,
  type SeedCard,
} from "@/lib/data/seed-cards";
import { WAGES, WDI_SOURCE, AUTOMATION_RISK, FREY_OSBORNE_SOURCE } from "@/lib/data/wages";
import { DataSourceCitation } from "@/components/DataSourceCitation";
import { getRealKpis } from "@/lib/data/real-kpis";
import { resolveOneOnOne } from "@/lib/wa/squad";
import { WardMap } from "./WardMap";
import { ProgramOfficerView } from "./ProgramOfficerView";

type AiTier = 0 | 1 | 2 | 3 | 4;

export function EmployerDashboard() {
  const search = useSearchParams();
  const country = (search.get("country") ?? "GH").toUpperCase();
  const cfg = getCountry(country);
  const wards = ALL_WARDS[country] ?? [];
  const allIscos = ISCOS_BY_COUNTRY[country] ?? [];
  const allCards: SeedCard[] = SEED_CARDS[country] ?? [];

  const [selectedIscos, setSelectedIscos] = useState<string[]>(allIscos);
  const [selectedTiers, setSelectedTiers] = useState<AiTier[]>([1, 2, 3, 4]);
  const [selectedWards, setSelectedWards] = useState<string[]>(wards);
  const [view, setView] = useState<"map" | "list">("map");
  const [recency, setRecency] = useState<"all" | "30d" | "7d">("all");
  const [role, setRole] = useState<"recruiter" | "officer">("recruiter");

  const filtered = useMemo(() => {
    const cutoff =
      recency === "all"
        ? 0
        : Date.now() - (recency === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000;
    return allCards.filter((c) => {
      if (!selectedIscos.includes(c.iscoCode)) return false;
      if (!selectedTiers.includes(c.aiTier)) return false;
      if (!selectedWards.includes(c.ward)) return false;
      if (cutoff && new Date(c.issuedAt).getTime() < cutoff) return false;
      return true;
    });
  }, [allCards, selectedIscos, selectedTiers, selectedWards, recency]);

  const kpis = getRealKpis(country);

  // density per ward
  const byWard = useMemo(() => {
    const m: Record<string, number> = {};
    for (const w of wards) m[w] = 0;
    for (const c of filtered) m[c.ward] = (m[c.ward] ?? 0) + 1;
    return m;
  }, [filtered, wards]);

  const maxDensity = Math.max(1, ...Object.values(byWard));

  const toggle = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="space-y-4">
      {/* Role toggle: dual interface per brief Module 3 */}
      <div className="flex items-center justify-between rounded-full border border-zinc-200 bg-white p-1 text-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="flex">
          <button
            onClick={() => setRole("recruiter")}
            className={
              "rounded-full px-4 py-1.5 font-medium transition " +
              (role === "recruiter"
                ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400")
            }
          >
            👔 Recruiter
          </button>
          <button
            onClick={() => setRole("officer")}
            className={
              "rounded-full px-4 py-1.5 font-medium transition " +
              (role === "officer"
                ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400")
            }
          >
            🏛️ Program Officer
          </button>
        </div>
        <div className="px-3 text-[11px] text-zinc-500">
          Brief Module 3 dual interface — same data, two roles.
        </div>
      </div>

      {role === "officer" ? (
        <ProgramOfficerView country={country} cards={allCards} kpis={kpis} />
      ) : (
        <RecruiterContent
          {...{
            allIscos,
            allCards,
            wards,
            cfg,
            country,
            byWard,
            maxDensity,
            filtered,
            kpis,
            selectedIscos,
            setSelectedIscos,
            selectedTiers,
            setSelectedTiers,
            selectedWards,
            setSelectedWards,
            view,
            setView,
            recency,
            setRecency,
            toggle,
          }}
        />
      )}
    </div>
  );
}

interface RecruiterProps {
  allIscos: string[];
  allCards: SeedCard[];
  wards: string[];
  cfg: ReturnType<typeof getCountry>;
  country: string;
  byWard: Record<string, number>;
  maxDensity: number;
  filtered: SeedCard[];
  kpis: ReturnType<typeof getRealKpis>;
  selectedIscos: string[];
  setSelectedIscos: (v: string[]) => void;
  selectedTiers: AiTier[];
  setSelectedTiers: (v: AiTier[]) => void;
  selectedWards: string[];
  setSelectedWards: (v: string[]) => void;
  view: "map" | "list";
  setView: (v: "map" | "list") => void;
  recency: "all" | "30d" | "7d";
  setRecency: (v: "all" | "30d" | "7d") => void;
  toggle: <T,>(arr: T[], v: T) => T[];
}

function RecruiterContent({
  allIscos,
  allCards,
  wards,
  cfg,
  country,
  byWard,
  maxDensity,
  filtered,
  kpis,
  selectedIscos,
  setSelectedIscos,
  selectedTiers,
  setSelectedTiers,
  selectedWards,
  setSelectedWards,
  view,
  setView,
  recency,
  setRecency,
  toggle,
}: RecruiterProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      {/* Sidebar: filters */}
      <aside className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <FilterSection title="Skill type">
          {allIscos.map((isco) => (
            <Checkbox
              key={isco}
              checked={selectedIscos.includes(isco)}
              onChange={() => setSelectedIscos(toggle(selectedIscos, isco))}
              label={ISCO_TITLES[isco]}
              sub={`ISCO-${isco}`}
            />
          ))}
        </FilterSection>

        <FilterSection title="AI Tier">
          <div className="flex flex-wrap gap-1.5">
            {([0, 1, 2, 3, 4] as AiTier[]).map((t) => {
              const active = selectedTiers.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTiers(toggle(selectedTiers, t))}
                  className={
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition " +
                    (active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200"
                      : "border-zinc-300 text-zinc-500 hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5")
                  }
                  aria-pressed={active}
                >
                  T{t}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Ward">
          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {wards.map((w) => (
              <Checkbox
                key={w}
                checked={selectedWards.includes(w)}
                onChange={() => setSelectedWards(toggle(selectedWards, w))}
                label={w}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Recency">
          <div className="flex gap-1">
            {(["all", "30d", "7d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRecency(r)}
                className={
                  "flex-1 rounded-md border px-2 py-1 text-xs " +
                  (recency === r
                    ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    : "border-zinc-300 hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5")
                }
              >
                {r === "all" ? "All" : r === "30d" ? "30 days" : "7 days"}
              </button>
            ))}
          </div>
        </FilterSection>

        <div className="rounded-md bg-zinc-100 p-2 text-[11px] leading-snug text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
          <div className="font-semibold">Privacy: T2 (pseudonymous)</div>
          Handles + skill tier visible. Direct contact (T3) is opt-in per candidate. WBL-driven defaults adjusted for{" "}
          {cfg.name}.
        </div>

        <button
          onClick={() => {
            setSelectedIscos(allIscos);
            setSelectedTiers([1, 2, 3, 4]);
            setSelectedWards(wards);
            setRecency("all");
          }}
          className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
        >
          Reset filters
        </button>
      </aside>

      {/* Main: KPIs + view switcher + map/list */}
      <section className="space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi
            label="Verified candidates"
            value={filtered.length.toString()}
            sub={`of ${allCards.length} in cohort`}
            citation={null}
          />
          <Kpi
            label="AI Tier 2+ share"
            value={`${Math.round((filtered.filter((c) => c.aiTier >= 2).length / Math.max(1, filtered.length)) * 100)}%`}
            sub="active AI users"
            citation={null}
          />
          <Kpi
            label="Sector growth (services)"
            value={`+${kpis.sectorGrowthPct.toFixed(1)}%`}
            sub="YoY, World Bank WDI"
            citation={WDI_SOURCE}
          />
          <Kpi
            label="Mobile broadband"
            value={`${kpis.mobileBroadbandPct.toFixed(0)}%`}
            sub="ITU 2024"
            citation={{ name: "ITU", url: "https://www.itu.int/en/ITU-D/Statistics/", year: "2024" }}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 text-sm dark:border-white/10 dark:bg-zinc-900">
            <TabButton active={view === "map"} onClick={() => setView("map")}>
              🗺️ Map
            </TabButton>
            <TabButton active={view === "list"} onClick={() => setView("list")}>
              📋 List
            </TabButton>
          </div>
          <div className="text-xs text-zinc-500">
            Showing <strong>{filtered.length}</strong> candidate{filtered.length === 1 ? "" : "s"} ·{" "}
            {selectedWards.length}/{wards.length} wards · {selectedTiers.length}/5 AI Tiers
          </div>
        </div>

        {/* Map view */}
        {view === "map" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Skill density by ward</div>
                <div className="text-xs text-zinc-500">
                  {cfg.flag} {cfg.sampleCity.split(",")[0]} · darker = more candidates matching filters
                </div>
              </div>
              <Legend />
            </div>
            <WardMap
              country={country}
              byWard={byWard}
              maxDensity={maxDensity}
              onSelectWard={(w) => {
                setSelectedWards([w]);
                setView("list");
              }}
            />
            <div className="mt-3 text-[11px] text-zinc-500">
              OpenStreetMap tiles · circle size = candidate count under current filters · click a ward → expand to
              List view filtered to that ward.
            </div>
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">No candidates match your filters.</div>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-white/5">
                {filtered
                  .sort((a, b) => b.matchPct - a.matchPct)
                  .slice(0, 30)
                  .map((c) => (
                    <CandidateRow key={c.handle} card={c} country={country} />
                  ))}
              </ul>
            )}
          </div>
        )}

        {/* Sources strip */}
        <div className="flex flex-wrap gap-2">
          <DataSourceCitation source={WDI_SOURCE} />
          <DataSourceCitation source={FREY_OSBORNE_SOURCE} />
          <DataSourceCitation source={{ name: "ILOSTAT", url: "https://ilostat.ilo.org/data/", year: "2024" }} />
          <DataSourceCitation
            source={{ name: "ITU Digital Development", url: "https://www.itu.int/en/ITU-D/Statistics/", year: "2024" }}
          />
          <DataSourceCitation
            source={{
              name: "Women, Business and the Law",
              url: "https://wbl.worldbank.org/en/wbl-data",
              year: "2024",
            }}
          />
        </div>
      </section>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{title}</div>
      {children}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 rounded border-zinc-300 accent-emerald-600"
      />
      <span className="flex-1">{label}</span>
      {sub && <span className="text-[10px] text-zinc-400">{sub}</span>}
    </label>
  );
}

function Kpi({
  label,
  value,
  sub,
  citation,
}: {
  label: string;
  value: string;
  sub: string;
  citation: { name: string; url: string; year?: string } | null;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-900">
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] text-zinc-500">
        {sub}
        {citation && <DataSourceCitation source={citation} inline />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-4 py-1.5 text-sm font-medium transition " +
        (active
          ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5")
      }
    >
      {children}
    </button>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
      <span>Low</span>
      <div className="flex h-2.5 w-24 overflow-hidden rounded-full">
        <div className="flex-1" style={{ background: "rgba(16,185,129,0.12)" }} />
        <div className="flex-1" style={{ background: "rgba(16,185,129,0.28)" }} />
        <div className="flex-1" style={{ background: "rgba(16,185,129,0.44)" }} />
        <div className="flex-1" style={{ background: "rgba(16,185,129,0.6)" }} />
      </div>
      <span>High</span>
    </div>
  );
}

function CandidateRow({ card, country }: { card: SeedCard; country: string }) {
  const wage = WAGES[country]?.[card.iscoCode];
  const auto = AUTOMATION_RISK[card.iscoCode];
  const oneOnOne = resolveOneOnOne({
    country,
    isco: card.iscoCode,
    candidateHandle: card.handle,
    ward: card.ward,
  });
  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300">{card.handle}</span>
          <span
            className={
              "rounded-full border px-2 py-0.5 text-[10px] font-medium " +
              (card.aiTier >= 3
                ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/40"
                : card.aiTier === 2
                  ? "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/40"
                  : "border-zinc-300 bg-zinc-50 text-zinc-700 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10")
            }
          >
            🤖 AI Tier {card.aiTier}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-700 dark:bg-white/10 dark:text-zinc-300">
            {card.atlasClass}
          </span>
        </div>
        <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          <strong>{card.iscoTitle}</strong>{" "}
          <span className="text-xs text-zinc-500">· ISCO-{card.iscoCode}</span>
        </div>
        <div className="mt-0.5 text-xs text-zinc-500">
          📍 {card.ward} · {card.distanceKm} km · {card.matchPct}% match · issued{" "}
          {new Date(card.issuedAt).toLocaleDateString()}
          {wage && (
            <>
              {" "}
              · wage {wage.currency}
              {wage.formalMedian.toLocaleString()}–{wage.informalMedian.toLocaleString()}/mo
            </>
          )}
          {auto && <> · automation {Math.round(auto.lmicAdjusted * 100)}%</>}
        </div>
      </div>
      <div className="flex shrink-0">
        <a
          href={oneOnOne.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          💬 Contact on WhatsApp
        </a>
      </div>
    </li>
  );
}
