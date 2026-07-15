import { prisma } from "@/lib/prisma";
import type {
  CompareListingView,
  CompareRecommendationView,
  CompareRow,
  CompareSourceSummary,
} from "@/lib/compare-view";
import {
  FALLBACK_COPY,
  buildRecommendationPanel,
  conditionRank,
  isSafeRetailerUrl,
  minutesSince,
  overallScore,
  protectionScore,
  rankingFactorsForListing,
  totalKnownCost,
} from "@/lib/compare-view";
import type { Priority } from "@/lib/types";

export type { CompareListingView, CompareRecommendationView, CompareRow, CompareSourceSummary };
export {
  FALLBACK_COPY,
  totalKnownCost,
  sortCompareRows,
  minutesSince,
  isSafeRetailerUrl,
  formatFreshness,
  formatConditionLabel,
  PRIORITY_LABELS,
  buildRecommendationPanel,
} from "@/lib/compare-view";

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
  const hasDistinctSeller = Boolean(sellerName) && sellerName !== l.source.name;
  const pickupAvailable = /pickup/i.test(deliveryLabel);
  const safeUrl = isSafeRetailerUrl(l.url) ? (l.url as string) : undefined;

  const view: CompareListingView = {
    id: l.id,
    sourceId: l.sourceId,
    sourceName: sellerName || l.source.name || FALLBACK_COPY.retailer,
    sourceType: l.source.sourceType,
    sourceTypeLabel: hasDistinctSeller ? "" : sourceTypeLabel(l.source.sourceType),
    hasDistinctSeller,
    freshnessMinutesAgo: minutesSince(l.freshnessCapturedAt),
    dataCompletenessPct: 0,
    url: safeUrl,
    isAuthorizedSource: !hasDistinctSeller && AUTHORIZED_SOURCE_TYPES.has(l.source.sourceType),
    condition: l.condition || FALLBACK_COPY.condition,
    price: l.price,
    verifiedDiscount: 0,
    shipping: l.shipping,
    mandatoryFees: l.fees,
    deliveryLabel,
    pickupAvailable,
    availabilityLabel: pickupAvailable
      ? "Pickup available"
      : deliveryLabel !== FALLBACK_COPY.delivery
        ? "Listed for shipping"
        : FALLBACK_COPY.availability,
    warrantyLabel: FALLBACK_COPY.warranty,
    returnPolicyLabel: FALLBACK_COPY.returns,
  };

  view.dataCompletenessPct = listingCompleteness(view);
  return view;
}

function computeRecommendations(
  listings: CompareListingView[],
  priority: Priority = "best-overall",
): Map<string, CompareRecommendationView> {
  const ranked = [...listings].sort((a, b) => {
    if (priority === "lowest-cost") return totalKnownCost(a) - totalKnownCost(b);
    if (priority === "fastest-delivery") {
      const p = Number(b.pickupAvailable) - Number(a.pickupAvailable);
      return p !== 0 ? p : totalKnownCost(a) - totalKnownCost(b);
    }
    if (priority === "best-condition") {
      const c = conditionRank(a.condition) - conditionRank(b.condition);
      return c !== 0 ? c : totalKnownCost(a) - totalKnownCost(b);
    }
    if (priority === "best-protection") {
      const p = protectionScore(b) - protectionScore(a);
      return p !== 0 ? p : totalKnownCost(a) - totalKnownCost(b);
    }
    return overallScore(b) - overallScore(a);
  });

  const map = new Map<string, CompareRecommendationView>();
  const draftRows: CompareRow[] = ranked.map((listing, index) => ({
    listing,
    recommendation: {
      listingId: listing.id,
      rank: index + 1,
      label: "Alternative option",
      rationale: "",
      factors: [],
      tradeOffs: [],
      missingInformation: [],
      assumptions: [],
    },
  }));

  const panel = buildRecommendationPanel(draftRows, priority);

  ranked.forEach((listing, index) => {
    const isBest = index === 0;
    const { positive, tradeOffs } = rankingFactorsForListing(listing, ranked, priority);
    const cost = totalKnownCost(listing);
    const bestCost = ranked[0] ? totalKnownCost(ranked[0]) : cost;
    const costDelta = cost - bestCost;
    const missingInformation = [
      ...(listing.warrantyLabel === FALLBACK_COPY.warranty
        ? ["Warranty details not provided by this source"]
        : []),
      ...(listing.returnPolicyLabel === FALLBACK_COPY.returns
        ? ["Return period not provided by this source"]
        : []),
      ...(listing.deliveryLabel === FALLBACK_COPY.delivery
        ? ["Delivery estimate not available"]
        : []),
      ...(listing.availabilityLabel === FALLBACK_COPY.availability
        ? ["Stock status not confirmed"]
        : []),
      ...(!listing.url ? ["Direct retailer link not available"] : []),
    ];

    map.set(listing.id, {
      listingId: listing.id,
      rank: index + 1,
      label: isBest && panel ? panel.label : "Alternative option",
      rationale:
        isBest && panel
          ? panel.rationale
          : `$${costDelta.toFixed(2)} more than the top-ranked option for this priority.`,
      tradeOff: isBest
        ? tradeOffs[0]?.detail
        : `This option costs $${costDelta.toFixed(2)} more than the top-ranked listing for this priority.`,
      factors: [...positive, ...tradeOffs],
      tradeOffs,
      missingInformation,
      assumptions: [
        "Price excludes local sales tax.",
        ...(listing.pickupAvailable ? ["Pickup availability confirmed at last sync."] : []),
      ],
    });
  });

  return map;
}

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
  condition?: "new" | "open_box" | "refurbished" | "used";
  requireFastDelivery?: boolean;
};

