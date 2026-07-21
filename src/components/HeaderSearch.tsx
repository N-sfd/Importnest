"use client";

import { useMemo, useState } from "react";
import { intentPillsFromQuery } from "@/lib/search-pills";

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
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

/**
 * Header search with conversational AI affordance and live intent pills.
 */
export function HeaderSearch() {
  const [query, setQuery] = useState("");
  const pills = useMemo(() => intentPillsFromQuery(query), [query]);

  return (
    <div className="header-search">
      <form action="/search" className="search-shell search-shell-ai">
        <label htmlFor="header-q" className="sr-only">
          Search Importnest with natural language
        </label>
        <span className="search-ai-icon" aria-hidden="true">
          <SparkleIcon />
        </span>
        <input
          id="header-q"
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you need — product, budget, delivery…"
          className="search-input"
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-cta m-1.5 h-9 min-w-[5.25rem] shrink-0 px-5 text-sm leading-none sm:h-10 sm:min-w-[5.75rem] sm:px-6"
        >
          Search
        </button>
      </form>
      {pills.length > 0 ? (
        <ul className="search-intent-pills" aria-label="Detected filters">
          {pills.map((pill) => (
            <li key={pill.id}>
              <span className="search-intent-pill">{pill.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
