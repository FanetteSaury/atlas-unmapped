import { Suspense } from "react";
import Link from "next/link";
import { CountryToggle } from "@/components/CountryToggle";
import { HonestLimitsBanner } from "@/components/HonestLimitsBanner";
import { TopBar } from "@/components/TopBar";
import { PolicymakerDashboard } from "./_components/PolicymakerDashboard";

export const metadata = {
  title: "Atlas — Policymaker Dashboard",
  description: "Country-level signals for cohort planning. NGO + government use only.",
};

export default function PolicymakerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Suspense fallback={<div className="h-32 animate-pulse bg-zinc-100" />}>
        <TopBar audience="policymaker" programLabel="Cohort Insights" />
      </Suspense>

      <div className="border-b border-zinc-200 bg-zinc-100 px-6 py-2.5 text-[13px] text-zinc-600">
        <Link href="/" className="text-[#006EB5] hover:underline">Atlas</Link>
        <span className="mx-2 text-zinc-300">/</span>
        <Link href="/policymaker" className="text-[#006EB5] hover:underline">Country Programmes</Link>
        <span className="mx-2 text-zinc-300">/</span>
        <span>Cohort Dashboard</span>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#002244]">Cohort signals for programme design</h1>
            <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
              Aggregate, anonymized signals from the Atlas talent layer — built for NGOs and government programme officers
              designing youth-employment cohorts. <strong>No individual candidate handles.</strong> No outreach features.
              All data cited at source (ILOSTAT · WDI · Frey-Osborne · WBL · ITU · HCI).
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Suspense fallback={<div className="h-7 w-48 animate-pulse rounded-full bg-zinc-200" />}>
              <CountryToggle />
            </Suspense>
            <HonestLimitsBanner compact />
          </div>
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
