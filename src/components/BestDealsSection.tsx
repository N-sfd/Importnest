import Link from "next/link";
import type { BestDealItem } from "@/lib/best-deals";
import { homeDealImageFor } from "@/lib/images";
import { DealProductCard } from "@/components/DealProductCard";

/** Compact Best Deals grid — light background, real Total Known Cost only. */
export function BestDealsSection({
  items,
  signedIn,
}: {
  items: BestDealItem[];
  signedIn: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section
      className="mt-10 rounded-2xl border border-border bg-surface px-4 py-6 sm:px-6 sm:py-7"
      aria-labelledby="best-deals-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="best-deals-heading"
            className="text-xl font-bold tracking-tight text-navy-900"
          >
            Best Deals
          </h2>
          <p className="mt-1 text-sm text-muted">
            Totals include item + shipping + fees. Struck prices appear only from real price history.
          </p>
        </div>
        <Link href="/search?q=deals" className="text-sm font-semibold text-link hover:underline">
          See more deals
        </Link>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((item) => (
          <li key={item.productId} className="min-w-0">
            <DealProductCard
              productId={item.productId}
              href={`/compare/${item.productId}`}
              imageSrc={homeDealImageFor(item.productId)}
              productName={item.productName}
              brandName={item.brandName}
              currentTotal={item.currentTotal}
              previousTotal={item.previousTotal}
              dealBadge={item.dealBadge}
              discountPercent={item.discountPercent}
              isSaved={item.isSaved}
              signedIn={signedIn}
              bestListing={item.bestListing}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
