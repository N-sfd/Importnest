const FACTORS = [
  { label: "Item price", description: "The listed price for the product itself, before shipping or fees." },
  { label: "Shipping", description: "Shipping cost as quoted by the source, when they provide it." },
  { label: "Fees", description: "Any additional handling or marketplace fees the source discloses." },
  { label: "Condition", description: "New, open box, refurbished, or used — as stated by the source." },
  { label: "Pickup & delivery", description: "Whether the offer supports local pickup, delivery, or both." },
  { label: "Source freshness", description: "How recently Importnest last checked this listing for changes." },
  { label: "Total Known Cost", description: "Item + disclosed shipping + mandatory fees − verified discounts. Missing lines stay “Not provided”." },
] as const;

/**
 * Static methodology legend — explains ranking factors. Not product data;
 * always has content, so it is safe in a side panel.
 */
export function ComparisonMethodologyPanel({
  compact = false,
  className = "",
}: {
  /** Tighter single-column layout for the compare side panel. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <section className={`panel p-4 sm:p-5 ${className}`.trim()}>
      <h2 className="text-sm font-semibold text-foreground">What Importnest compares</h2>
      <p className="mt-1 text-xs text-muted">
        Only disclosed fields from approved sources. Gaps are never filled with invented values.
      </p>
      <dl
        className={
          compact
            ? "mt-3 space-y-3"
            : "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {FACTORS.map((factor) => (
          <div key={factor.label}>
            <dt className="text-xs font-bold uppercase tracking-wide text-navy-800">{factor.label}</dt>
            <dd className="mt-0.5 text-xs text-muted">{factor.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
