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
 * Amber warning only when data is truly old — "May need refresh" past a day,
 * escalating to "Data may be outdated" past two days.
 *
 * Never renders its own "Refresh" affordance — a plain-text hint here would
 * look like a button without being one. Callers that want an actual refresh
 * action should render a real `RefreshPricesButton` (e.g. via `OfferActions`)
 * alongside this component instead.
 */
export function Freshness({
  minutesAgo,
  className = "",
}: {
  minutesAgo: number | null | undefined;
  className?: string;
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
          · {freshnessWarningLabel(minutesAgo)}
        </span>
      ) : null}
    </span>
  );
}
