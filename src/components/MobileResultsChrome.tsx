"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { ResultsPageParams } from "@/components/SearchResultsLayout";
import { RESULTS_SORT_OPTIONS, type ResultsSort } from "@/lib/search-results";

/**
 * Mobile sticky Filter + Sort bar, with full-height filter drawer.
 */
export function MobileResultsChrome({
  children,
  activeCount = 0,
  resultCount,
  params,
  sort,
}: {
  children: ReactNode;
  activeCount?: number;
  resultCount: number;
  params: ResultsPageParams;
  sort: ResultsSort;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  useFocusTrap(filtersOpen, panelRef, closeFilters);

  useEffect(() => {
    if (!filtersOpen && !sortOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [filtersOpen, sortOpen]);

  function onSort(value: string) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "sort") next.set(k, v);
    }
    next.set("sort", value);
    setSortOpen(false);
    router.push(`/search/results?${next.toString()}`);
  }

  return (
    <div className="lg:hidden">
      <div className="mobile-results-bar">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="mobile-results-bar-btn"
        >
          Filters
          {activeCount > 0 ? (
            <span className="ml-1 rounded-full bg-navy-900 px-1.5 py-0.5 text-[10px] text-white">
              {activeCount}
            </span>
          ) : null}
        </button>
        <button type="button" onClick={() => setSortOpen(true)} className="mobile-results-bar-btn">
          Sort
        </button>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 id={titleId} className="text-base font-bold text-navy-900">
              Filters
            </h2>
            <button
              type="button"
              onClick={closeFilters}
              className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold"
            >
              Close
            </button>
          </div>
          <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="flex-1 overflow-y-auto px-4 py-4">
            {children}
          </div>
        </div>
      ) : null}

      {sortOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-navy-900/40"
            aria-label="Close sort"
            onClick={() => setSortOpen(false)}
          />
          <div className="relative rounded-t-2xl border border-border bg-white p-4 shadow-xl">
            <p className="text-sm font-bold text-navy-900">Sort by</p>
            <ul className="mt-3 space-y-1">
              {RESULTS_SORT_OPTIONS.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => onSort(o.value)}
                    className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${
                      sort === o.value ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-surface"
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-center text-xs text-muted">
              {resultCount} result{resultCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
