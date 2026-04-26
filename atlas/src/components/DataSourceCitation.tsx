import Link from "next/link";

export interface CitationSource {
  name: string;
  url: string;
  year?: number | string;
}

export function DataSourceCitation({
  source,
  inline = false,
}: {
  source: CitationSource;
  inline?: boolean;
}) {
  const label = `${source.name}${source.year ? ` ${source.year}` : ""}`;
  if (inline) {
    return (
      <Link
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-1 align-baseline text-[10px] text-zinc-500 underline decoration-dotted underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-50"
        title={`Source: ${label}`}
      >
        ⓘ {label}
      </Link>
    );
  }
  return (
    <Link
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
    >
      <span aria-hidden>📊</span>
      Source: {label}
    </Link>
  );
}
