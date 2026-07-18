"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { Freshness } from "@/components/Freshness";
import { productImageFor, productThumbClass } from "@/lib/images";
import { formatPriceChange, type PriceChangeTone } from "@/lib/price-change";
import {
  removeAlertConfirmMessage,
  removeProductConfirmMessage,
  type WatchlistItem,
} from "@/lib/saved-data";
import {
  deleteWatchlistItemAction,
  removeAlertAction,
  setPriceAlertAction,
  toggleAlertActiveAction,
} from "@/lib/saved-actions";

const CHANGE_TONE_CLASS: Record<PriceChangeTone, string> = {
  down: "text-emerald-800",
  up: "text-amber-900",
  none: "text-muted",
};

/** Native confirm before a destructive form submission; cancels the submit when the shopper backs out. */
function confirmBeforeSubmit(message: string) {
  return (event: MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(message)) event.preventDefault();
  };
}

const statusStyle: Record<string, string> = {
  watching: "bg-accent/15 text-accent",
  triggered: "bg-cta/15 text-cta",
  paused: "bg-surface text-muted ring-1 ring-border",
  none: "bg-surface text-muted ring-1 ring-border",
};

const statusLabel: Record<string, string> = {
  watching: "Watching",
  triggered: "Price drop",
  paused: "Paused",
  none: "No alert",
};

