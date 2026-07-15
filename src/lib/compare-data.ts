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
  hasStructuredProtectionData,
  isSafeRetailerUrl,
  minutesSince,
  rankingFactorsForListing,
  sortCompareRows,
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

/** Wraps sortCompareRows so listing ordering has exactly one implementation, reused server-side everywhere. */
function sortListings(listings: CompareListingView[], priority: Priority): CompareListingView[] {
  const wrapped: CompareRow[] = listings.map((listing) => ({
    listing,
    recommendation: {
      listingId: listing.id,
      rank: 0,
      label: "Alternative option",
      rationale: "",
      factors: [],
      tradeOffs: [],
      missingInformation: [],
      assumptions: [],
    },
  }));
  return sortCompareRows(wrapped, priority).map((r) => r.listing);
}

function computeRecommendations(
  listings: CompareListingView[],
  priority: Priority = "best-overall",
): Map<string, CompareRecommendationView> {
  const ranked = sortListings(listings, priority);

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

/**
 * Whether "Best protection" is a meaningful sort for this product — i.e. at
 * least one compared listing has a real structured warranty/return fact.
 * Callers should hide or disable the priority option entirely when this is
 * false rather than sort by a signal nothing actually has.
 */
export async function supportsBestProtection(productId: string): Promise<boolean> {
  const listings = (await getMatchedListings(productId)).map(enrichListing);
  return hasStructuredProtectionData(listings);
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
  /** True when chart uses illustrative demo trend (not enough real samples yet). */
  isIllustrative?: boolean;
};

/**
 * Builds a daily price-history summary from real PriceHistory rows.
 * For popular demo products with thin history, falls back to an illustrative
 * trend so first-time visitors see the feature working.
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
    return demoPriceHistory(productId, currentLowest) ?? emptyHistory(currentLowest);
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
    return demoPriceHistory(productId, currentLowest) ?? emptyHistory(currentLowest);
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
    isIllustrative: false,
  };
}

function emptyHistory(currentLowest: number | null): ProductPriceHistorySummary {
  return {
    points: [],
    currentLowest,
    previousPrice: null,
    lowestRecorded: null,
    lastChange: null,
    lastChangeAt: null,
    isIllustrative: false,
  };
}

/** Seeded demo products — illustrative 14-day curve when DB history is thin. */
const DEMO_BASELINE: Record<string, number> = {
  "cp-apex-ah4200": 899,
  "cp-running-shoe": 129,
  "cp-air-purifier": 249,
  "cp-cordless-vacuum": 289,
};

function demoPriceHistory(
  productId: string,
  currentLowest: number | null,
): ProductPriceHistorySummary | null {
  const baseline = DEMO_BASELINE[productId];
  if (baseline == null) return null;

  const end = currentLowest ?? baseline;
  const offsets = [0.08, 0.06, 0.07, 0.05, 0.04, 0.055, 0.03, 0.045, 0.02, 0.035, 0.015, 0.025, 0.01, 0];
  const points: ProductPriceHistoryPoint[] = offsets.map((pct, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (offsets.length - 1 - i));
    return {
      day: d.toISOString().slice(0, 10),
      total: Math.round((end * (1 + pct)) * 100) / 100,
    };
  });
  // Force last point to the live lowest so the chart lands on today's total.
  points[points.length - 1]!.total = Math.round(end * 100) / 100;

  const previous = points[points.length - 2]!;
  const latest = points[points.length - 1]!;
  return {
    points,
    currentLowest: end,
    previousPrice: previous.total,
    lowestRecorded: Math.min(...points.map((p) => p.total)),
    lastChange: latest.total - previous.total,
    lastChangeAt: latest.day,
    isIllustrative: true,
  };
}
