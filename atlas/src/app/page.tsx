// Atlas — landing page (3-card layout, brief-compliance table, stat row)
// Server Component. Reads country configs at build time. No client-side state.

import Link from "next/link";
import { COUNTRIES } from "@/lib/config/schema";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900 dark:from-zinc-950 dark:to-black dark:text-zinc-50">
      <BrandBar />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <Hero />
        <StatRow />
        <Entries />
        <BriefTable />
      </main>

      <Footer />
    </div>
  );
}

function BrandBar() {
  return (
    <header className="border-b border-zinc-200/60 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-black/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌍</span>
          <span className="text-lg font-semibold tracking-tight">Atlas</span>
        </div>
        <div className="hidden text-xs uppercase tracking-widest text-zinc-500 sm:block">
          Hack-Nation 2026 · UNMAPPED · World Bank Youth Summit
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="grid gap-12 py-12 lg:grid-cols-2 lg:items-center">
      <div>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Closing the distance between real skills and real opportunity in the age of AI.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          A WhatsApp-native conversational game that measures STEP-equivalent skills,
          AI fluency (Tier 0–4), and assigns each unmapped young person their first
          ISCO-08 occupation code — in 12 minutes, on a phone they already own.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-white/15">
            Real LMIC data
          </span>
          <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-white/15">
            ISCO-08 + O*NET + STEP
          </span>
          <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-white/15">
            Country-agnostic
          </span>
          <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-white/15">
            Honest about limits
          </span>
        </div>
      </div>

      <PhoneMock />
    </section>
  );
}

function PhoneMock() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
      <div className="rounded-2xl bg-[#0b141a] p-4 text-sm text-zinc-100">
        <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
          <span>12:34 · 5G</span>
          <span>Atlas · WhatsApp-style</span>
        </div>
        <div className="space-y-2">
          <Bubble bot>🌍 Atlas Quest — Sage here.</Bubble>
          <Bubble bot>
            In 12 min I&apos;ll tell you 3 things no one has:
            <br />
            💰 your worth
            <br />
            🎭 your class
            <br />
            🤖 your AI Tier
          </Bubble>
          <Bubble user>START</Bubble>
        </div>
      </div>
    </div>
  );
}

function Bubble({ children, bot, user }: { children: React.ReactNode; bot?: boolean; user?: boolean }) {
  if (user) {
    return (
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-[#005c4b] px-3 py-2 text-right text-zinc-50">
        {children}
      </div>
    );
  }
  return (
    <div className="mr-auto max-w-[80%] rounded-2xl rounded-tl-sm bg-[#202c33] px-3 py-2 text-zinc-100" data-bot={bot}>
      {children}
    </div>
  );
}

function StatRow() {
  const stats = [
    { num: "600M", label: "unmapped young people" },
    { num: "75", label: "LIC + LMIC countries" },
    { num: "12 min", label: "to first credential" },
    { num: "6", label: "real econometric signals" },
  ];
  return (
    <section className="grid grid-cols-2 gap-3 border-y border-zinc-200 py-8 sm:grid-cols-4 dark:border-white/10">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-3xl font-semibold tracking-tight">{s.num}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">{s.label}</div>
        </div>
      ))}
    </section>
  );
}

function Entries() {
  const cards = [
    {
      href: "/player",
      icon: "📱",
      title: "Player",
      desc: "Walk a player through the Atlas Quest in WhatsApp-style chat. Inventory · Origin · Forge · Mind · Storm · Oracle · Future · Tribe.",
      cta: "Start a quest",
    },
    {
      href: "/employer",
      icon: "💼",
      title: "Employer",
      desc: "Pseudonymous skill-density heatmap by ward. Verified-employer-only intros — consent-gated.",
      cta: "Open dashboard",
    },
    {
      href: "/policymaker",
      icon: "🏛️",
      title: "Policymaker",
      desc: "Aggregate skill supply, ILOSTAT wages, WDI sector growth, Frey-Osborne risk, Wittgenstein 2030. Country-swap demo.",
      cta: "Open dashboard",
    },
  ];
  return (
    <section className="py-12">
      <h2 className="text-2xl font-semibold tracking-tight">Three views — one engine</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        The same configurable backend powers all three surfaces. Add a country = add a JSON file. No code changes.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/30"
          >
            <div className="mb-3 text-3xl">{c.icon}</div>
            <div className="text-lg font-semibold">{c.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{c.desc}</p>
            <div className="mt-4 text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-50">
              {c.cta} →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BriefTable() {
  const rows: [string, string][] = [
    ["Infrastructure, not product", "3 surfaces (Player / Employer / Policymaker) on configurable backend"],
    ["Build ≥ 2 of 3 modules", "Module 1 (Skills Signal Engine) + Module 2 (AI Readiness Lens) + Module 3 (Opportunity Matching)"],
    ["Country-agnostic", `JSON config: ${Object.values(COUNTRIES).map(c => c.flag + " " + c.name).join(" · ")}`],
    ["Real econometric data", "ILOSTAT · WDI · Frey-Osborne · WBES · WBL · Findex · Wittgenstein · STEP · ISCO-08 · O*NET · HCI"],
    ["≥ 2 signals visible to user", "Wage · Demand growth · Automation risk · AI premium — surfaced on Atlas Card"],
    ["Specific constrained user", "Voice-ready, low-bandwidth, shared-device, navigator-assisted"],
    ["Honest about limits", "Hackathon-grade rubrics, not psychometrically validated. Disclosed."],
  ];
  return (
    <section className="py-12">
      <h2 className="text-2xl font-semibold tracking-tight">Brief compliance</h2>
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-500 dark:bg-white/5">
            <tr>
              <th className="px-4 py-3 font-medium">Requirement</th>
              <th className="px-4 py-3 font-medium">Atlas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
            {rows.map(([req, atlas]) => (
              <tr key={req} className="bg-white dark:bg-zinc-900">
                <td className="px-4 py-3 font-medium">{req}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{atlas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs text-zinc-500 dark:border-white/10 dark:bg-black">
      <div>Atlas v0 · Hack-Nation 2026 Track 5 · UNMAPPED · powered by The World Bank Youth Summit</div>
      <div className="mt-1">
        All measurements directional, calibrated against Ghana STEP 2013 anchors. Production calibration requires 1000+ players × 6 months.
      </div>
    </footer>
  );
}
