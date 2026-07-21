import Link from "next/link";
import {
  HOMEPAGE_DEMO_TOP_PRODUCTS,
  type HomepageDemoTopProduct,
} from "@/data/homepage-demo-products";
import { homeTopProductImageFor } from "@/lib/images";
import { getProductDisplayImage } from "@/lib/product-images";
import type { PopularComparison } from "@/lib/popular-comparisons";
import { DemoTopProductCard, TopProductCard } from "@/components/TopProductCard";

const TARGET_COUNT = 8;

export type TopProductCardData = PopularComparison;

function topImageSrc(item: PopularComparison) {
  return (
    homeTopProductImageFor(item.productId, item.categorySlug, item.productName) ||
    getProductDisplayImage({
      productId: item.productId,
      categorySlug: item.categorySlug,
      title: item.productName,
    })
  );
}

function fillWithDemos(
  listingItems: PopularComparison[],
  demos: HomepageDemoTopProduct[],
  limit: number,
): Array<
  | { kind: "listing"; item: PopularComparison }
  | { kind: "demo"; item: HomepageDemoTopProduct }
> {
  const usedNames = new Set(listingItems.map((i) => i.productName.toLowerCase()));
  const usedImages = new Set(listingItems.map((i) => topImageSrc(i)));
  const out: Array<
    | { kind: "listing"; item: PopularComparison }
    | { kind: "demo"; item: HomepageDemoTopProduct }
  > = listingItems.map((item) => ({ kind: "listing", item }));

  for (const demo of demos) {
    if (out.length >= limit) break;
    if (usedNames.has(demo.productName.toLowerCase())) continue;
    if (usedImages.has(demo.imageSrc)) continue;
    usedNames.add(demo.productName.toLowerCase());
    usedImages.add(demo.imageSrc);
    out.push({ kind: "demo", item: demo });
  }
  return out.slice(0, limit);
}

/** Idealo-inspired Top Products — listing-backed cards first, demo browse pads after. */
export function TopProductsSection({
  items,
  signedIn,
}: {
  items: PopularComparison[];
  signedIn: boolean;
}) {
  const cards = fillWithDemos(items, HOMEPAGE_DEMO_TOP_PRODUCTS, TARGET_COUNT);
  if (cards.length === 0) return null;

  const hasListings = cards.some((c) => c.kind === "listing");
  const hasDemos = cards.some((c) => c.kind === "demo");

  return (
    <section aria-labelledby="top-products-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="top-products-heading"
            className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl"
          >
            Top Products
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {hasListings && hasDemos
              ? "Approved listing totals plus labeled demo browse cards with distinct product photos."
              : hasListings
                ? "Most compared items from approved retailers — prices are Total Known Cost."
                : "Demo browse cards with distinct product photos — not live retailer offers."}
          </p>
        </div>
        <Link href="/search" className="text-sm font-semibold text-link hover:underline">
          Browse all
        </Link>
      </div>

      <ul className="section-grid mt-4">
        {cards.map((card, index) =>
          card.kind === "listing" ? (
            <li key={card.item.productId} className="min-w-0">
              <TopProductCard
                item={card.item}
                imageSrc={topImageSrc(card.item)}
                signedIn={signedIn}
                index={index}
              />
            </li>
          ) : (
            <li key={card.item.id} className="min-w-0">
              <DemoTopProductCard item={card.item} />
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
