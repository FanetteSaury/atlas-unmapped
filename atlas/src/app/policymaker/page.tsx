import { Suspense } from "react";
import Link from "next/link";
import { CountryToggle } from "@/components/CountryToggle";
import { HonestLimitsBanner } from "@/components/HonestLimitsBanner";
import { PolicymakerDashboard } from "./_components/PolicymakerDashboard";

export const metadata = {
  title: "Atlas — Policymaker Dashboard",
  description: "Country-level signals for cohort planning. NGO + government use only.",
};

export default function PolicymakerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-black/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className="text-xl">🌍</span> Atlas
            </Link>
            <span className="hidden text-xs uppercase tracking-widest text-zinc-500 sm:inline">· Policymaker</span>
          </div>
          <Suspense fallback={<div className="h-7 w-48 animate-pulse rounded-full bg-zinc-200" />}>
            <CountryToggle />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cohort signals for program design</h1>
            <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
              Aggregate, anonymized signals from the Atlas talent layer — built for NGOs and government program officers
              designing youth-employment cohorts. <strong>No individual candidate handles.</strong> No outreach features.
              All data cited at source (ILOSTAT · WDI · Frey-Osborne · WBL · ITU · HCI).
            </p>
          </div>
          <HonestLimitsBanner compact />
        </div>

        <div className="mb-4 rounded-lg border border-amber-200/60 bg-amber-50/40 px-4 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          🔒 <strong>Restricted view</strong> — production deploy gates this surface behind verified NGO + government
          credentials (WB Country Office SSO planned). Demo: open access for the hackathon.
          <span className="ml-2">Looking to hire? <Link href="/employer" className="underline decoration-dotted hover:text-amber-950 dark:hover:text-amber-100">Switch to the SME / Recruiter view →</Link></span>
        </div>

        <Suspense fallback={<div className="p-12 text-center text-zinc-500">Loading aggregates…</div>}>
          <PolicymakerDashboard />
        </Suspense>
      </main>
    </div>
  );
}
