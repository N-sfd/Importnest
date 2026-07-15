"use client";

import Link from "next/link";
import { DEMO_SEARCH_LABEL, DEMO_SEARCH_QUERY } from "@/lib/search-prompts";

export function HeroSearch() {
  const tryHref = `/search?q=${encodeURIComponent(DEMO_SEARCH_QUERY)}`;

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

      <p className="mt-3 text-sm text-white/70">
        <span className="text-white/50">Try this: </span>
        <Link
          href={tryHref}
          className="font-semibold text-cta underline-offset-2 transition hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {DEMO_SEARCH_LABEL}
        </Link>
      </p>
    </div>
  );
}
