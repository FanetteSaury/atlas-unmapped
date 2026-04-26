import { Suspense } from "react";
import Link from "next/link";
import { CountryToggle } from "@/components/CountryToggle";
import { HonestLimitsBanner } from "@/components/HonestLimitsBanner";
import { EmployerDashboard } from "./_components/EmployerDashboard";

export const metadata = {
  title: "Atlas — Employer Dashboard",
};

export default function EmployerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-black/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className="text-xl">🌍</span> Atlas
            </Link>
            <span className="hidden text-xs uppercase tracking-widest text-zinc-500 sm:inline">· Employer</span>
          </div>
          <Suspense fallback={<div className="h-7 w-48 animate-pulse rounded-full bg-zinc-200" />}>
            <CountryToggle />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Find verified candidates near you</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Pseudonymous skill-density map by ward. Filter by ISCO occupation, AI Tier, and distance. Tap{" "}
              <span className="font-medium">Join Squad</span> to enter a WhatsApp group with the candidate&apos;s
              cohort — Atlas exits the conversation, you talk directly.
            </p>
          </div>
          <HonestLimitsBanner compact />
        </div>

        <Suspense fallback={<div className="p-12 text-center text-zinc-500">Loading dashboard…</div>}>
          <EmployerDashboard />
        </Suspense>
      </main>
    </div>
  );
}
