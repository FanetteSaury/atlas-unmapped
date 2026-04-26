"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { COUNTRIES, COUNTRY_CODES } from "@/lib/config/schema";

export function CountryToggle() {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = (search.get("country") ?? "GH").toUpperCase();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-1 py-1 text-xs dark:border-white/15 dark:bg-zinc-900">
      {COUNTRY_CODES.map((code) => {
        const active = code === current;
        const c = COUNTRIES[code];
        const params = new URLSearchParams(search.toString());
        params.set("country", code);
        return (
          <Link
            key={code}
            href={`${pathname}?${params.toString()}`}
            className={
              "rounded-full px-3 py-1 transition " +
              (active
                ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10")
            }
            aria-pressed={active}
          >
            <span className="mr-1">{c.flag}</span>
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}
