"use client";

import { useState, useTransition } from "react";
import { refreshProductPrices } from "@/app/actions/refresh-prices";

export function RefreshPricesButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
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
      // Full reload so SSR freshness + ranking labels recompute from updated DB.
      window.location.reload();
    });
  }

  return (
    <div className={`flex flex-col items-stretch gap-1 sm:items-end ${className}`}>
      <button
        type="button"
        onClick={onRefresh}
        disabled={pending}
        className="btn-cta shrink-0 px-3.5 py-2 text-sm disabled:opacity-60"
      >
        {pending ? "Refreshing…" : "Refresh live prices"}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
