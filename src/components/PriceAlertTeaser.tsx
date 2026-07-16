import Image from "next/image";
import Link from "next/link";
import { formatFreshness } from "@/lib/freshness";
import { productImageFor, productThumbClass } from "@/lib/images";
import type { WatchlistItem } from "@/lib/saved-data";

function statusLabel(status: WatchlistItem["status"]) {
  if (status === "triggered") return "Price drop matched";
  if (status === "watching") return "Watching";
  if (status === "paused") return "Paused";
  return "No alert yet";
}

function statusTone(status: WatchlistItem["status"]) {
  if (status === "triggered") return "bg-cta/15 text-cta";
  if (status === "watching") return "bg-accent/15 text-accent";
  if (status === "paused") return "bg-surface text-muted";
  return "bg-surface text-muted";
}

/** Teaser for price alerts — light cards with clear Total Known Cost hierarchy. */
export function PriceAlertTeaser({
  signedIn,
  preview = null,
}: {
  signedIn: boolean;
  preview?: WatchlistItem | null;
}) {
  const hasLive = preview != null;
  const imageSrc = productImageFor(hasLive ? preview.canonicalProductId : "cp-apex-ah4200");
  const productHref = `/compare/${hasLive ? preview.canonicalProductId : "cp-apex-ah4200"}`;

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-panel shadow-[var(--shadow-panel)]">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            Multi-day decisions
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">
            Track Total Known Cost — get notified when it drops
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Save a product or search, set a price alert, and Importnest watches approved retailers
            for you. When item + shipping + fees fall, you hear about it first.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
            {signedIn ? (
              <>
                <Link href="/saved" className="btn-cta px-5 py-2.5 text-center text-sm">
                  Open saved & alerts
                </Link>
                <Link
                  href={productHref}
                  className="rounded-full border border-border bg-surface px-4 py-2.5 text-center text-sm font-semibold text-navy-900 hover:border-accent"
                >
                  Track on a live product
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login?next=/saved"
                  className="btn-cta px-5 py-2.5 text-center text-sm"
                >
                  Create free alerts
                </Link>
                <Link
                  href={productHref}
                  className="rounded-full border border-border bg-surface px-4 py-2.5 text-center text-sm font-semibold text-navy-900 hover:border-accent"
                >
                  Preview Track Price
                </Link>
              </>
            )}
          </div>
        </div>

        <aside className="border-t border-border bg-surface px-5 py-5 sm:px-6 lg:border-l lg:border-t-0">
          <div className="flex items-start gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
              <Image
                src={imageSrc}
                alt={hasLive ? preview.productName : "Apex Home Quiet Dishwasher"}
                fill
                className={productThumbClass(imageSrc)}
                sizes="64px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold text-navy-900">
                  {hasLive ? preview.productName : "Apex Home Quiet Dishwasher"}
                </p>
                {!hasLive ? (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    Example layout
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-muted">Saved product · Total Known Cost alert</p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-panel px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Current total
              </dt>
              <dd className="mt-1 text-base font-extrabold tabular-nums text-navy-900">
                {hasLive && preview.currentPrice != null
                  ? `$${preview.currentPrice.toFixed(2)}`
                  : "See live compare"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-panel px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Target price
              </dt>
              <dd className="mt-1 text-base font-extrabold tabular-nums text-navy-900">
                {hasLive && preview.targetPrice != null
                  ? `$${preview.targetPrice.toFixed(2)}`
                  : "Set on saved"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-panel px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Alert status
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    hasLive ? statusTone(preview.status) : "bg-accent/15 text-accent"
                  }`}
                >
                  {hasLive ? statusLabel(preview.status) : "Watching concept"}
                </span>
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-panel px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Last checked
              </dt>
              <dd className="mt-1 text-sm font-semibold text-navy-900">
                {hasLive
                  ? formatFreshness(preview.lastCheckedMinutesAgo)
                  : "From live freshness"}
              </dd>
            </div>
          </dl>

          <p className="mt-3 rounded-xl border border-accent/25 bg-accent/5 px-3 py-2 text-xs leading-relaxed text-foreground/80">
            <span className="font-bold text-accent">Price-drop idea:</span> when Total Known Cost
            (item + shipping + fees) crosses your target, Importnest surfaces it on Saved — not a
            sticker-price-only ping.
          </p>
        </aside>
      </div>
    </section>
  );
}
