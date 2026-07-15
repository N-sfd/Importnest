/**
 * Single source of truth for turning a "minutes since last sync" number into
 * user-facing freshness text and state. Never surface the raw minute count.
 */

export type FreshnessState = "fresh" | "aging" | "stale" | "unknown";

/** Below this, data reads as freshly synced with no caveats. */
export const FRESHNESS_FRESH_MINUTES = 15;
/** Matches seeded RankingConfig.freshnessThresholdMinutes — at/above this is stale. */
export const FRESHNESS_STALE_MINUTES = 60;

export function getFreshnessState(minutes: number | null | undefined): FreshnessState {
  if (minutes == null) return "unknown";
  if (minutes < FRESHNESS_FRESH_MINUTES) return "fresh";
  if (minutes < FRESHNESS_STALE_MINUTES) return "aging";
  return "stale";
}

/**
 * True for "stale" and "unknown" ages alike — an unknown last-sync time is no
 * safer to assert a definitive ranking claim on than a known-old one. Callers
 * use this to gate both the "Data may be outdated" caveat and eligibility for
 * definitive ranking labels (Best overall / Lowest cost / Fastest).
 */
export function isFreshnessStale(minutes: number | null | undefined): boolean {
  const state = getFreshnessState(minutes);
  return state === "stale" || state === "unknown";
}

/** Human-readable relative freshness text. Never emits raw values like "2639m ago". */
export function formatFreshness(minutes: number | null | undefined): string {
  if (minutes == null) return "Freshness unknown";
  if (minutes < 1) return "Updated just now";
  if (minutes < 60) {
    return minutes === 1 ? "Updated 1 minute ago" : `Updated ${minutes} minutes ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "Updated 1 hour ago" : `Updated ${hours} hours ago`;
  }

  const days = Math.round(hours / 24);
  return days === 1 ? "Updated yesterday" : `Updated ${days} days ago`;
}
