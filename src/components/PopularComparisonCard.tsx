import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { formatConditionLabel } from "@/lib/compare-view";
import {
  freshnessLabel,
  type PopularComparison,
} from "@/lib/popular-comparisons";
import { productThumbClass } from "@/lib/images";
import { saveProductAction, unsaveProductAction } from "@/lib/saved-actions";

export function PopularComparisonCard({
  item,
  signedIn,
  redirectTo = "/",
}: {
  item: PopularComparison;
  signedIn: boolean;
  redirectTo?: string;
}) {
  const offerLabel = item.offerCount === 1 ? "1 offer" : `${item.offerCount} offers`;

  return (
    <article className="panel offer-card flex gap-3 p-3 sm:p-4">
      <Link
        href={`/compare/${item.productId}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-white"
      >
        <Image
          src={item.imageSrc}
          alt={item.productName}
          fill
          className={productThumbClass(item.imageSrc)}
          sizes="80px"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted">{item.brandName}</p>
        <Link
          href={`/compare/${item.productId}`}
          className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-link"
        >
          {item.productName}
        </Link>
        <p className="mt-1.5 text-base font-bold tabular-nums text-price">
          From ${item.lowestTotalCost.toFixed(2)}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {offerLabel} · {freshnessLabel(item.freshnessMinutesAgo)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {signedIn ? (
            <form
              action={
                item.isSaved
                  ? unsaveProductAction.bind(null, item.productId, redirectTo)
                  : saveProductAction.bind(null, item.productId, redirectTo)
              }
            >
              <button
                type="submit"
                className="rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
              >
                {item.isSaved ? "Saved ✓" : "Save"}
              </button>
            </form>
          ) : null}
          <AddToCompareButton productId={item.productId} productName={item.productName} />
          <AddToCartButton
            compact
            listingId={item.bestListing.listingId}
            productId={item.productId}
            title={item.productName}
            brand={item.brandName}
            imageUrl={item.imageSrc}
            retailerName={item.bestListing.sourceName}
            condition={formatConditionLabel(item.bestListing.condition)}
            itemPrice={item.bestListing.price}
            shipping={item.bestListing.shipping}
            fees={item.bestListing.fees}
            totalKnownCost={item.bestListing.price + item.bestListing.shipping + item.bestListing.fees}
          />
          <Link
            href={`/compare/${item.productId}`}
            className="btn-cta px-3 py-1.5 text-xs"
          >
            Compare
          </Link>
        </div>
      </div>
    </article>
  );
}

export function PopularComparisonsSection({
  items,
  signedIn,
}: {
  items: PopularComparison[];
  signedIn: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-navy-900">Popular comparisons</h2>
          <p className="mt-1 text-sm text-muted">Live totals from approved retailers</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <PopularComparisonCard key={item.productId} item={item} signedIn={signedIn} />
        ))}
      </div>
    </section>
  );
}
