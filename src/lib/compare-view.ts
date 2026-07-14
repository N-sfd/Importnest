import type { Priority } from "@/lib/types";

export type CompareListingView = {
  id: string;
  sourceName: string;
  condition: string;
  price: number;
  verifiedDiscount: number;
  shipping: number;
  mandatoryFees: number;
  deliveryLabel: string;
  pickupAvailable: boolean;
  warrantyLabel: string;
  returnWindowDays: number;
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
      return copy.sort((a, b) => b.listing.returnWindowDays - a.listing.returnWindowDays);
    case "best-overall":
    default:
      return copy.sort((a, b) => a.recommendation.rank - b.recommendation.rank);
  }
}

export function minutesSince(date: Date) {
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
}
