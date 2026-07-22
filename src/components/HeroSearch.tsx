"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EXAMPLE_SEARCHES } from "@/lib/search-prompts";
import { intentPillsFromQuery } from "@/lib/search-pills";

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.5l1.4 5.2L18.5 9 13.4 10.3 12 15.5l-1.4-5.2L5.5 9l5.1-1.3L12 2.5z" />
      <path d="M18.5 14.5l.7 2.5 2.5.7-2.5.7-.7 2.5-.7-2.5-2.5-.7 2.5-.7.7-2.5z" opacity=".85" />
    </svg>
  );
}

export function HeroSearch({
  className = "",
  maxExamples,
}: {
  className?: string;
  /** Caps the "Try this" example chips — omit to show all. */
  maxExamples?: number;
}) {
  const [query, setQuery] = useState("");
  const pills = useMemo(() => intentPillsFromQuery(query), [query]);
  const examples = EXAMPLE_SEARCHES.slice(0, maxExamples ?? EXAMPLE_SEARCHES.length).map((e) => ({
    label: e.label,
    href: `/search?q=${encodeURIComponent(e.query)}`,
  }));

  return (
    <div className={`relative ${className || "mt-5"}`}>
      <div className="ai-search-banner ai-search-banner-hero">
        <SparkleIcon className="ai-search-banner-icon" />
        <span>
          AI-friendly search — describe what you need in plain English, not just model numbers.
        </span>
      </div>

      <form
        action="/search"
        className="flex items-center overflow-hidden rounded-full border border-border bg-white shadow-[0_6px_18px_rgb(16_35_63/0.08)] focus-within:ring-2 focus-within:ring-ring"
      >
        <label htmlFor="home-q" className="sr-only">
          What are you shopping for?
        </label>
        <span className="pl-4 text-accent" aria-hidden="true">
          <SparkleIcon />
        </span>
        <input
          id="home-q"
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product, model, UPC — or describe what you need"
          className="min-w-0 flex-1 px-3 py-3.5 text-sm text-foreground outline-none placeholder:text-muted sm:px-4"
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-cta m-1.5 h-11 min-w-[5.25rem] shrink-0 px-5 text-sm leading-none sm:min-w-[5.75rem] sm:px-6"
        >
          Compare offers
        </button>
      </form>

      {pills.length > 0 ? (
        <ul className="search-intent-pills mt-2" aria-label="Detected filters">
          {pills.map((pill) => (
            <li key={pill.id}>
              <span className="search-intent-pill">{pill.label}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Try this</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {examples.map((pill) => (
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
