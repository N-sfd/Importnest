import {
  formatFreshness,
  getFreshnessState,
  needsFreshnessWarning,
  freshnessWarningLabel,
  type FreshnessState,
} from "@/lib/freshness";

const STATE_TEXT_CLASS: Record<FreshnessState, string> = {
  fresh: "text-muted",
  aging: "text-muted",
  stale: "text-muted",
  unknown: "text-muted",
};

/**
 * Compact freshness indicator. Always shows soft relative time.
 * Amber “May need refresh” only when data is truly old (6h+).
 */
export function Freshness({
  minutesAgo,
  className = "",
  showRefreshHint = false,
}: {
  minutesAgo: number | null | undefined;
  className?: string;
  /** When true and a warning is warranted, append a soft refresh nudge. */
  showRefreshHint?: boolean;
}) {
  const state = getFreshnessState(minutesAgo);
  const warn = needsFreshnessWarning(minutesAgo);

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs ${STATE_TEXT_CLASS[state]} ${className}`}
    >
      <span>{formatFreshness(minutesAgo)}</span>
      {warn ? (
        <span className="inline-flex items-center gap-1 font-medium text-amber-800">
          · {freshnessWarningLabel()}
          {showRefreshHint ? <span className="font-normal text-muted">· Refresh price</span> : null}
        </span>
      ) : null}
    </span>
  );
}
