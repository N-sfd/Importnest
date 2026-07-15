import { prisma } from "@/lib/prisma";
import type {
  CompareListingView,
  CompareRecommendationView,
  CompareRow,
  CompareSourceSummary,
} from "@/lib/compare-view";
import { minutesSince, totalKnownCost } from "@/lib/compare-view";

export type { CompareListingView, CompareRecommendationView, CompareRow, CompareSourceSummary };
export { totalKnownCost, sortCompareRows, minutesSince } from "@/lib/compare-view";

export const FALLBACK_COPY = {
  warranty: "Warranty information not provided",
  returns: "Return policy not provided",
  delivery: "Delivery estimate unavailable",
  condition: "Condition not specified",
  retailer: "Unknown retailer",
} as const;

const AUTHORIZED_SOURCE_TYPES = new Set(["manufacturer-feed", "official-api"]);

type ListingRecord = {
  id: string;
  sourceId: string;
  condition: string;
  price: number;
  shipping: number;
  fees: number;
  deliveryLabel: string | null;
  sellerName: string | null;
  url: string | null;
  freshnessCapturedAt: Date;
  source: { name: string; sourceType: string };
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  "manufacturer-feed": "Manufacturer feed",
  "affiliate-feed": "Affiliate feed",
  "official-api": "Official API",
  "partner-feed": "Partner feed",
  "licensed-provider": "Licensed provider",
  "web-extraction": "Web extraction",
  "retailer-api": "Retailer API",
};

function sourceTypeLabel(sourceType: string) {
  return SOURCE_TYPE_LABELS[sourceType] ?? sourceType.replace(/-/g, " ");
}

function enrichListing(l: ListingRecord): CompareListingView {
  const deliveryLabel = l.deliveryLabel?.trim() || FALLBACK_COPY.delivery;
  const sellerName = l.sellerName?.trim();
  // A connector like the UPC-lookup one syncs offers from many real merchants
  // under one Source row. When sellerName names a merchant different from
  // that Source, the feed's own sourceType/icon describes the connector, not
  // the merchant, and must not be presented (or trusted for "authorized
  // source" claims) as if it described that merchant.
  const hasDistinctSeller = Boolean(sellerName) && sellerName !== l.source.name;

  const view: CompareListingView = {
    id: l.id,
    sourceId: l.sourceId,
    sourceName: sellerName || l.source.name || FALLBACK_COPY.retailer,
    sourceType: l.source.sourceType,
    sourceTypeLabel: hasDistinctSeller ? "" : sourceTypeLabel(l.source.sourceType),
    hasDistinctSeller,
    freshnessMinutesAgo: minutesSince(l.freshnessCapturedAt),
    dataCompletenessPct: 0,
    url: l.url ?? undefined,
    isAuthorizedSource: !hasDistinctSeller && AUTHORIZED_SOURCE_TYPES.has(l.source.sourceType),
    condition: l.condition || FALLBACK_COPY.condition,
    price: l.price,
    verifiedDiscount: 0,
    shipping: l.shipping,
    mandatoryFees: l.fees,
    deliveryLabel,
    pickupAvailable: /pickup/i.test(deliveryLabel),
    warrantyLabel: FALLBACK_COPY.warranty,
    returnPolicyLabel: FALLBACK_COPY.returns,
  };

  view.dataCompletenessPct = listingCompleteness(view);
  return view;
}

/**
 * Computes recommendation rank/label/rationale/factors from the actual set of
 * listings for a product, instead of reading a hand-authored per-listing-id
 * table. This is what lets any newly synced product render a comparison
 * without needing manual copy written for it.
 */
function computeRecommendations(
  listings: CompareListingView[],
): Map<string, CompareRecommendationView> {
  const withCost = listings.map((listing) => ({ listing, cost: totalKnownCost(listing) }));
  const ranked = [...withCost].sort((a, b) => a.cost - b.cost);
  const cheapest = ranked[0];

  const map = new Map<string, CompareRecommendationView>();

  ranked.forEach(({ listing, cost }, index) => {
    const isCheapest = index === 0;
    const costDelta = cost - cheapest.cost;

    const factors: CompareRecommendationView["factors"] = [];
    if (isCheapest) {
      factors.push({
        label: "Lowest total cost",
        detail: `$${cost.toFixed(2)} total, the lowest among compared offers.`,
        positive: true,
      });
    }
    if (listing.pickupAvailable) {
      factors.push({
        label: "Pickup available",
        detail: "Local pickup can be faster than waiting for shipping.",
        positive: true,
      });
    }
    if (listing.isAuthorizedSource) {
      factors.push({
        label: "Official or authorized source",
        detail: "Sold directly by the manufacturer or an authorized channel.",
        positive: true,
      });
    }
    if (listing.condition !== "new") {
      factors.push({
        label: `${listing.condition.replace(/-/g, " ")} condition`,
        detail: "Lower price reflects non-new condition rather than a discount.",
        positive: false,
      });
    }

    const assumptions = [
      "Price excludes local sales tax.",
      ...(listing.pickupAvailable ? ["Pickup availability confirmed at last sync."] : []),
    ];

    map.set(listing.id, {
      listingId: listing.id,
      rank: index + 1,
      label: isCheapest ? "Best overall" : "Alternative option",
      rationale: isCheapest
        ? `Recommended because it has the lowest total known cost ($${cost.toFixed(2)}) among compared offers.`
        : `$${costDelta.toFixed(2)} more than the lowest total cost option.`,
      tradeOff: isCheapest
        ? undefined
        : `This option costs $${costDelta.toFixed(2)} more than the lowest-priced listing compared.`,
      factors,
      assumptions,
    });
  });

  return map;
}

