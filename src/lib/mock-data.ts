import type {
  CanonicalProduct,
  Listing,
  MatchReviewCase,
  Recommendation,
  SavedProductAlert,
} from "./types";

export const canonicalProduct: CanonicalProduct = {
  id: "cp-apex-ah4200",
  brand: { id: "brand-apex", name: "Apex Home", slug: "apex-home" },
  category: { id: "cat-appliances", name: "Appliances", slug: "appliances" },
  modelName: "Apex Home Quiet Dishwasher",
  modelNumber: "AH-4200",
  configuration: "Standard, Matte Black",
  imageUrl: "/window.svg",
  identifiers: [
    { type: "UPC", value: "012345678905" },
    { type: "MPN", value: "AH-4200" },
  ],
  attributes: [
    { key: "Noise level", value: "42", unit: "dB" },
    { key: "Capacity", value: "14", unit: "place settings" },
    { key: "Color", value: "Matte black" },
  ],
};

export const listings: Listing[] = [
  {
    id: "listing-official",
    sourceId: "src-official",
    sourceName: "Official Brand Store",
    canonicalProductId: canonicalProduct.id,
    condition: "new",
    price: 899.0,
    verifiedDiscount: 0,
    shipping: 0,
    mandatoryFees: 0,
    deliveryLabel: "Thu, free",
    pickupAvailable: false,
    warrantyLabel: "2-year warranty",
    returnWindowDays: 30,
    productRating: { value: 4.6, count: 812 },
    sellerRating: { value: 4.9, count: 5230 },
    freshnessMinutesAgo: 4,
    isStale: false,
    matchConfidence: 0.98,
    matchType: "exact",
  },
  {
    id: "listing-retailer-direct",
    sourceId: "src-retailer-direct",
    sourceName: "Retailer Direct",
    canonicalProductId: canonicalProduct.id,
    condition: "new",
    price: 879.99,
    verifiedDiscount: 20,
    shipping: 0,
    mandatoryFees: 0,
    deliveryLabel: "Tomorrow",
    pickupAvailable: false,
    warrantyLabel: "1-year warranty",
    returnWindowDays: 15,
    productRating: { value: 4.6, count: 812 },
    sellerRating: { value: 4.5, count: 1902 },
    freshnessMinutesAgo: 4,
    isStale: false,
    matchConfidence: 0.97,
    matchType: "exact",
  },
  {
    id: "listing-local-electronics",
    sourceId: "src-local-electronics",
    sourceName: "Local Electronics",
    canonicalProductId: canonicalProduct.id,
    condition: "open-box",
    price: 842.0,
    verifiedDiscount: 0,
    shipping: 0,
    mandatoryFees: 0,
    deliveryLabel: "Pickup today",
    pickupAvailable: true,
    warrantyLabel: "90-day warranty",
    returnWindowDays: 14,
    productRating: { value: 4.6, count: 812 },
    sellerRating: { value: 4.1, count: 340 },
    freshnessMinutesAgo: 4,
    isStale: false,
    matchConfidence: 0.95,
    matchType: "exact",
  },
  {
    id: "listing-authorized-outlet",
    sourceId: "src-authorized-outlet",
    sourceName: "Authorized Outlet",
    canonicalProductId: canonicalProduct.id,
    condition: "certified-refurbished",
    price: 799.0,
    verifiedDiscount: 0,
    shipping: 0,
    mandatoryFees: 0,
    deliveryLabel: "3-5 days",
    pickupAvailable: false,
    warrantyLabel: "1-year warranty",
    returnWindowDays: 30,
    productRating: { value: 4.6, count: 812 },
    sellerRating: { value: 4.3, count: 610 },
    freshnessMinutesAgo: 22,
    isStale: false,
    matchConfidence: 0.93,
    matchType: "exact",
  },
];

