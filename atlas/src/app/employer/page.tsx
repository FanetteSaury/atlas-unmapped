import { Suspense } from "react";
import Link from "next/link";
import { CountryToggle } from "@/components/CountryToggle";
import { HonestLimitsBanner } from "@/components/HonestLimitsBanner";
import { TopBar } from "@/components/TopBar";
import { EmployerDashboard } from "./_components/EmployerDashboard";

export const metadata = {
  title: "Atlas — Employer Dashboard",
};

export default function EmployerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Suspense fallback={<div className="h-32 animate-pulse bg-zinc-100" />}>
        <TopBar audience="employer" programLabel="Squad finder" />
      </Suspense>

      <div className="border-b border-zinc-200 bg-zinc-100 px-6 py-2.5 text-[13px] text-zinc-600">
        <Link href="/" className="text-[#006EB5] hover:underline">Atlas</Link>
        <span className="mx-2 text-zinc-300">/</span>
        <Link href="/employer" className="text-[#006EB5] hover:underline">Recruiter View</Link>
        <span className="mx-2 text-zinc-300">/</span>
        <span>Squad finder</span>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#002244]">Find verified candidates near you</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Pseudonymous skill-density map by ward. Filter by ISCO occupation, AI Tier, and distance. Tap{" "}
              <span className="font-medium">Join Squad</span> to enter a WhatsApp group with the candidate&apos;s
              cohort — Atlas exits the conversation, you talk directly.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Suspense fallback={<div className="h-7 w-48 animate-pulse rounded-full bg-zinc-200" />}>
              <CountryToggle />
            </Suspense>
            <HonestLimitsBanner compact />
          </div>
        </div>

        <Suspense fallback={<div className="p-12 text-center text-zinc-500">Loading dashboard…</div>}>
          <EmployerDashboard />
        </Suspense>
      </main>
    </div>
  );
}
