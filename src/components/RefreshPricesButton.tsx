"use client";

import { useState, useTransition } from "react";
import { refreshProductPrices } from "@/app/actions/refresh-prices";

function RefreshIcon({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
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

export function RefreshPricesButton({
  productId,
  className = "",
  compact = false,
  emphasize = false,
  onRefreshed,
}: {
  productId: string;
  className?: string;
  /** Small inline icon button — fits next to a freshness timestamp on product cards. */
  compact?: boolean;
  /** Pill-styled instead of a plain text link — for the most severe "outdated" tier, where a prompt to act should stand out more. */
  emphasize?: boolean;
  /** Fired after a real, successful refresh — never on failure or a faked update. */
  onRefreshed?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onRefresh() {
    setError(null);
    startTransition(async () => {
      const result = await refreshProductPrices(productId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onRefreshed?.();
      // Full reload so SSR freshness + ranking labels recompute from updated DB.
      window.location.reload();
    });
  }

  if (compact) {
    const emphasizedClass =
      "rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-amber-900 hover:bg-amber-200 no-underline hover:no-underline";
    return (
      <button
        type="button"
        onClick={onRefresh}
        disabled={pending}
        aria-label={pending ? "Refreshing prices" : "Refresh prices"}
        title="Refresh prices"
        className={`inline-flex items-center gap-1 font-medium disabled:opacity-60 disabled:no-underline ${
          emphasize ? emphasizedClass : "text-link hover:underline"
        } ${className}`}
      >
        <RefreshIcon spinning={pending} />
        {pending ? "Refreshing…" : "Refresh"}
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-stretch gap-1 sm:items-end ${className}`}>
      <button
        type="button"
        onClick={onRefresh}
        disabled={pending}
        className="btn-cta shrink-0 px-3.5 py-2 text-sm disabled:opacity-60"
      >
        {pending ? "Refreshing…" : "Refresh price"}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
