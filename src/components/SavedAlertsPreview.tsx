import Image from "next/image";
import Link from "next/link";
import { productImageFor, productThumbClass } from "@/lib/images";
import type { WatchlistItem } from "@/lib/saved-data";

function alertStatusLabel(item: WatchlistItem): string {
  if (item.alertId == null) return "Favourited";
  if (item.status === "triggered") return "Price drop";
  if (item.status === "paused") return "Alert paused";
  if (item.status === "watching") return "Alert on";
  return "Saved";
}

function alertStatusClass(item: WatchlistItem): string {
  if (item.status === "triggered") return "badge-savings";
  if (item.status === "watching") return "badge-accent";
  if (item.status === "paused") return "bg-surface text-muted ring-1 ring-border";
  return "bg-navy-100 text-navy-900";
}

function WatchlistTile({ item }: { item: WatchlistItem }) {
  const imageSrc = productImageFor(item.canonicalProductId, undefined, item.productName);
  const hasAlert = item.alertId != null;

  return (
    <Link
      href={`/compare/${item.canonicalProductId}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-panel p-2.5 shadow-sm transition hover:border-accent/50 hover:shadow-[var(--shadow-panel)]"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
        <Image
          src={imageSrc}
          alt={item.productName}
          fill
          className={productThumbClass(imageSrc)}
          sizes="56px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-navy-900">{item.productName}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{item.brandName}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {item.currentPrice != null ? (
            <span className="text-sm price-text">
              <span className="text-[10px] font-bold uppercase tracking-wide text-accent">From </span>$
              {item.currentPrice.toFixed(2)}
            </span>
          ) : (
            <span className="text-xs text-muted">Price unavailable</span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${alertStatusClass(item)}`}
          >
            {alertStatusLabel(item)}
          </span>
        </div>
        {hasAlert && item.targetPrice != null ? (
          <p className="mt-1 text-[11px] text-muted">
            Alert below ${item.targetPrice.toFixed(2)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

/** Image-rich saved/favourites + price-alert snapshot for homepage and side rails. */
export function SavedAlertsPreview({
  items,
  compact = false,
  framed = false,
  limit = 4,
  showHeader = true,
}: {
  items: WatchlistItem[];
  compact?: boolean;
  framed?: boolean;
  /** Max tiles to show in the preview list. */
  limit?: number;
  showHeader?: boolean;
}) {
  const savedCount = items.filter((i) => i.savedProductId != null).length;
  const activeAlertCount = items.filter(
    (i) => i.alertId != null && i.status !== "paused",
  ).length;
  const previewItems = items.slice(0, Math.max(1, limit));

  const body = (
    <section>
      {showHeader ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted">
              Favourites &amp; price alerts
            </h2>
            <Link href="/saved" className="text-[11px] font-semibold text-link hover:underline">
              View all
            </Link>
          </div>
          <p className="mt-2 text-xs text-muted">
            <span className="font-extrabold text-navy-900">{savedCount}</span> saved ·{" "}
            <span className="font-extrabold text-navy-900">{activeAlertCount}</span> alerts
          </p>
        </>
      ) : (
        <p className="text-xs text-muted">
          <span className="font-extrabold text-navy-900">{savedCount}</span> saved ·{" "}
          <span className="font-extrabold text-navy-900">{activeAlertCount}</span> alerts
        </p>
      )}

      {previewItems.length > 0 ? (
        <ul
          className={`mt-3 grid gap-2 ${
            compact ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2"
          }`}
        >
          {previewItems.map((item) => (
            <li key={item.canonicalProductId}>
              <WatchlistTile item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted">
          Nothing saved yet.{" "}
          <Link href="/search" className="font-semibold text-link hover:underline">
            Start shopping
          </Link>
        </p>
      )}

      {items.length > previewItems.length ? (
        <Link
          href="/saved"
          className="mt-3 inline-block text-xs font-semibold text-link hover:underline"
        >
          +{items.length - previewItems.length} more on your watchlist →
        </Link>
      ) : null}
    </section>
  );

  if (framed) {
    return (
      <div className="rounded-2xl border border-border bg-panel p-3.5 shadow-[var(--shadow-panel)]">
        {body}
      </div>
    );
  }

  // Embedded in a parent panel/section — avoid double chrome.
  if (compact || !showHeader) {
    return body;
  }

  return (
    <section className="mt-6 panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">
          Favourites &amp; price alerts
        </h2>
        <Link href="/saved" className="text-sm font-semibold text-link hover:underline">
          Manage watchlist
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <p className="text-sm text-muted">
          <span className="text-lg font-extrabold text-navy-900">{savedCount}</span>{" "}
          {savedCount === 1 ? "favourite" : "favourites"}
        </p>
        <p className="text-sm text-muted">
          <span className="text-lg font-extrabold text-navy-900">{activeAlertCount}</span>{" "}
          {activeAlertCount === 1 ? "active alert" : "active alerts"}
        </p>
      </div>

      {previewItems.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {previewItems.map((item) => (
            <li key={item.canonicalProductId}>
              <WatchlistTile item={item} />
            </li>
          ))}
        </ul>
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
