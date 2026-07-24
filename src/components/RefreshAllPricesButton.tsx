"use client";

import { useState, useTransition } from "react";
import { refreshWatchlistPrices } from "@/app/actions/refresh-prices";

function RefreshIcon({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={spinning ? "animate-spin" : ""}
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

/**
 * Bulk "Refresh all prices" control for the saved page. Pulls fresh data for
 * every approved listing across the user's watchlist in one action, then
 * reloads so SSR freshness and Total Known Cost recompute from the DB.
 */
export function RefreshAllPricesButton({ className = "" }: { className?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onRefresh() {
    setError(null);
    startTransition(async () => {
      const result = await refreshWatchlistPrices();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className={`flex flex-col items-start gap-1 sm:items-end ${className}`}>
      <button
        type="button"
        onClick={onRefresh}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel px-3.5 py-2 text-sm font-semibold text-navy-900 transition hover:border-accent disabled:opacity-60"
      >
        <RefreshIcon spinning={pending} />
        {pending ? "Refreshing…" : "Refresh all prices"}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
