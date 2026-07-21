import Link from "next/link";
import { RecentSearches } from "@/components/RecentSearches";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { SavedAlertsPreview } from "@/components/SavedAlertsPreview";
import type { RecentSearch } from "@/lib/recent-searches";
import type { WatchlistItem } from "@/lib/saved-data";

/** Useful trust card when there is no recent-activity data. */
export function HomeTrustCard() {
  return (
    <aside
      className="rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)]"
      aria-label="Compare with confidence"
    >
      <h2 className="text-sm font-bold tracking-tight text-navy-900">Compare with confidence</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          Approved sources only
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          Total known cost shown clearly
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          Sponsored results labeled
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          Price alerts available
        </li>
      </ul>
      <Link
        href="#approved-sources"
        className="mt-3 inline-block text-xs font-semibold text-link hover:underline"
      >
        See approved retailers →
      </Link>
    </aside>
  );
}

/**
 * Homepage personalization rail.
 * Never shows empty “appear here as you shop” placeholders — falls back to
 * a trust card when there is no recent-activity data.
 */
export function HomePersonalizationRail({
  recentSearches,
  watchlist,
  showWatchlist,
  placement,
}: {
  recentSearches: RecentSearch[];
  watchlist: WatchlistItem[];
  showWatchlist: boolean;
  placement: "mobile" | "inline";
}) {
  const hasRecent = recentSearches.length > 0;
  const hasWatchlist = showWatchlist && watchlist.length > 0;

  if (placement === "inline") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)] sm:p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-base font-bold tracking-tight text-navy-900">
                Favourites &amp; price alerts
              </h3>
              <p className="mt-0.5 text-sm text-muted">
                Get notified when Total Known Cost drops.
              </p>
            </div>
            <Link href="/saved" className="text-sm font-semibold text-link hover:underline">
              Open watchlist
            </Link>
          </div>
          {hasWatchlist ? (
            <SavedAlertsPreview items={watchlist} compact={false} limit={4} showHeader={false} />
          ) : (
            <div>
              <p className="text-sm font-semibold text-navy-900">Start your watchlist</p>
              <p className="mt-1 text-sm text-muted">
                Heart a product on Top Products or Best Deals, then set a target price on the saved
                page.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={showWatchlist ? "/saved" : "/login?next=/saved"}
                  className="btn-cta px-4 py-2 text-sm"
                >
                  {showWatchlist ? "Open saved products" : "Sign in to save"}
                </Link>
                <Link
                  href="/search?category=electronics"
                  className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-navy-900 hover:border-accent"
                >
                  Browse products
                </Link>
              </div>
            </div>
          )}
        </div>
        {hasRecent ? (
          <div className="rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)]">
            <RecentSearches items={recentSearches} compact />
          </div>
        ) : (
          <HomeTrustCard />
        )}
      </div>
    );
  }

  // Recently viewed — only when data exists (component self-hides).
  return (
    <div className="home-section" aria-label="Recently viewed">
      <RecentlyViewedSection compact framed />
    </div>
  );
}
