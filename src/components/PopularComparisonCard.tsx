import { ProductCard } from "@/components/ProductCard";
import type { PopularComparison } from "@/lib/popular-comparisons";

export function PopularComparisonCard({
  item,
  signedIn,
  redirectTo = "/",
}: {
  item: PopularComparison;
  signedIn: boolean;
  redirectTo?: string;
}) {
  return (
    <ProductCard
      productId={item.productId}
      href={`/compare/${item.productId}`}
      imageSrc={item.imageSrc}
      brandName={item.brandName}
      productName={item.productName}
      subtitle={item.categorySlug.replace(/-/g, " ")}
      badge="Popular"
      rating={item.rating}
      fromPrice={item.lowestTotalCost}
      offerCount={item.offerCount}
      sourceCount={item.sourceCount}
      freshnessMinutesAgo={item.freshnessMinutesAgo}
      bestListing={item.bestListing}
      isSaved={item.isSaved}
      signedIn={signedIn}
      redirectTo={redirectTo}
    />
  );
}

export function PopularComparisonsSection({
  items,
  signedIn,
  title = "Popular comparisons",
  subtitle = "Live totals from approved retailers",
}: {
  items: PopularComparison[];
  signedIn: boolean;
  title?: string;
  subtitle?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={title ? "popular-comparisons-heading" : undefined}>
      {title ? (
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2
              id="popular-comparisons-heading"
              className="text-xl font-bold tracking-tight text-navy-900"
            >
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      <ul className={`section-grid ${title ? "mt-4" : ""}`}>
        {items.map((item) => (
          <li key={item.productId} className="min-w-0">
            <PopularComparisonCard item={item} signedIn={signedIn} />
          </li>
        ))}
      </ul>
    </section>
  );
}
