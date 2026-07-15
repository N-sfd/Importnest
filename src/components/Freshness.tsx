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
 * minute count). Soft nudge when older data may need a refresh.
 */
export function Freshness({
  minutesAgo,
  className = "",
}: {
  minutesAgo: number | null | undefined;
  className?: string;
}) {
  const state = getFreshnessState(minutesAgo);
  const stale = isFreshnessStale(minutesAgo);

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs ${STATE_TEXT_CLASS[state]} ${className}`}
    >
      <span>{formatFreshness(minutesAgo)}</span>
      {stale ? (
        <span className="inline-flex items-center gap-1 font-medium text-muted">
          · Tap refresh for latest
        </span>
      ) : null}
    </span>
  );
}
