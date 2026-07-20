import { RecentSearches } from "@/components/RecentSearches";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { SavedAlertsPreview } from "@/components/SavedAlertsPreview";
import type { RecentSearch } from "@/lib/recent-searches";
import type { WatchlistItem } from "@/lib/saved-data";

/**
 * Compact personalization rail for homepage — recent searches, recently viewed,
 * and watchlist summary. Desktop: sticky right sidebar. Mobile: stacked cards.
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
  placement: "sidebar" | "mobile";
}) {
  if (placement === "sidebar") {
    const hasServerContent = recentSearches.length > 0 || showWatchlist;
    return (
      <aside className="hidden w-[260px] shrink-0 xl:block" aria-label="Your activity">
        <div className="sticky top-24 space-y-5 rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)]">
          <RecentSearches items={recentSearches} compact />
          <RecentlyViewedSection compact />
          {showWatchlist ? <SavedAlertsPreview items={watchlist} compact /> : null}
          {!hasServerContent ? (
            <p className="text-xs leading-relaxed text-muted">
              Recent searches and viewed products appear here as you shop.
            </p>
          ) : null}
        </div>
      </aside>
    );
  }

  return (
    <div className="mt-6 space-y-3 xl:hidden" aria-label="Your activity">
      <RecentSearches items={recentSearches} compact framed />
      <RecentlyViewedSection compact framed />
      {showWatchlist ? <SavedAlertsPreview items={watchlist} compact framed /> : null}
    </div>
  );
}
