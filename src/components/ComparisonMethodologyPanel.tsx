const FACTORS = [
  { label: "Item price", description: "The listed price for the product itself, before shipping or fees." },
  { label: "Shipping", description: "Shipping cost as quoted by the source, when they provide it." },
  { label: "Fees", description: "Any additional handling or marketplace fees the source discloses." },
  { label: "Condition", description: "New, open box, refurbished, or used — as stated by the source." },
  { label: "Pickup & delivery", description: "Whether the offer supports local pickup, delivery, or both." },
  { label: "Source freshness", description: "How recently Importnest last checked this listing for changes." },
] as const;

/**
 * Static methodology legend, not a per-product data table — explains what
 * factors go into the ranking below before the shopper sees ranked offers.
 */
export function ComparisonMethodologyPanel() {
  return (
    <section className="panel mt-4 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-foreground">What Importnest compares</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
