import { Suspense } from "react";
import Link from "next/link";
import { CountryToggle } from "@/components/CountryToggle";
import { HonestLimitsBanner } from "@/components/HonestLimitsBanner";
import { PlayerQuest } from "./_components/PlayerQuest";

export const metadata = {
  title: "Atlas Quest — Player",
};

export default function PlayerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-black/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className="text-xl">🌍</span> Atlas
            </Link>
            <span className="hidden text-xs uppercase tracking-widest text-zinc-500 sm:inline">· Quest</span>
          </div>
          <Suspense fallback={<div className="h-7 w-44 animate-pulse rounded-full bg-zinc-200" />}>
            <CountryToggle />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4 md:py-6">
        <div className="mb-3 flex items-center justify-between gap-2 text-xs">
          <div className="text-zinc-600 dark:text-zinc-400">
            12 minutes · 8 chapters · ends with your Atlas Card.
          </div>
          <HonestLimitsBanner compact />
        </div>

        <Suspense fallback={<div className="p-12 text-center text-zinc-500">Loading quest…</div>}>
          <PlayerQuest />
        </Suspense>
      </main>
    </div>
  );
}
