/**
 * Single source of truth for turning a "minutes since last sync" number into
 * user-facing freshness text and state. Never surface the raw minute count.
 */

export type FreshnessState = "fresh" | "aging" | "stale" | "unknown";

/** Below this, data reads as freshly synced with no caveats. */
export const FRESHNESS_FRESH_MINUTES = 15;
/**
 * Ranking / eligibility threshold — at/above this, definitive rank labels are gated.
 * Matches seeded RankingConfig.freshnessThresholdMinutes.
 */
export const FRESHNESS_STALE_MINUTES = 60;
/**
 * Shopper-facing warning threshold. Soft “Updated X ago” is always fine;
 * amber “May need refresh” only past this age (or when unknown on compare screens).
 */
export const FRESHNESS_WARN_MINUTES = 6 * 60;

export function getFreshnessState(minutes: number | null | undefined): FreshnessState {
  if (minutes == null) return "unknown";
  if (minutes < FRESHNESS_FRESH_MINUTES) return "fresh";
  if (minutes < FRESHNESS_STALE_MINUTES) return "aging";
  return "stale";
}

/**
 * True for "stale" and "unknown" ages alike — used to gate definitive ranking
 * labels (Best overall / Lowest cost / Fastest), not everyday UI warnings.
 */
export function isFreshnessStale(minutes: number | null | undefined): boolean {
  const state = getFreshnessState(minutes);
  return state === "stale" || state === "unknown";
}

/**
 * Whether to show a shopper-facing amber refresh warning.
 * Relative “Updated …” text is always preferred; this only flags truly old data.
 */
export function needsFreshnessWarning(minutes: number | null | undefined): boolean {
  if (minutes == null) return false;
  return minutes >= FRESHNESS_WARN_MINUTES;
}

/** Soft relative freshness text. Prefer this over warning copy on product cards. */
export function formatFreshness(minutes: number | null | undefined): string {
  if (minutes == null) return "Last checked unknown";
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

/** Short warning label when needsFreshnessWarning is true. */
export function freshnessWarningLabel(): string {
  return "May need refresh";
}