/**
 * Rough internal signal for how much of a listing's display data is present.
 * Not shown to users yet — useful for spotting thin connector data during
 * development/monitoring.
 */
export function listingCompleteness(listing: CompareListingView): number {
  const checks = [
    listing.sourceName !== FALLBACK_COPY.retailer,
    listing.deliveryLabel !== FALLBACK_COPY.delivery,
    listing.warrantyLabel !== FALLBACK_COPY.warranty,
    listing.returnPolicyLabel !== FALLBACK_COPY.returns,
    Boolean(listing.url),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

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

async function getMatchedListings(productId: string): Promise<ListingRecord[]> {
  return prisma.listing.findMany({
    where: {
      canonicalProductId: productId,
      matches: { some: { status: "approved" } },
    },
    include: { source: true },
  });
}

export type CompareFilters = {
  maxBudget?: number;
  /** Uses SearchIntent's condition vocabulary (open_box, not open-box); "any" should be omitted by callers rather than passed through. */
  condition?: "new" | "open_box" | "refurbished" | "used";
};

function conditionMatchesFilter(listingCondition: string, filter: CompareFilters["condition"]): boolean {
  if (!filter) return true;
  if (filter === "open_box") return listingCondition === "open-box";
  if (filter === "refurbished") {
    return listingCondition === "refurbished" || listingCondition === "certified-refurbished";
  }
  return listingCondition === filter;
}

export async function getCompareRows(productId: string, filters?: CompareFilters): Promise<CompareRow[]> {
  const allListings = (await getMatchedListings(productId)).map(enrichListing);
  const listings = filters
    ? allListings.filter(
        (l) =>
          (filters.maxBudget == null || totalKnownCost(l) <= filters.maxBudget) &&
          conditionMatchesFilter(l.condition, filters.condition),
      )
    : allListings;

  // Recomputed over the filtered set so "lowest cost"/"best overall" reflect
  // what's actually shown, not an option the shopper's own filters excluded.
  const recommendations = computeRecommendations(listings);

  return listings
    .map((listing) => ({
      listing,
      recommendation: recommendations.get(listing.id)!,
    }))
    .sort((a, b) => a.recommendation.rank - b.recommendation.rank);
}

export async function getProductSourceSummaries(
  productId: string,
): Promise<CompareSourceSummary[]> {
  const listings = await prisma.listing.findMany({
    where: {
      canonicalProductId: productId,
      matches: { some: { status: "approved" } },
    },
    include: { source: true },
    orderBy: { freshnessCapturedAt: "desc" },
  });

  const bySource = new Map<string, CompareSourceSummary>();

  for (const listing of listings) {
    const existing = bySource.get(listing.sourceId);
    const freshness = minutesSince(listing.freshnessCapturedAt);

    if (!existing) {
      bySource.set(listing.sourceId, {
        sourceId: listing.sourceId,
        sourceName: listing.source.name,
        sourceTypeLabel: sourceTypeLabel(listing.source.sourceType),
        listingCount: 1,
        freshnessMinutesAgo: freshness,
      });
      continue;
    }

    existing.listingCount += 1;
    if (existing.freshnessMinutesAgo == null || freshness < existing.freshnessMinutesAgo) {
      existing.freshnessMinutesAgo = freshness;
    }
  }

  return [...bySource.values()].sort((a, b) => a.sourceName.localeCompare(b.sourceName));
}

export async function getListingExplanation(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { source: true },
  });
  if (!listing || !listing.canonicalProductId) return null;

  const siblings = await getMatchedListings(listing.canonicalProductId);
  const enriched = siblings.map(enrichListing);
  const recommendations = computeRecommendations(enriched);

  const view = enriched.find((l) => l.id === listingId);
  const recommendation = recommendations.get(listingId);
  if (!view || !recommendation) return null;

  return {
    listing: view,
    recommendation,
    freshnessMinutesAgo: minutesSince(listing.freshnessCapturedAt),
  };
}
