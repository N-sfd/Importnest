import { prisma } from "@/lib/prisma";
import { minutesSince } from "@/lib/compare-view";
import { productImageFor } from "@/lib/images";

export type PopularComparison = {
  productId: string;
  brandName: string;
  productName: string;
  categorySlug: string;
  imageSrc: string;
  lowestTotalCost: number;
  offerCount: number;
  freshnessMinutesAgo: number;
  /** Real seeded average rating from CanonicalProduct.averageRating — never fabricated at render time. */
  rating: number | null;
  isSaved: boolean;
  /** The specific listing backing lowestTotalCost — used to add this exact offer to cart without inventing data. */
  bestListing: {
    listingId: string;
    sourceName: string;
    condition: string;
    price: number;
    shipping: number;
    fees: number;
  };
};

/**
 * Products with the most approved listings, ranked by offer count then freshness.
 * Prices and freshness come only from live listing rows — no placeholders.
 */
export async function getPopularComparisons(
  limit = 4,
  savedProductIds: Set<string> = new Set(),
): Promise<PopularComparison[]> {
  const listings = await prisma.listing.findMany({
    where: {
      canonicalProductId: { not: null },
      matches: { some: { status: "approved" } },
    },
    select: {
      id: true,
      canonicalProductId: true,
      price: true,
      shipping: true,
      fees: true,
      condition: true,
      freshnessCapturedAt: true,
      source: { select: { name: true } },
    },
  });

  type Agg = {
    offerCount: number;
    lowestTotalCost: number;
    freshestAt: Date;
    bestListing: PopularComparison["bestListing"];
  };

  const byProduct = new Map<string, Agg>();
  for (const listing of listings) {
    const id = listing.canonicalProductId;
    if (!id) continue;
    const total = listing.price + listing.shipping + listing.fees;
    const bestListing: PopularComparison["bestListing"] = {
      listingId: listing.id,
      sourceName: listing.source.name,
      condition: listing.condition,
      price: listing.price,
      shipping: listing.shipping,
      fees: listing.fees,
    };
    const existing = byProduct.get(id);
    if (!existing) {
      byProduct.set(id, {
        offerCount: 1,
        lowestTotalCost: total,
        freshestAt: listing.freshnessCapturedAt,
        bestListing,
      });
      continue;
    }
    existing.offerCount += 1;
    if (total < existing.lowestTotalCost) {
      existing.lowestTotalCost = total;
      existing.bestListing = bestListing;
    }
    if (listing.freshnessCapturedAt > existing.freshestAt) {
      existing.freshestAt = listing.freshnessCapturedAt;
    }
  }

  const rankedIds = [...byProduct.entries()]
    .sort((a, b) => {
      if (b[1].offerCount !== a[1].offerCount) return b[1].offerCount - a[1].offerCount;
      return b[1].freshestAt.getTime() - a[1].freshestAt.getTime();
    })
    .slice(0, limit)
    .map(([id]) => id);

  if (rankedIds.length === 0) return [];

  const products = await prisma.canonicalProduct.findMany({
    where: { id: { in: rankedIds } },
    include: { brand: true, category: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  return rankedIds.flatMap((id) => {
    const product = productById.get(id);
    const agg = byProduct.get(id);
    if (!product || !agg) return [];
    return [
      {
        productId: id,
        brandName: product.brand.name,
        productName: product.modelName,
        categorySlug: product.category.slug,
        imageSrc: productImageFor(id, product.category.slug, product.modelName),
        lowestTotalCost: agg.lowestTotalCost,
        offerCount: agg.offerCount,
        freshnessMinutesAgo: minutesSince(agg.freshestAt),
        rating: product.averageRating,
        isSaved: savedProductIds.has(id),
        bestListing: agg.bestListing,
      },
    ];
  });
}

export function freshnessLabel(minutesAgo: number): string {
  if (minutesAgo <= 0) return "Updated just now";
  if (minutesAgo === 1) return "Updated 1 minute ago";
  if (minutesAgo < 60) return `Updated ${minutesAgo} minutes ago`;
  const hours = Math.round(minutesAgo / 60);
  if (hours === 1) return "Updated 1 hour ago";
  if (hours < 48) return `Updated ${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Updated 1 day ago" : `Updated ${days} days ago`;
}
