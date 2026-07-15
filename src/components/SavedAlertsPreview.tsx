import Image from "next/image";
import Link from "next/link";
import { productImageFor, productThumbClass } from "@/lib/images";
import type { WatchlistItem } from "@/lib/saved-data";

/** Compact signed-in-only snapshot of saved products and active price alerts. */
export function SavedAlertsPreview({ items }: { items: WatchlistItem[] }) {
  const savedCount = items.filter((i) => i.savedProductId != null).length;
  const activeAlertCount = items.filter(
    (i) => i.alertId != null && i.status !== "paused",
  ).length;
  const recent = items[0] ?? null;

  return (
    <section className="mt-6 panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Your watchlist</h2>
        <Link href="/saved" className="text-sm font-semibold text-link hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <p className="text-sm text-muted">
          <span className="text-lg font-extrabold text-navy-900">{savedCount}</span>{" "}
          {savedCount === 1 ? "saved product" : "saved products"}
        </p>
        <p className="text-sm text-muted">
          <span className="text-lg font-extrabold text-navy-900">{activeAlertCount}</span>{" "}
          {activeAlertCount === 1 ? "active alert" : "active alerts"}
        </p>
      </div>

      {recent ? (
        <Link
          href={`/compare/${recent.canonicalProductId}`}
          className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5 transition hover:border-navy-800"
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
            <Image
              src={productImageFor(recent.canonicalProductId)}
              alt=""
              fill
              className={productThumbClass(productImageFor(recent.canonicalProductId))}
              sizes="48px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{recent.productName}</p>
            <p className="text-xs text-muted">
              {recent.currentPrice != null ? `$${recent.currentPrice.toFixed(2)}` : "Price unavailable"}
            </p>
          </div>
        </Link>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Nothing saved yet.{" "}
          <Link href="/search" className="font-semibold text-link hover:underline">
            Start shopping
          </Link>
        </p>
      )}
    </section>
  );
}
