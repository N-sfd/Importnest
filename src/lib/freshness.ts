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
 * Shopper-facing warning thresholds. Soft “Updated X ago” is always fine on
 * its own up through "yesterday"/"N days ago" — a warning suffix only kicks
 * in once data is genuinely old enough to act on, in two tiers: a soft
 * "May need refresh" nudge, escalating to "Data may be outdated" only once
 * truly stale (default demo/seed data that hasn't been re-synced recently
 * would otherwise trip a single low threshold almost permanently, which is
 * what made every rail feel unreliable).
 */
export const FRESHNESS_REFRESH_MINUTES = 24 * 60;
export const FRESHNESS_OUTDATED_MINUTES = 48 * 60;

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

export type FreshnessWarningLevel = "none" | "refresh" | "outdated";

/**
 * Which shopper-facing warning tier (if any) applies. Unknown ages get no
 * warning suffix here — `formatFreshness` already softly labels those
 * "Last checked unknown", and ranking eligibility (a stricter, separate
 * concern) is handled by `isFreshnessStale` instead.
 */
export function getFreshnessWarningLevel(minutes: number | null | undefined): FreshnessWarningLevel {
  if (minutes == null) return "none";
  if (minutes >= FRESHNESS_OUTDATED_MINUTES) return "outdated";
  if (minutes >= FRESHNESS_REFRESH_MINUTES) return "refresh";
  return "none";
}

/**
 * Whether to show a shopper-facing refresh/outdated warning at all.
 * Relative “Updated …” text is always preferred; this only flags old data.
 */
export function needsFreshnessWarning(minutes: number | null | undefined): boolean {
  return getFreshnessWarningLevel(minutes) !== "none";
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

/** Short warning label for the given age — call only when needsFreshnessWarning is true. */
export function freshnessWarningLabel(minutes: number | null | undefined): string {
  return getFreshnessWarningLevel(minutes) === "outdated" ? "Data may be outdated" : "May need refresh";
}