function PriceSparkline({ points }: { points: { day: string; total: number }[] }) {
  if (points.length < 2) return null;

  const width = 120;
  const height = 36;
  const pad = 2;
  const totals = points.map((p) => p.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (width - pad * 2);
    const y = height - pad - ((p.total - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const dropped = totals[totals.length - 1]! <= totals[0]!;
  const stroke = dropped ? "#166534" : "#9a3412";
  const trend = dropped ? "trending down" : "trending up";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      role="img"
      aria-label={`Price history sparkline, ${trend}, from $${totals[0]!.toFixed(2)} to $${totals[totals.length - 1]!.toFixed(2)}`}
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords.join(" ")}
      />
    </svg>
  );
}

const NON_PRICE_ALERT_LABEL: Record<string, string> = {
  "back-in-stock": "Back in stock alert",
  "any-change": "Any price change alert",
};

export function WatchlistProductCard({ item }: { item: WatchlistItem }) {
  const [editing, setEditing] = useState(false);
  const redirectTo = "/saved";
  const change = formatPriceChange(item.priceChange);
  const alertType = item.alertType ?? "price-drop";
  const isPriceDropAlert = alertType === "price-drop";
  const imageSrc = productImageFor(item.canonicalProductId);
  const defaultThreshold =
    item.targetPrice != null
      ? item.targetPrice.toFixed(2)
      : item.currentPrice != null
        ? Math.max(1, Math.floor(item.currentPrice * 0.95)).toFixed(2)
        : "";

  return (
    <article className="panel offer-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
        <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
          <Link
            href={`/compare/${item.canonicalProductId}`}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-white sm:h-24 sm:w-24"
          >
            <Image
              src={imageSrc}
              alt={item.productName}
              fill
              className={productThumbClass(imageSrc)}
              sizes="96px"
            />
          </Link>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {item.brandName}
                </p>
                <Link
                  href={`/compare/${item.canonicalProductId}`}
                  className="mt-0.5 block text-base font-bold leading-snug text-navy-900 hover:text-link"
                >
                  {item.productName}
                </Link>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[item.status]}`}
              >
                {statusLabel[item.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Current total
                </p>
                <p className="mt-0.5 text-lg font-extrabold tabular-nums text-navy-900">
                  {item.currentPrice != null ? `$${item.currentPrice.toFixed(2)}` : "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Target price
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-navy-900">
                  {item.targetPrice != null ? `$${item.targetPrice.toFixed(2)}` : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Offers
                </p>
                <p className="mt-0.5 text-sm font-semibold text-navy-900">
                  {item.offerCount} {item.offerCount === 1 ? "offer" : "offers"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Price change
                </p>
                <p
                  className={`mt-0.5 text-sm font-semibold tabular-nums ${
                    change ? CHANGE_TONE_CLASS[change.tone] : "text-muted"
                  }`}
                >
                  {change?.text ?? "No history"}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Last checked
                </p>
                <p className="mt-0.5 text-sm font-medium text-navy-900">
                  <Freshness minutesAgo={item.lastCheckedMinutesAgo} />
                </p>
              </div>
              {item.priceHistory.length >= 2 ? (
                <div className="col-span-2 flex items-end sm:col-span-2 lg:justify-end">
                  <PriceSparkline points={item.priceHistory} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col justify-between gap-3 border-t border-border pt-3 lg:w-44 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/compare/${item.canonicalProductId}`}
                className="btn-cta flex-1 px-3 py-2 text-center text-sm"
              >
                View comparison
              </Link>
              <AddToCompareButton productId={item.canonicalProductId} productName={item.productName} />
            </div>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              aria-expanded={editing}
              aria-controls={`alert-edit-${item.canonicalProductId}`}
              className="rounded-full border border-border bg-panel px-3 py-2 text-sm font-semibold text-navy-900 hover:border-navy-800"
            >
              {editing ? "Close" : "Edit alert"}
            </button>
            {item.alertId && item.alertType ? (
              <form
                action={toggleAlertActiveAction.bind(
                  null,
                  item.canonicalProductId,
                  item.alertType,
                  redirectTo,
                )}
              >
                <button
                  type="submit"
                  className="w-full rounded-full border border-border bg-panel px-3 py-2 text-sm font-semibold text-navy-900 hover:border-navy-800"
                >
                  {item.status === "paused" ? "Resume" : "Pause"}
                </button>
              </form>
            ) : null}
            <form action={deleteWatchlistItemAction.bind(null, item.canonicalProductId, redirectTo)}>
              <button
                type="submit"
                onClick={confirmBeforeSubmit(removeProductConfirmMessage(item.productName))}
                className="w-full rounded-full border border-border px-3 py-2 text-sm font-semibold text-muted hover:border-red-300 hover:text-red-700"
              >
                Remove
              </button>
            </form>
          </div>
        </div>
      </div>

      {editing ? (
        <div
          id={`alert-edit-${item.canonicalProductId}`}
          className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3"
        >
          {isPriceDropAlert ? (
            <>
              <p className="text-sm font-semibold text-navy-900">Edit price alert</p>
              <p className="mt-0.5 text-xs text-muted">
                Notify when the best known total cost falls to or below your target.
              </p>
              <form
                action={setPriceAlertAction.bind(null, item.canonicalProductId, redirectTo)}
                className="mt-3 flex flex-wrap items-end gap-2"
              >
                <div>
                  <label htmlFor={`threshold-${item.canonicalProductId}`} className="sr-only">
                    Target price
                  </label>
                  <div className="flex items-center rounded-md border border-border bg-white">
                    <span className="pl-3 text-sm text-muted">$</span>
                    <input
                      id={`threshold-${item.canonicalProductId}`}
                      name="threshold"
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      defaultValue={defaultThreshold}
                      className="w-28 bg-transparent px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-cta px-4 py-2 text-sm">
                  Save alert
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-navy-900">
                {NON_PRICE_ALERT_LABEL[alertType] ?? "Alert"}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                This alert has no numeric target — pause or remove it below.
              </p>
            </>
          )}
          {item.alertId && item.alertType ? (
            <form
              action={removeAlertAction.bind(null, item.canonicalProductId, alertType, redirectTo)}
              className="mt-2"
            >
              <button
                type="submit"
                onClick={confirmBeforeSubmit(removeAlertConfirmMessage(item.productName))}
                className="rounded-full border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted hover:border-navy-800"
              >
                Remove alert
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
