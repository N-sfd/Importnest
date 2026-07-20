import Link from "next/link";
import type { PopularComparison } from "@/lib/popular-comparisons";
import { homeTopProductImageFor } from "@/lib/images";
import { TopProductCard } from "@/components/TopProductCard";

export type TopProductBadge = "Bestseller" | "Popular" | "Top rated";

export type TopProductCardData = PopularComparison & {
  badge: TopProductBadge;
  supportingLine: string;
};

/** Dense product cards for homepage “Top Products” — real totals only. */
export function TopProductsSection({
  items,
  signedIn,
}: {
  items: TopProductCardData[];
  signedIn: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="top-products-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="top-products-heading"
            className="text-xl font-bold tracking-tight text-navy-900"
          >
            Top Products
          </h2>
          <p className="mt-1 text-sm text-muted">
            Most compared items from approved retailers — prices are Total Known Cost.
          </p>
        </div>
        <Link href="/search" className="text-sm font-semibold text-link hover:underline">
          Browse all
        </Link>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((item) => (
          <li key={item.productId} className="min-w-0">
            <TopProductCard
              productId={item.productId}
              href={`/compare/${item.productId}`}
              imageSrc={homeTopProductImageFor(item.productId, item.categorySlug, item.productName)}
              productName={item.productName}
              brandName={item.brandName}
              supportingLine={item.supportingLine}
              badge={item.badge}
              fromPrice={item.lowestTotalCost}
              rating={item.rating}
              offerCount={item.offerCount}
              bestListing={item.bestListing}
              isSaved={item.isSaved}
              signedIn={signedIn}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Assign display badges from ranking signals — never invent ratings. */
export function withTopProductBadges(items: PopularComparison[]): TopProductCardData[] {
  return items.map((item, index) => {
    let badge: TopProductBadge = "Popular";
    if (index === 0) badge = "Bestseller";
    else if (item.rating != null) badge = "Top rated";
    else if (item.offerCount >= 3) badge = "Popular";
    else if (index <= 1) badge = "Bestseller";

    return {
      ...item,
      badge,
      supportingLine: `${item.brandName} · ${item.offerCount} approved ${
        item.offerCount === 1 ? "offer" : "offers"
      }`,
    };
  });
}
