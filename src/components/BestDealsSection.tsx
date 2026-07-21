import Link from "next/link";
import {
  HOMEPAGE_DEMO_DEALS,
  type HomepageDemoDeal,
} from "@/data/homepage-demo-products";
import { homeDealImageFor } from "@/lib/images";
import { getProductDisplayImage } from "@/lib/product-images";
import type { BestDealItem } from "@/lib/best-deals";
import { DealProductCard, DemoDealCard } from "@/components/DealProductCard";

const TARGET_COUNT = 8;

function dealImageSrc(item: BestDealItem) {
  return (
    homeDealImageFor(item.productId, item.categorySlug, item.productName) ||
    getProductDisplayImage({
      productId: item.productId,
      categorySlug: item.categorySlug,
      title: item.productName,
    })
  );
}

function fillWithDemos(
  listingItems: BestDealItem[],
  demos: HomepageDemoDeal[],
  limit: number,
): Array<{ kind: "listing"; item: BestDealItem } | { kind: "demo"; item: HomepageDemoDeal }> {
  const usedNames = new Set(listingItems.map((i) => i.productName.toLowerCase()));
  const usedImages = new Set(listingItems.map((i) => dealImageSrc(i)));
  const out: Array<
    { kind: "listing"; item: BestDealItem } | { kind: "demo"; item: HomepageDemoDeal }
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

/** Idealo-inspired Best Deals — listing-backed first, seeded demo discounts after. */
export function BestDealsSection({
  items,
  signedIn,
}: {
  items: BestDealItem[];
  signedIn: boolean;
}) {
  const cards = fillWithDemos(items, HOMEPAGE_DEMO_DEALS, TARGET_COUNT);
  if (cards.length === 0) return null;

  const hasListings = cards.some((c) => c.kind === "listing");
  const hasDemos = cards.some((c) => c.kind === "demo");

  return (
    <section aria-labelledby="best-deals-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="best-deals-heading"
            className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl"
          >
            Best Deals
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {hasListings && hasDemos
              ? "Listing Total Known Cost when available; struck prices only from real history or labeled demo seeds."
              : hasListings
                ? "Totals include item + shipping + fees. Struck prices appear only from real price history."
                : "Labeled demo deals with seeded discounts — not live retailer offers."}
          </p>
        </div>
        <Link href="/search" className="text-sm font-semibold text-link hover:underline">
          See more deals
        </Link>
      </div>

      <ul className="section-grid mt-4">
        {cards.map((card) =>
          card.kind === "listing" ? (
            <li key={card.item.productId} className="min-w-0">
              <DealProductCard
                item={card.item}
                imageSrc={dealImageSrc(card.item)}
                signedIn={signedIn}
              />
            </li>
          ) : (
            <li key={card.item.id} className="min-w-0">
              <DemoDealCard item={card.item} />
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
