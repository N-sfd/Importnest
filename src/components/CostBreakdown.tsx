import { formatCostBreakdownLine, type CostBreakdownInput } from "@/lib/cost-breakdown";

function InfoIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.25v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5.1" r="0.9" fill="currentColor" />
    </svg>
  );
}

function Row({
  label,
  value,
  signed,
  strong,
}: {
  label: string;
  value: CostBreakdownInput;
  signed?: boolean;
  strong?: boolean;
}) {
  const { text, isMissing, isEstimated } = formatCostBreakdownLine(value, { signed });

  return (
    <div
      className={`flex items-baseline justify-between gap-3 ${
        strong ? "mt-1.5 border-t border-border pt-1.5" : ""
      }`}
    >
      <dt className={strong ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
        {label}
      </dt>
      <dd
        className={`flex items-center gap-1.5 tabular-nums ${
          strong ? "text-base price-text" : "text-sm text-foreground/80"
        } ${isMissing ? "font-normal italic text-muted" : ""}`}
      >
        {text}
        {isEstimated ? (
          <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted ring-1 ring-border">
            Estimated
          </span>
        ) : null}
      </dd>
    </div>
  );
}

/**
 * Compact, reusable cost breakdown for an offer. Renders real stored values
 * only — missing or invalid amounts read as "Not provided", never a
 * fabricated "$0.00" — and highlights total known cost more strongly than
 * the individual line items.
 */
export function CostBreakdown({
  itemPrice,
  shipping,
  mandatoryFees,
  verifiedDiscount,
  totalKnownCost,
  className = "",
}: {
  itemPrice: CostBreakdownInput;
  shipping: CostBreakdownInput;
  mandatoryFees: CostBreakdownInput;
  verifiedDiscount: CostBreakdownInput;
  totalKnownCost: CostBreakdownInput;
  className?: string;
}) {
  return (
    <dl className={`w-full min-w-[11rem] space-y-1 ${className}`}>
      <Row label="Item price" value={itemPrice} />
      <Row label="Shipping" value={shipping} />
      <Row label="Mandatory fees" value={mandatoryFees} />
      <Row label="Verified discount" value={verifiedDiscount} signed />
      <Row label="Total known cost" value={totalKnownCost} strong />
      <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-snug text-muted">
        <InfoIcon />
        <span>Taxes may be calculated at checkout if not available here.</span>
      </p>
    </dl>
  );
}
