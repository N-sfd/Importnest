"use client";

import { useState } from "react";
import {
  removeAlertAction,
  setPriceAlertAction,
  toggleAlertActiveAction,
} from "@/lib/saved-actions";
import { formatFreshness } from "@/lib/freshness";

export type PriceAlertModuleProps = {
  productId: string;
  redirectTo: string;
  /** Prefill from real current TKC (e.g. 5% below). */
  suggestedAlert: string;
  currentLowestPrice: number | null;
  lastCheckedMinutesAgo?: number | null;
  alert?: { threshold: string | null; isActive: boolean } | null;
  /** Compact card footer vs fuller compare/watchlist panel. */
  compact?: boolean;
};

/**
 * Idealo-style price alert control.
 * Uses only real Total Known Cost figures — never invents a target.
 */
export function PriceAlertModule({
  productId,
  redirectTo,
  suggestedAlert,
  currentLowestPrice,
  lastCheckedMinutesAgo,
  alert = null,
  compact = false,
}: PriceAlertModuleProps) {
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <div className="product-card-action-wide">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-9 w-full items-center justify-center rounded-full border border-border bg-white px-3 py-2 text-sm font-semibold text-navy-900 hover:border-navy-800"
        >
          {open ? "Close alert" : alert ? "Edit price alert" : "Set price alert"}
        </button>
        {open ? (
          <div className="mt-2 rounded-xl border border-border bg-surface p-3 text-left">
            <AlertFormBody
              productId={productId}
              redirectTo={redirectTo}
              suggestedAlert={suggestedAlert}
              currentLowestPrice={currentLowestPrice}
              lastCheckedMinutesAgo={lastCheckedMinutesAgo}
              alert={alert}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
      <p className="text-sm font-bold text-navy-900">Set price alert</p>
      <AlertFormBody
        productId={productId}
        redirectTo={redirectTo}
        suggestedAlert={suggestedAlert}
        currentLowestPrice={currentLowestPrice}
        lastCheckedMinutesAgo={lastCheckedMinutesAgo}
        alert={alert}
      />
    </div>
  );
}

function AlertFormBody({
  productId,
  redirectTo,
  suggestedAlert,
  currentLowestPrice,
  lastCheckedMinutesAgo,
  alert,
}: Omit<PriceAlertModuleProps, "compact">) {
  return (
    <div className="space-y-2">
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <div>
          <dt className="text-muted">Target price</dt>
          <dd className="font-semibold tabular-nums text-navy-900">
            ${(alert?.threshold ? Number(alert.threshold) : Number(suggestedAlert)).toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Current Total Known Cost</dt>
          <dd className="font-semibold tabular-nums text-navy-900">
            {currentLowestPrice != null ? `$${currentLowestPrice.toFixed(2)}` : "Not provided"}
          </dd>
        </div>
        {lastCheckedMinutesAgo !== undefined ? (
          <div className="col-span-2">
            <dt className="text-muted">Last checked</dt>
            <dd className="font-medium text-navy-900">{formatFreshness(lastCheckedMinutesAgo)}</dd>
          </div>
        ) : null}
        {alert ? (
          <div className="col-span-2">
            <dt className="text-muted">Alert status</dt>
            <dd className="font-semibold text-navy-900">
              {alert.isActive ? "Active" : "Paused"}
              {alert.threshold ? ` · Notify below $${alert.threshold}` : null}
            </dd>
          </div>
        ) : null}
      </dl>

      <form
        action={setPriceAlertAction.bind(null, productId, redirectTo)}
        className="flex flex-wrap items-end gap-2"
      >
        <label className="text-xs">
          <span className="font-semibold text-muted">Target price $</span>
          <input
            name="threshold"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={alert?.threshold ?? suggestedAlert}
            className="mt-1 block min-h-9 w-28 rounded-md border border-border bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
        <button
          type="submit"
          className="min-h-9 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
        >
          {alert ? "Save alert" : "Set price alert"}
        </button>
      </form>

      {alert ? (
        <div className="flex flex-wrap gap-2">
          <form action={toggleAlertActiveAction.bind(null, productId, "price-drop", redirectTo)}>
            <button
              type="submit"
              className="min-h-9 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
            >
              {alert.isActive ? "Pause" : "Resume"}
            </button>
          </form>
          <form action={removeAlertAction.bind(null, productId, "price-drop", redirectTo)}>
            <button
              type="submit"
              className="min-h-9 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
            >
              Remove
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
