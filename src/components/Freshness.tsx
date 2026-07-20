import { formatFreshness, getFreshnessState, isFreshnessStale, type FreshnessState } from "@/lib/freshness";

const STATE_TEXT_CLASS: Record<FreshnessState, string> = {
  fresh: "text-muted",
  aging: "text-muted",
  stale: "text-muted",
  unknown: "text-muted",
};

/**
 * Compact, human-readable freshness indicator used anywhere a listing/source
 * "last synced" timestamp is shown. Always renders relative text (never a raw
 * minute count). Optional soft nudge when older data may need a refresh —
 * only enable on screens that actually offer a refresh control.
 */
export function Freshness({
  minutesAgo,
  className = "",
  showRefreshHint = false,
}: {
  minutesAgo: number | null | undefined;
  className?: string;
  /** When true and stale, append “Tap refresh for latest” (compare page only). */
  showRefreshHint?: boolean;
}) {
  const state = getFreshnessState(minutesAgo);
  const stale = isFreshnessStale(minutesAgo);

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs ${STATE_TEXT_CLASS[state]} ${className}`}
    >
      <span>{formatFreshness(minutesAgo)}</span>
      {stale && showRefreshHint ? (
        <span className="inline-flex items-center gap-1 font-medium text-muted">
          · Tap refresh for latest
        </span>
      ) : stale ? (
        <span className="font-medium text-amber-800">· Data may be outdated</span>
      ) : null}
    </span>
  );
}
