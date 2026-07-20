import Link from "next/link";
import { RecentSearches } from "@/components/RecentSearches";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { SavedAlertsPreview } from "@/components/SavedAlertsPreview";
import type { RecentSearch } from "@/lib/recent-searches";
import type { WatchlistItem } from "@/lib/saved-data";

/** Always-useful trust card — never an empty “recent searches” placeholder. */
export function HomeTrustCard() {
  return (
    <aside
      className="rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)]"
      aria-label="How Importnest protects comparisons"
    >
      <h2 className="text-sm font-bold tracking-tight text-navy-900">
        Importnest protects your comparison
      </h2>
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
          Sponsored results labeled separately
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          No hidden ranking influence
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
 * Compact personalization blocks for homepage.
 * Never shows empty “appear here as you shop” placeholders.
 * Prefer inline mid-page placement over an empty right rail.
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
  placement: "sidebar" | "mobile" | "inline";
}) {
  const hasRecent = recentSearches.length > 0;
  const hasWatchlist = showWatchlist && watchlist.length > 0;
  const hasServerContent = hasRecent || hasWatchlist;

  if (placement === "sidebar") {
    // Legacy sidebar path — hide when empty so the homepage stays full-width.
    if (!hasServerContent) return null;

    return (
      <aside className="hidden w-[280px] shrink-0 xl:block" aria-label="Your activity">
        <div className="sticky top-24 space-y-4">
          {hasRecent ? (
            <div className="rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)]">
              <RecentSearches items={recentSearches} compact />
            </div>
          ) : null}
          <RecentlyViewedSection compact framed />
          {showWatchlist ? (
            <div className="rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)]">
              <SavedAlertsPreview items={watchlist} compact />
            </div>
          ) : null}
          <HomeTrustCard />
        </div>
      </aside>
    );
  }

  if (placement === "inline") {
    return (
      <section
        className="home-section"
        aria-labelledby="watchlist-preview-heading"
      >
        <div className="mb-3">
          <h2
            id="watchlist-preview-heading"
            className="text-xl font-bold tracking-tight text-navy-900"
          >
            Price alerts &amp; watchlist
          </h2>
          <p className="mt-1 text-sm text-muted">
            Track saved products and stay ready when totals change.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <HomeTrustCard />
          {hasRecent ? (
            <div className="rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)]">
              <RecentSearches items={recentSearches} compact />
            </div>
          ) : null}
          {hasWatchlist ? (
            <div className="rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)]">
              <SavedAlertsPreview items={watchlist} compact />
            </div>
          ) : (
            <aside className="rounded-2xl border border-dashed border-border bg-panel p-4">
              <p className="text-sm font-semibold text-navy-900">Start a watchlist</p>
              <p className="mt-1 text-sm text-muted">
                Save products while you compare to get price-alert previews here.
              </p>
              <Link
                href={showWatchlist ? "/saved" : "/login?next=/saved"}
                className="mt-3 inline-block text-xs font-semibold text-link hover:underline"
              >
                {showWatchlist ? "Open saved products →" : "Sign in to save →"}
              </Link>
            </aside>
          )}
        </div>
      </section>
    );
  }

  // Mobile: client recently-viewed only (self-hides when empty).
  return (
    <div className="home-section space-y-3 xl:hidden" aria-label="Recently viewed">
      <RecentlyViewedSection compact framed />
    </div>
  );
}
