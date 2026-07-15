import { PopularComparisonCard } from "@/components/PopularComparisonCard";
import type { PopularComparison } from "@/lib/popular-comparisons";

/** One compact featured comparison, using the existing product-card style. Real data only. */
export function FeaturedComparison({
  item,
  signedIn,
}: {
  item: PopularComparison | null;
  signedIn: boolean;
}) {
  if (!item) return null;

  return (
    <section className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Featured comparison</h2>
      <div className="mt-2.5">
        <PopularComparisonCard item={item} signedIn={signedIn} redirectTo="/" />
      </div>
    </section>
  );
}
