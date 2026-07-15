import {
  PROTECTION_AVAILABLE_LABEL,
  PROTECTION_UNAVAILABLE_DETAIL,
  PROTECTION_UNAVAILABLE_LABEL,
  protectionDetailItems,
  type ProtectionDetails as ProtectionDetailsData,
} from "@/lib/compare-view";

function InfoIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.25v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5.1" r="0.9" fill="currentColor" />
    </svg>
  );
}

/**
 * Compact warranty/return summary for an offer. Replaces the old always-on
 * "Warranty information not provided · Return policy not provided" line with
 * a single label plus an expandable detail — real facts only, never a
 * fabricated field for data the source didn't supply.
 */
export function ProtectionDetails({ details }: { details?: ProtectionDetailsData }) {
  const items = protectionDetailItems(details);

  if (items.length === 0) {
    return (
      <details className="text-sm text-foreground/80">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 marker:content-none [&::-webkit-details-marker]:hidden">
          <span>{PROTECTION_UNAVAILABLE_LABEL}</span>
          <InfoIcon />
        </summary>
        <p className="mt-1 max-w-xs text-xs text-muted">{PROTECTION_UNAVAILABLE_DETAIL}</p>
      </details>
    );
  }

  return (
    <details className="text-sm text-foreground/80">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{PROTECTION_AVAILABLE_LABEL}</span>
        <InfoIcon />
      </summary>
      <dl className="mt-1 max-w-xs space-y-0.5 text-xs text-muted">
        {items.map((item) => (
          <div key={item.label} className="flex gap-1">
            <dt className="shrink-0 font-medium text-foreground/70">{item.label}:</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