export const recommendations: Record<string, Recommendation> = {
  "listing-official": {
    listingId: "listing-official",
    rank: 1,
    label: "Best overall",
    totalKnownCost: 899.0,
    rationale:
      "This option fits your priorities best: new condition from the official brand store, delivery before your requested date, and the strongest warranty and return coverage.",
    tradeOff:
      "This option costs $19 more than the lowest-priced new listing, but provides faster delivery and stronger warranty coverage.",
    factors: [
      { label: "New condition from the official brand store", detail: "Sold and fulfilled by Apex Home directly.", positive: true },
      { label: "Delivery before your requested date", detail: "Arrives Thursday, free shipping.", positive: true },
      { label: "Full two-year manufacturer warranty", detail: "Longest warranty among compared offers.", positive: true },
      { label: "Thirty-day return window", detail: "Matches your risk tolerance.", positive: true },
    ],
    assumptions: ["Price excludes local sales tax.", "Delivery estimate assumes standard shipping zone."],
  },
  "listing-retailer-direct": {
    listingId: "listing-retailer-direct",
    rank: 2,
    label: "Lowest cost",
    totalKnownCost: 879.99,
    rationale: "Lowest total known cost among new-condition listings, with next-day delivery.",
    tradeOff: "Shorter warranty and return window than the official store.",
    factors: [
      { label: "Lowest new-condition price", detail: "$19.01 less than Official Brand Store.", positive: true },
      { label: "Shorter warranty", detail: "1-year vs 2-year at Official Brand Store.", positive: false },
    ],
    assumptions: ["Price excludes local sales tax."],
  },
  "listing-local-electronics": {
    listingId: "listing-local-electronics",
    rank: 3,
    label: "Fastest",
    totalKnownCost: 842.0,
    rationale: "Available for pickup today; fastest way to receive the product.",
    tradeOff: "Open-box condition and the shortest warranty and return window compared.",
    factors: [
      { label: "Pickup today", detail: "Ready for same-day collection.", positive: true },
      { label: "Open-box condition", detail: "Not new; inspect before purchase.", positive: false },
    ],
    assumptions: ["Pickup availability confirmed 4 minutes ago."],
  },
  "listing-authorized-outlet": {
    listingId: "listing-authorized-outlet",
    rank: 4,
    label: "Best value (refurbished)",
    totalKnownCost: 799.0,
    rationale: "Lowest total cost overall via a certified refurbished unit with a full year of warranty coverage.",
    tradeOff: "Certified refurbished, not new; longer delivery window.",
    factors: [
      { label: "Lowest total cost", detail: "$100 less than the official store.", positive: true },
      { label: "Certified refurbished", detail: "Inspected and certified by an authorized outlet.", positive: false },
    ],
    assumptions: ["Refurbishment certification provided by source at last sync, 22 minutes ago."],
  },
};

export const savedProducts: SavedProductAlert[] = [
  {
    id: "saved-1",
    canonicalProductId: "cp-air-purifier",
    productName: "Air purifier for large room",
    imageUrl: "/window.svg",
    currentValue: "$289.00",
    target: "≤ $250",
    alertType: "price-drop",
    status: "watching",
    sourceCoverage: 4,
    lastCheckedMinutesAgo: 8,
  },
  {
    id: "saved-2",
    canonicalProductId: "cp-running-shoe",
    productName: "Running shoe, size 9",
    imageUrl: "/window.svg",
    currentValue: "$124.99",
    target: "Back in stock",
    alertType: "back-in-stock",
    status: "triggered",
    sourceCoverage: 3,
    lastCheckedMinutesAgo: 8,
  },
  {
    id: "saved-3",
    canonicalProductId: "cp-cordless-vacuum",
    productName: "Cordless vacuum",
    imageUrl: "/window.svg",
    currentValue: "$449.00",
    target: "Any price drop",
    alertType: "any-change",
    status: "watching",
    sourceCoverage: 5,
    lastCheckedMinutesAgo: 8,
  },
];

export const matchReviewCases: MatchReviewCase[] = [
  {
    id: "review-1",
    canonicalProductName: "Apex Home AH-4200",
    candidateListingSource: "Discount Home Supply",
    confidence: 0.62,
    threshold: 0.9,
    attributes: [
      { attribute: "Brand", canonicalValue: "Apex Home", candidateValue: "Apex Home", result: "match" },
      { attribute: "Model number", canonicalValue: "AH-4200", candidateValue: "AH4200-B", result: "review" },
      { attribute: "UPC / GTIN", canonicalValue: "012345678905", candidateValue: "Not provided", result: "missing" },
      { attribute: "Colour", canonicalValue: "Matte black", candidateValue: "Graphite", result: "conflict" },
      { attribute: "Configuration", canonicalValue: "Standard", candidateValue: "Standard", result: "match" },
    ],
  },
];

export function getListingsWithRecommendations() {
  return listings
    .map((listing) => ({ listing, recommendation: recommendations[listing.id] }))
    .sort((a, b) => a.recommendation.rank - b.recommendation.rank);
}

export function totalKnownCost(listing: Listing) {
  return listing.price - listing.verifiedDiscount + listing.shipping + listing.mandatoryFees;
}
