"use client";

import Link from "next/link";
import { EXAMPLE_SEARCHES } from "@/lib/search-prompts";

export function HeroSearch({ className = "" }: { className?: string }) {
  const pills = EXAMPLE_SEARCHES.map((e) => ({
    label: e.label,
    href: `/search?q=${encodeURIComponent(e.query)}`,
  }));

  return (
    <div className={`relative ${className || "mt-5"}`}>
      <form
        action="/search"
        className="flex items-center overflow-hidden rounded-full border border-border bg-white shadow-[0_6px_18px_rgb(16_35_63/0.08)] focus-within:ring-2 focus-within:ring-ring"
      >
        <label htmlFor="home-q" className="sr-only">
          What are you shopping for?
        </label>
        <input
          id="home-q"
          name="q"
          type="search"
          placeholder="Search by product, model, UPC — or describe what you need"
          className="min-w-0 flex-1 px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted sm:px-5"
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-cta m-1.5 h-11 min-w-[5.25rem] shrink-0 px-5 text-sm leading-none sm:min-w-[5.75rem] sm:px-6"
        >
          Compare offers
        </button>
      </form>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Try this</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {pills.map((pill) => (
            <Link
              key={pill.href + pill.label}
              href={pill.href}
              className="rounded-full border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:border-accent hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
