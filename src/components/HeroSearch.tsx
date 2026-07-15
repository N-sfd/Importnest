"use client";

import Link from "next/link";
import {
  DEMO_SEARCH_LABEL,
  DEMO_SEARCH_QUERY,
  EXAMPLE_SEARCHES,
} from "@/lib/search-prompts";

export function HeroSearch() {
  const tryHref = `/search?q=${encodeURIComponent(DEMO_SEARCH_QUERY)}`;
  const pills = [
    { label: DEMO_SEARCH_LABEL, href: tryHref },
    ...EXAMPLE_SEARCHES.slice(0, 3).map((e) => ({
      label: e.label,
      href: `/search?q=${encodeURIComponent(e.query)}`,
    })),
  ];

  return (
    <div className="relative mt-7">
      <form
        action="/search"
        className="flex items-center overflow-hidden rounded-full bg-white shadow-lg focus-within:ring-2 focus-within:ring-ring"
      >
        <label htmlFor="home-q" className="sr-only">
          What are you shopping for?
        </label>
        <input
          id="home-q"
          name="q"
          type="search"
          placeholder="Describe what you need — product, budget, or timing"
          className="min-w-0 flex-1 px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted sm:px-5"
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-cta m-1.5 h-11 min-w-[5.25rem] shrink-0 px-5 text-sm leading-none sm:min-w-[5.75rem] sm:px-6"
        >
          Search
        </button>
      </form>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Try this</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {pills.map((pill) => (
            <Link
              key={pill.href + pill.label}
              href={pill.href}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:border-cta hover:bg-cta/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
