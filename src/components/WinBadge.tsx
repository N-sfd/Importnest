/** High-contrast win / trust pills for compare offer cards. */

export type WinBadgeKind =
  | "lowest-total"
  | "fastest"
  | "manufacturer"
  | "approved"
  | "neutral"
  | "top";

const KIND_CLASS: Record<WinBadgeKind, string> = {
  "lowest-total": "bg-emerald-600 text-white",
  fastest: "bg-violet-600 text-white",
  manufacturer: "bg-amber-100 text-amber-950 ring-1 ring-amber-300",
  approved: "bg-navy-100 text-navy-900",
  neutral: "bg-surface text-muted ring-1 ring-border",
  top: "bg-cta text-white",
};

export function WinBadge({
  kind,
  children,
}: {
  kind: WinBadgeKind;
  children: React.ReactNode;
}) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${KIND_CLASS[kind]}`}>
      {children}
    </span>
  );
}

/** Map recommendation / source labels to distinct badge kinds — display only. */
export function winBadgeKindFor(label: string, opts?: { isManufacturer?: boolean }): WinBadgeKind {
  const lower = label.toLowerCase();
  if (opts?.isManufacturer || /manufacturer|official brand|official/.test(lower)) {
    return "manufacturer";
  }
  if (/lowest|cheapest|lowest cost|lowest total/.test(lower)) return "lowest-total";
  if (/fastest|pickup|delivery/.test(lower) && /fast|pickup|available/.test(lower)) {
    return "fastest";
  }
  if (/best overall|recommended/.test(lower)) return "top";
  if (/approved|authorized/.test(lower)) return "approved";
  return "neutral";
}

export function MerchantTrustMark({
  authorized,
  freshnessLabel,
}: {
  authorized: boolean;
  freshnessLabel: string;
}) {
  if (!authorized) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] text-muted"
        title={`Listing freshness: ${freshnessLabel}`}
      >
        {freshnessLabel}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800"
      title={`Approved Importnest source · ${freshnessLabel}`}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
        <path
          d="M4.5 8.2 7 10.7 11.5 5.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified · {freshnessLabel}
    </span>
  );
}
