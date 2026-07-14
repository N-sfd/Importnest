import type { Priority } from "@/lib/types";

export type CompareListingView = {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  sourceTypeLabel: string;
  /** True when this listing's real merchant (sellerName) differs from the
   *  connector/feed it was synced through — e.g. a UPC-lookup connector
   *  surfacing a Newegg or Best Buy offer. The connector's own sourceType
   *  ("manufacturer-feed", icon, etc.) describes the feed, not that merchant,
   *  so callers should avoid presenting feed-level metadata as if it were
   *  retailer-level metadata when this is true. */
  hasDistinctSeller: boolean;
  freshnessMinutesAgo: number;
  dataCompletenessPct: number;
  url?: string;
  isAuthorizedSource: boolean;
  condition: string;
  price: number;
  verifiedDiscount: number;
  shipping: number;
  mandatoryFees: number;
  deliveryLabel: string;
  pickupAvailable: boolean;
  warrantyLabel: string;
  returnPolicyLabel: string;
};

export type CompareSourceSummary = {
  sourceId: string;
  sourceName: string;
  sourceTypeLabel: string;
  listingCount: number;
  freshnessMinutesAgo: number | null;
};

export type CompareRecommendationView = {
  listingId: string;
  rank: number;
  label: string;
  rationale: string;
  tradeOff?: string;
  factors: { label: string; detail: string; positive: boolean }[];
  assumptions: string[];
};

export type CompareRow = {
  listing: CompareListingView;
  recommendation: CompareRecommendationView;
};

export function totalKnownCost(listing: {
  price: number;
  verifiedDiscount: number;
  shipping: number;
  mandatoryFees: number;
}) {
  return listing.price - listing.verifiedDiscount + listing.shipping + listing.mandatoryFees;
}

export function sortCompareRows(rows: CompareRow[], priority: Priority): CompareRow[] {
  const copy = [...rows];
  switch (priority) {
    case "lowest-cost":
      return copy.sort((a, b) => totalKnownCost(a.listing) - totalKnownCost(b.listing));
    case "fastest-delivery":
      return copy.sort((a, b) =>
        a.listing.pickupAvailable === b.listing.pickupAvailable
          ? 0
          : a.listing.pickupAvailable
            ? -1
            : 1,
      );
    case "best-returns":
      // No structured return-policy data is available yet (see returnPolicyLabel
      // fallback in compare-data.ts), so this falls back to overall rank rather
      // than fabricating a ranking signal that doesn't exist.
      return copy.sort((a, b) => a.recommendation.rank - b.recommendation.rank);
    case "best-overall":
    default:
      return copy.sort((a, b) => a.recommendation.rank - b.recommendation.rank);
  }
}

export function minutesSince(date: Date) {
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
}
