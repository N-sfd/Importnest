// Types mirror the Business Data Dictionary in Importnest BRD Section 13.4.
// These are the shapes used by mock data now, and by Prisma-backed queries later.

export type Condition = "new" | "open-box" | "used" | "refurbished" | "certified-refurbished";

export type Priority = "best-overall" | "lowest-cost" | "fastest-delivery" | "best-returns";

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CanonicalProduct {
  id: string;
  brand: Brand;
  category: Category;
  modelName: string;
  modelNumber?: string;
  configuration?: string;
  imageUrl: string;
  identifiers: { type: "UPC" | "GTIN" | "MPN"; value: string }[];
  attributes: { key: string; value: string; unit?: string }[];
}

export interface Source {
  id: string;
  name: string;
  sourceType: "retailer-api" | "affiliate-feed" | "manufacturer-feed" | "partner-feed" | "licensed-provider";
  isActive: boolean;
}

export interface Listing {
  id: string;
  sourceId: string;
  sourceName: string;
  canonicalProductId: string;
  condition: Condition;
  price: number;
  verifiedDiscount: number;
  shipping: number;
  mandatoryFees: number;
  deliveryLabel: string;
  pickupAvailable: boolean;
  warrantyLabel: string;
  returnWindowDays: number;
  productRating?: { value: number; count: number };
  sellerRating?: { value: number; count: number };
  retailerRating?: { value: number; count: number };
  freshnessMinutesAgo: number;
  isStale: boolean;
  matchConfidence: number; // 0..1
  matchType: "exact" | "comparable" | "unmatched";
  sponsored?: { campaign: string; label: string };
}

export interface RecommendationFactor {
  label: string;
  detail: string;
  positive: boolean;
}

export interface Recommendation {
  listingId: string;
  rank: number;
  label: string;
  totalKnownCost: number;
  rationale: string;
  tradeOff?: string;
  factors: RecommendationFactor[];
  assumptions: string[];
}

export interface SavedProductAlert {
  id: string;
  canonicalProductId: string;
  productName: string;
  imageUrl: string;
  currentValue: string;
  target: string;
  alertType: "price-drop" | "back-in-stock" | "any-change";
  status: "watching" | "triggered" | "paused";
  sourceCoverage: number;
  lastCheckedMinutesAgo: number;
}

export interface MatchReviewAttribute {
  attribute: string;
  canonicalValue: string;
  candidateValue: string;
  result: "match" | "review" | "missing" | "conflict";
}

export interface MatchReviewCase {
  id: string;
  canonicalProductName: string;
  candidateListingSource: string;
  confidence: number;
  threshold: number;
  attributes: MatchReviewAttribute[];
}