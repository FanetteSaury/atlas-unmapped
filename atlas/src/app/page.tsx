// Atlas — landing page (3-card layout, brief-compliance table, stat row)
// Server Component. Reads country configs at build time. No client-side state.

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900 dark:from-zinc-950 dark:to-black dark:text-zinc-50">
      <BrandBar />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <Hero />
        <StatRow />
        <Entries />
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
          A chat-native conversational game that measures STEP-equivalent skills,
          AI fluency (Tier 0–4), and assigns each unmapped young person their first
          ISCO-08 occupation code — in 12 minutes, on a phone they already own. Then
          Atlas matches them with employers posting projects on WhatsApp, so a verified
          credential turns into real work in the channel they already use.
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
    <div className="flex justify-center">
      <div className="relative w-[300px] flex-none rounded-[2.75rem] border border-zinc-300 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-black">
        {/* notch */}
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-black"></div>
        <div className="overflow-hidden rounded-[2.25rem] bg-[#0b141a]">
          {/* status bar */}
          <div className="flex items-center justify-between bg-black px-5 pb-1.5 pt-3 text-[11px] font-medium text-zinc-300">
            <span>12:34 · 5G</span>
            <span className="text-zinc-500">Atlas Quest</span>
          </div>
          {/* chat header */}
          <div className="flex items-center gap-2 border-b border-white/5 bg-[#111b21] px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-base">🌍</div>
            <div>
              <div className="text-[13px] font-semibold text-zinc-100">Atlas Quest</div>
              <div className="text-[10px] text-zinc-400">online · Sage is your guide</div>
            </div>
          </div>
          {/* messages */}
          <div className="h-[420px] space-y-2 overflow-y-auto p-3 text-sm">
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
          {/* composer */}
          <div className="flex items-center gap-2 border-t border-white/5 bg-[#111b21] px-2 py-2">
            <div className="flex-1 rounded-full bg-[#202c33] px-3 py-1.5 text-[12px] text-zinc-500">Type a message…</div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white" aria-label="Send">➤</button>
          </div>
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
      href: "/player?country=GH",
      icon: "📱",
      title: "Player",
      desc: "Take the Atlas Quest — 12 minutes of chat, end with your AI Tier + your Atlas Card.",
      cta: "Start a quest",
      audience: "Free for youth",
    },
    {
      href: "/employer?country=GH",
      icon: "💼",
      title: "SME / Employer",
      desc: "Find verified candidates near you. Pseudonymous skill-density map, filter by ISCO + AI Tier + ward, 1:1 WhatsApp intro.",
      cta: "Open recruiter view",
      audience: "For SMEs + recruiters",
    },
    {
      href: "/policymaker?country=GH",
      icon: "🏛️",
      title: "NGO / Policymaker",
      desc: "Cohort signals for program design. Aggregate AI Tier distribution, Frey-Osborne risk, HCI, Wittgenstein 2030. No individual handles.",
      cta: "Open program officer view",
      audience: "For NGOs + governments",
    },
  ];
  return (
    <section className="py-12">
      <h2 className="text-2xl font-semibold tracking-tight">Three audiences — one engine</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        Same configurable backend, three role-distinct surfaces. SMEs see candidates; NGOs see cohort signals; youth play the quest.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/30"
          >
            <div className="mb-3 text-3xl">{c.icon}</div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-lg font-semibold">{c.title}</div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">{c.audience}</span>
            </div>
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
