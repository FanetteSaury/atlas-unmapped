"use client";

// Atlas — World-Bank-styled top bar.
//
// Replaces the lightweight sticky header on /employer + /policymaker with a
// taller, more official-feeling banner that matches WB visual identity:
//   - navy   #002244  (titles, primary text)
//   - blue   #006EB5  (links, accent)
//   - light  #F0F4F8  (banner background)
//
// Audiences:
//   - "employer"   -> "Recruiter Workspace"
//   - "policymaker" -> "Country Programmes"
//
// programLabel surfaces the secondary line ("Cohort Insights",
// "Squad finder", etc.).

import Link from "next/link";

interface Props {
  audience: "employer" | "policymaker";
  programLabel: string;
}

const COPY = {
  employer: {
    eyebrow: "Atlas · Recruiter Workspace",
    title: "Hire verified talent in your ward",
    description: "SME hiring tool with WhatsApp-native matching",
  },
  policymaker: {
    eyebrow: "Atlas · Country Programmes",
    title: "Cohort Insights for programme design",
    description: "Aggregate signals — NGO and government use only",
  },
} as const;

export function TopBar({ audience, programLabel }: Props) {
  const copy = COPY[audience];
  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight text-[#002244]">
          <span className="text-xl">🌍</span> Atlas
        </Link>
        <div className="hidden text-xs text-zinc-500 sm:block">
          {copy.eyebrow}
        </div>
      </div>
      <div className="bg-[#F0F4F8]">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="text-[11px] uppercase tracking-widest text-[#006EB5]">{programLabel}</div>
          <div className="mt-1 text-lg font-semibold leading-tight text-[#002244]">{copy.title}</div>
          <div className="mt-0.5 text-xs text-zinc-600">{copy.description}</div>
        </div>
      </div>
    </div>
  );
}
