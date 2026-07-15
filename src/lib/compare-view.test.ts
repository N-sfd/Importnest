import { describe, expect, it } from "vitest";
import {
  buildRecommendationPanel,
  FALLBACK_COPY,
  NEUTRAL_RECOMMENDATION_LABEL,
  PRIORITY_LABELS,
  type CompareListingView,
  type CompareRow,
} from "@/lib/compare-view";
import { FRESHNESS_STALE_MINUTES } from "@/lib/freshness";

function makeListing(overrides: Partial<CompareListingView> = {}): CompareListingView {
  return {
    id: "listing-1",
    sourceId: "src-1",
    sourceName: "Example Retailer",
    sourceType: "affiliate-feed",
    sourceTypeLabel: "Affiliate feed",
    hasDistinctSeller: false,
    freshnessMinutesAgo: 5,
    dataCompletenessPct: 100,
    url: "https://example.com/offer",
    isAuthorizedSource: false,
    condition: "new",
    price: 100,
    verifiedDiscount: 0,
    shipping: 0,
    mandatoryFees: 0,
    deliveryLabel: "Tomorrow",
    pickupAvailable: false,
    availabilityLabel: "Listed for shipping",
    warrantyLabel: FALLBACK_COPY.warranty,
    returnPolicyLabel: FALLBACK_COPY.returns,
    ...overrides,
  };
}

function makeRow(listingOverrides: Partial<CompareListingView> = {}): CompareRow {
  const listing = makeListing(listingOverrides);
  return {
    listing,
    recommendation: {
      listingId: listing.id,
      rank: 1,
      label: "Alternative option",
      rationale: "",
      factors: [],
      tradeOffs: [],
      missingInformation: [],
      assumptions: [],
    },
  };
}

describe("buildRecommendationPanel — stale offers excluded from definitive ranking labels", () => {
  it("assigns the definitive priority label to a fresh top offer", () => {
    const rows = [makeRow({ id: "a", price: 50, freshnessMinutesAgo: 2 }), makeRow({ id: "b", price: 80 })];
    const panel = buildRecommendationPanel(rows, "lowest-cost");
    expect(panel?.label).toBe(PRIORITY_LABELS["lowest-cost"]);
  });

  it("does not assign a definitive label when the top-ranked offer's data is stale", () => {
    const rows = [
      makeRow({ id: "a", price: 50, freshnessMinutesAgo: FRESHNESS_STALE_MINUTES }),
      makeRow({ id: "b", price: 80, freshnessMinutesAgo: 2 }),
    ];
    const panel = buildRecommendationPanel(rows, "lowest-cost");
    expect(panel?.label).toBe(NEUTRAL_RECOMMENDATION_LABEL);
    expect(panel?.label).not.toBe(PRIORITY_LABELS["lowest-cost"]);
    expect(panel?.label).not.toBe(PRIORITY_LABELS["best-overall"]);
    expect(panel?.label).not.toBe(PRIORITY_LABELS["fastest-delivery"]);
  });

  it("does not assign a definitive label when the top-ranked offer's freshness is unknown", () => {
    const rows = [makeRow({ id: "a", price: 50, freshnessMinutesAgo: null as unknown as number })];
    const panel = buildRecommendationPanel(rows, "best-overall");
    expect(panel?.label).toBe(NEUTRAL_RECOMMENDATION_LABEL);
  });
});
