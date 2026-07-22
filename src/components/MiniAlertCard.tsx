import Image from "next/image";
import Link from "next/link";
import { formatFreshness } from "@/lib/freshness";
import { productImageFor, productThumbClass } from "@/lib/images";
import type { WatchlistItem } from "@/lib/saved-data";

function alertLabel(status: WatchlistItem["status"]): string {
  if (status === "triggered") return "Triggered";
  if (status === "paused") return "Paused";
  return "Active";
}

function AlertFields({ children }: { children: React.ReactNode }) {
  return <dl className="mt-3 space-y-1.5 text-sm">{children}</dl>;
}

function AlertField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold tabular-nums text-navy-900">{value}</dd>
    </div>
  );
}

/**
 * Compact "what a price alert looks like" card beside the Price Alerts
 * explanation — shows the viewer's own first real alert when they have one,
 * otherwise a clearly labeled example so the pitch isn't purely descriptive
 * prose.
 */
export function MiniAlertCard({ watchlist }: { watchlist: WatchlistItem[] }) {
  const real = watchlist.find((item) => item.alertId != null);

  if (real) {
    const imageSrc = productImageFor(real.canonicalProductId, real.categorySlug, real.productName);
    return (
      <div className="rounded-2xl border border-border bg-panel px-5 py-6 shadow-[var(--shadow-panel)] sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Watch this product</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
            <Image src={imageSrc} alt="" fill className={productThumbClass(imageSrc)} sizes="48px" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy-900">{real.productName}</p>
            <p className="truncate text-xs text-muted">{real.brandName}</p>
          </div>
        </div>
        <AlertFields>
          <AlertField
            label="Current TKC"
            value={real.currentPrice != null ? `$${real.currentPrice.toFixed(2)}` : "Not available"}
          />
          <AlertField
            label="Target"
            value={real.targetPrice != null ? `$${real.targetPrice.toFixed(2)}` : "Not set"}
          />
          <AlertField label="Alert" value={alertLabel(real.status)} />
          <AlertField label="Last checked" value={formatFreshness(real.lastCheckedMinutesAgo)} />
        </AlertFields>
        <Link href="/saved" className="btn-cta mt-4 inline-flex px-4 py-2.5 text-sm">
          Manage alerts
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-border bg-panel px-5 py-6 shadow-[var(--shadow-panel)] sm:px-6"
      aria-label="Example price alert"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Watch this product</p>
        <span className="rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-semibold text-navy-800">
          Example
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-navy-900">Apex Home Quiet Dishwasher</p>
      <AlertFields>
        <AlertField label="Current TKC" value="$799.00" />
        <AlertField label="Target" value="$750.00" />
        <AlertField label="Alert" value="Active" />
        <AlertField label="Last checked" value="Updated 1 hour ago" />
      </AlertFields>
      <Link href="/search" className="btn-cta mt-4 inline-flex px-4 py-2.5 text-sm">
        Try it — set your own alert
      </Link>
    </div>
  );
}
