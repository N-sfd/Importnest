import { prisma } from "@/lib/prisma";
import { minutesSince } from "@/lib/compare-view";
import { productImageFor } from "@/lib/images";

export type BestDealItem = {
  productId: string;
  brandName: string;
  productName: string;
  imageSrc: string;
  currentTotal: number;
  /** Previous daily Total Known Cost when real PriceHistory supports it. */
  previousTotal: number | null;
  /** Percent drop vs previousTotal when previous > current; otherwise null. */
  discountPercent: number | null;
  dealBadge: string;
  offerCount: number;
  isSaved: boolean;
  freshnessMinutesAgo: number;
};

/**
 * Best deals from live approved listings.
 * Old price / % off appear only when PriceHistory has a higher prior day total.
 */
export async function getBestDeals(
  limit = 6,
  savedProductIds: Set<string> = new Set(),
): Promise<BestDealItem[]> {
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
      freshnessCapturedAt: true,
    },
  });

  type Agg = {
    listingIds: string[];
    offerCount: number;
    currentTotal: number;
    freshestAt: Date;
  };

  const byProduct = new Map<string, Agg>();
  for (const listing of listings) {
    const id = listing.canonicalProductId;
    if (!id) continue;
    const total = listing.price + listing.shipping + listing.fees;
    const existing = byProduct.get(id);
    if (!existing) {
      byProduct.set(id, {
        listingIds: [listing.id],
        offerCount: 1,
        currentTotal: total,
        freshestAt: listing.freshnessCapturedAt,
      });
      continue;
    }
    existing.listingIds.push(listing.id);
    existing.offerCount += 1;
    existing.currentTotal = Math.min(existing.currentTotal, total);
    if (listing.freshnessCapturedAt > existing.freshestAt) {
      existing.freshestAt = listing.freshnessCapturedAt;
    }
  }

  const productIds = [...byProduct.keys()];
  if (productIds.length === 0) return [];

  const history = await prisma.priceHistory.findMany({
    where: {
      listingId: { in: listings.map((l) => l.id) },
    },
    select: { listingId: true, price: true, shipping: true, capturedAt: true },
    orderBy: { capturedAt: "asc" },
  });

  const listingToProduct = new Map(
    listings
      .filter((l) => l.canonicalProductId)
      .map((l) => [l.id, l.canonicalProductId!]),
  );

  const previousByProduct = new Map<string, number>();
  const byDay = new Map<string, Map<string, number>>();
  for (const row of history) {
    const productId = listingToProduct.get(row.listingId);
    if (!productId) continue;
    const day = row.capturedAt.toISOString().slice(0, 10);
    const total = row.price + row.shipping;
    let days = byDay.get(productId);
    if (!days) {
      days = new Map();
      byDay.set(productId, days);
    }
    const existing = days.get(day);
    if (existing == null || total < existing) days.set(day, total);
  }
  for (const [productId, days] of byDay) {
    const points = [...days.entries()].sort(([a], [b]) => a.localeCompare(b));
    if (points.length < 2) continue;
    const previous = points[points.length - 2]![1];
    previousByProduct.set(productId, previous);
  }

  const products = await prisma.canonicalProduct.findMany({
    where: { id: { in: productIds } },
    include: { brand: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  const scored = productIds.flatMap((id) => {
    const product = productById.get(id);
    const agg = byProduct.get(id);
    if (!product || !agg) return [];

    const previousTotal = previousByProduct.get(id) ?? null;
    const discountPercent =
      previousTotal != null && previousTotal > agg.currentTotal + 0.009
        ? Math.round(((previousTotal - agg.currentTotal) / previousTotal) * 100)
        : null;

    let dealBadge = "Multi-offer";
    if (discountPercent != null && discountPercent > 0) {
      dealBadge = `${discountPercent}% lower`;
    } else if (agg.offerCount >= 4) {
      dealBadge = "Most offers";
    } else if (agg.offerCount >= 2) {
      dealBadge = "Compare totals";
    }

    return [
      {
        productId: id,
        brandName: product.brand.name,
        productName: product.modelName,
        imageSrc: productImageFor(id),
        currentTotal: agg.currentTotal,
        previousTotal: discountPercent != null ? previousTotal : null,
        discountPercent,
        dealBadge,
        offerCount: agg.offerCount,
        isSaved: savedProductIds.has(id),
        freshnessMinutesAgo: minutesSince(agg.freshestAt),
      },
    ];
  });

  // Real discount% takes full priority — a product with a genuine price drop
  // always outranks one without, regardless of offer count. Offer count is
  // only a tiebreaker among products with the same (or no) discount.
  return scored
    .sort((a, b) => {
      const discountDiff = (b.discountPercent ?? -1) - (a.discountPercent ?? -1);
      if (discountDiff !== 0) return discountDiff;
      if (b.offerCount !== a.offerCount) return b.offerCount - a.offerCount;
      return a.currentTotal - b.currentTotal;
    })
    .slice(0, limit);
}