function conditionMatchesFilter(
  listingCondition: string,
  filter: CompareFilters["condition"],
): boolean {
  if (!filter) return true;
  if (filter === "open_box") return listingCondition === "open-box";
  if (filter === "refurbished") {
    return listingCondition === "refurbished" || listingCondition === "certified-refurbished";
  }
  return listingCondition === filter;
}

export async function getCompareRows(
  productId: string,
  filters?: CompareFilters,
  priority?: Priority,
): Promise<CompareRow[]> {
  const allListings = (await getMatchedListings(productId)).map(enrichListing);
  const listings = filters
    ? allListings.filter(
        (l) =>
          (filters.maxBudget == null || totalKnownCost(l) <= filters.maxBudget) &&
          conditionMatchesFilter(l.condition, filters.condition) &&
          (!filters.requireFastDelivery || l.pickupAvailable),
      )
    : allListings;

  const recommendations = computeRecommendations(listings, priority);

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

export type ProductPriceHistoryPoint = {
  day: string;
  total: number;
};

export type ProductPriceHistorySummary = {
  /** Present only when at least two history points exist */
  points: ProductPriceHistoryPoint[];
  currentLowest: number | null;
  previousPrice: number | null;
  lowestRecorded: number | null;
  lastChange: number | null;
  lastChangeAt: string | null;
};

/**
 * Builds a daily price-history summary from real PriceHistory rows.
 * Chart points are empty unless ≥2 daily buckets exist.
 */
export async function getProductPriceHistory(
  productId: string,
  currentLowest: number | null,
): Promise<ProductPriceHistorySummary> {
  const listings = await prisma.listing.findMany({
    where: {
      canonicalProductId: productId,
      matches: { some: { status: "approved" } },
    },
    select: { id: true },
  });
  const listingIds = listings.map((l) => l.id);
  if (listingIds.length === 0) {
    return {
      points: [],
      currentLowest,
      previousPrice: null,
      lowestRecorded: null,
      lastChange: null,
      lastChangeAt: null,
    };
  }

  const rows = await prisma.priceHistory.findMany({
    where: { listingId: { in: listingIds } },
    select: { price: true, shipping: true, capturedAt: true },
    orderBy: { capturedAt: "asc" },
  });

  const byDay = new Map<string, number>();
  for (const row of rows) {
    const day = row.capturedAt.toISOString().slice(0, 10);
    const total = row.price + row.shipping;
    const existing = byDay.get(day);
    if (existing == null || total < existing) byDay.set(day, total);
  }

  const points = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, total]) => ({ day, total }));

  if (points.length < 2) {
    return {
      points: [],
      currentLowest,
      previousPrice: null,
      lowestRecorded: null,
      lastChange: null,
      lastChangeAt: null,
    };
  }

  const latest = points[points.length - 1]!;
  const previous = points[points.length - 2]!;
  const lowestRecorded = Math.min(...points.map((p) => p.total));
  const effectiveCurrent = currentLowest ?? latest.total;

  return {
    points,
    currentLowest: effectiveCurrent,
    previousPrice: previous.total,
    lowestRecorded,
    lastChange: effectiveCurrent - previous.total,
    lastChangeAt: latest.day,
  };
}
