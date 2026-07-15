import { formatFreshness, getFreshnessState, isFreshnessStale, type FreshnessState } from "@/lib/freshness";

const STATE_TEXT_CLASS: Record<FreshnessState, string> = {
  fresh: "text-muted",
  aging: "text-muted",
  stale: "text-amber-900",
  unknown: "text-amber-900",
};

function WarningIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M8 1.75 1.2 14h13.6L8 1.75Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 6.25v3.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
    </svg>
  );
}

/**
 * Compact, human-readable freshness indicator used anywhere a listing/source
 * "last synced" timestamp is shown. Always renders relative text (never a raw
 * minute count) and surfaces a subtle "Data may be outdated" caveat once the
 * data is stale or of unknown age.
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
    <span className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs ${STATE_TEXT_CLASS[state]} ${className}`}>
      <span>{formatFreshness(minutesAgo)}</span>
      {stale ? (
        <span className="inline-flex items-center gap-1 font-medium text-amber-900">
          <WarningIcon />
          Data may be outdated
        </span>
      ) : null}
    </span>
  );
}
