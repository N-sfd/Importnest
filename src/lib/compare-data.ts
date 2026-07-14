import { prisma } from "@/lib/prisma";
import type {
  CompareListingView,
  CompareRecommendationView,
  CompareRow,
} from "@/lib/compare-view";
import { minutesSince } from "@/lib/compare-view";

export type { CompareListingView, CompareRecommendationView, CompareRow };
export { totalKnownCost, sortCompareRows, minutesSince } from "@/lib/compare-view";

/** Schema does not yet store warranty / returns / discounts — enrich for UI. */
function enrichListing(input: {
  id: string;
  condition: string;
  price: number;
  shipping: number;
  fees: number;
  deliveryLabel: string | null;
  sourceName: string;
}): CompareListingView {
  const deliveryLabel = input.deliveryLabel ?? "—";
  const pickupAvailable = /pickup/i.test(deliveryLabel);

  const byId: Record<
    string,
    { verifiedDiscount: number; warrantyLabel: string; returnWindowDays: number }
  > = {
    "listing-official": {
      verifiedDiscount: 0,
      warrantyLabel: "2-year warranty",
      returnWindowDays: 30,
    },
    "listing-retailer-direct": {
      verifiedDiscount: 20,
      warrantyLabel: "1-year warranty",
      returnWindowDays: 15,
    },
    "listing-local-electronics": {
      verifiedDiscount: 0,
      warrantyLabel: "90-day warranty",
      returnWindowDays: 14,
    },
    "listing-authorized-outlet": {
      verifiedDiscount: 0,
      warrantyLabel: "1-year warranty",
      returnWindowDays: 30,
    },
  };

  const defaults = byId[input.id] ?? {
    verifiedDiscount: 0,
    warrantyLabel:
      input.condition === "new"
        ? "1-year warranty"
        : input.condition === "open-box"
          ? "90-day warranty"
          : "1-year warranty",
    returnWindowDays: input.condition === "new" ? 30 : 14,
  };

  return {
    id: input.id,
    sourceName: input.sourceName,
    condition: input.condition,
    price: input.price,
    verifiedDiscount: defaults.verifiedDiscount,
    shipping: input.shipping,
    mandatoryFees: input.fees,
    deliveryLabel,
    pickupAvailable,
    warrantyLabel: defaults.warrantyLabel,
    returnWindowDays: defaults.returnWindowDays,
  };
}

const tradeOffs: Record<string, string> = {
  "listing-official":
    "This option costs $19 more than the lowest-priced new listing, but provides faster delivery and stronger warranty coverage.",
  "listing-retailer-direct": "Shorter warranty and return window than the official store.",
  "listing-local-electronics":
    "Open-box condition and the shortest warranty and return window compared.",
  "listing-authorized-outlet": "Certified refurbished, not new; longer delivery window.",
};

const assumptionsByListing: Record<string, string[]> = {
  "listing-official": [
    "Price excludes local sales tax.",
    "Delivery estimate assumes standard shipping zone.",
  ],
  "listing-retailer-direct": ["Price excludes local sales tax."],
  "listing-local-electronics": ["Pickup availability confirmed at last sync."],
  "listing-authorized-outlet": [
    "Refurbishment certification provided by source at last sync.",
  ],
};

export async function getCompareProduct(productId: string) {
  return prisma.canonicalProduct.findUnique({
    where: { id: productId },
    include: {
      brand: true,
      category: true,
      matches: {
        where: { status: "approved" },
        orderBy: { confidence: "desc" },
        take: 1,
      },
    },
  });
}

export async function getCompareRows(productId: string): Promise<CompareRow[]> {
  const listings = await prisma.listing.findMany({
    where: {
      canonicalProductId: productId,
      matches: { some: { status: "approved" } },
    },
    include: {
      source: true,
      recommendations: {
        include: { factors: true },
        orderBy: { rank: "asc" },
        take: 1,
      },
    },
  });

  return listings
    .filter((l) => l.recommendations[0])
    .map((l) => {
      const rec = l.recommendations[0]!;
      const listing = enrichListing({
        id: l.id,
        condition: l.condition,
        price: l.price,
        shipping: l.shipping,
        fees: l.fees,
        deliveryLabel: l.deliveryLabel,
        sourceName: l.source.name,
      });
      return {
        listing,
        recommendation: {
          listingId: l.id,
          rank: rec.rank,
          label: rec.label,
          rationale: rec.rationale,
          tradeOff: tradeOffs[l.id],
          factors: rec.factors.map((f) => ({
            label: f.label,
            detail: f.detail,
            positive: f.positive,
          })),
          assumptions: assumptionsByListing[l.id] ?? ["Price excludes local sales tax."],
        },
      };
    })
    .sort((a, b) => a.recommendation.rank - b.recommendation.rank);
}

export async function getListingExplanation(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      source: true,
      recommendations: {
        include: { factors: true },
        orderBy: { rank: "asc" },
        take: 1,
      },
    },
  });
  if (!listing || !listing.recommendations[0]) return null;

  const view = enrichListing({
    id: listing.id,
    condition: listing.condition,
    price: listing.price,
    shipping: listing.shipping,
    fees: listing.fees,
    deliveryLabel: listing.deliveryLabel,
    sourceName: listing.source.name,
  });

  const rec = listing.recommendations[0];
  return {
    listing: view,
    recommendation: {
      listingId: listing.id,
      rank: rec.rank,
      label: rec.label,
      rationale: rec.rationale,
      tradeOff: tradeOffs[listing.id],
      factors: rec.factors.map((f) => ({
        label: f.label,
        detail: f.detail,
        positive: f.positive,
      })),
      assumptions: assumptionsByListing[listing.id] ?? ["Price excludes local sales tax."],
    } satisfies CompareRecommendationView,
    freshnessMinutesAgo: minutesSince(listing.freshnessCapturedAt),
  };
}
