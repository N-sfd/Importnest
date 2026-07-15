import { describe, expect, it } from "vitest";
import {
  buildRecommendationPanel,
  FALLBACK_COPY,
  formatMatchStatus,
  hasTiedTop,
  NEUTRAL_RECOMMENDATION_LABEL,
  NO_RECOMMENDATION_TEXT,
  PRIORITY_LABELS,
  sortCompareRows,
  type CompareListingView,
  type CompareRow,
} from "@/lib/compare-view";
import { FRESHNESS_STALE_MINUTES } from "@/lib/freshness";

describe("formatMatchStatus — product identity match label", () => {
  it("reads as an exact match with a confidence score", () => {
    expect(formatMatchStatus("exact", 96)).toBe("Exact match · 96%");
  });

  it("reads as a comparable product with a confidence score", () => {
    expect(formatMatchStatus("comparable", 82)).toBe("Comparable product · 82%");
  });

  it("reads as pending review when there is no confidence score at all", () => {
    expect(formatMatchStatus(undefined, null)).toBe("Match pending review");
    expect(formatMatchStatus("exact", null)).toBe("Match pending review");
  });
});

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

describe("buildRecommendationPanel — recommendation summary content", () => {
  it("lowest cost: explanation cites cost, no trade-off since it IS the cheapest", () => {
    const rows = sortCompareRows(
      [
        makeRow({ id: "cheap", price: 50, condition: "used" }),
        makeRow({ id: "pricier", price: 68, condition: "new", pickupAvailable: true }),
      ],
      "lowest-cost",
    );
    const panel = buildRecommendationPanel(rows, "lowest-cost");

    expect(panel?.label).toBe("Lowest cost");
    expect(panel?.listingId).toBe("cheap");
    expect(panel?.rationale).toContain("Lowest cost because it has");
    expect(panel?.rationale).toContain("lowest total known cost");
    expect(panel?.tradeOffLine).toBeNull();
  });

  it("fastest available: explanation cites pickup, trade-off notes the extra cost", () => {
    const rows = sortCompareRows(
      [
        makeRow({ id: "cheap-no-pickup", price: 50, condition: "used", pickupAvailable: false }),
        makeRow({ id: "pickup", price: 68, condition: "used", pickupAvailable: true }),
      ],
      "fastest-delivery",
    );
    const panel = buildRecommendationPanel(rows, "fastest-delivery");

    expect(panel?.listingId).toBe("pickup");
    expect(panel?.label).toBe(PRIORITY_LABELS["fastest-delivery"]);
    expect(panel?.rationale).toContain("faster pickup availability");
    expect(panel?.tradeOffLine).toBe(
      "It costs $18.00 more than the cheapest listing but has faster pickup availability.",
    );
  });

  it("best condition: explanation cites condition over a cheaper used listing", () => {
    const rows = sortCompareRows(
      [
        makeRow({ id: "used-cheap", price: 40, condition: "used" }),
        makeRow({ id: "new-pricier", price: 55, condition: "new" }),
      ],
      "best-condition",
    );
    const panel = buildRecommendationPanel(rows, "best-condition");

    expect(panel?.listingId).toBe("new-pricier");
    expect(panel?.label).toBe(PRIORITY_LABELS["best-condition"]);
    expect(panel?.rationale).toContain("new condition");
    expect(panel?.tradeOffLine).toContain("more than the cheapest listing");
  });

  it("tie: no reliable recommendation when the top two are indistinguishable on the active priority", () => {
    const rows = sortCompareRows(
      [makeRow({ id: "a", price: 60 }), makeRow({ id: "b", price: 60 })],
      "lowest-cost",
    );
    expect(hasTiedTop(rows, "lowest-cost")).toBe(true);
    expect(buildRecommendationPanel(rows, "lowest-cost")).toBeNull();
  });

  it("stale data: top offer still ranks first but gets a caveat, not a definitive claim", () => {
    const rows = sortCompareRows(
      [
        makeRow({ id: "stale-cheapest", price: 40, freshnessMinutesAgo: FRESHNESS_STALE_MINUTES }),
        makeRow({ id: "fresh-pricier", price: 60, freshnessMinutesAgo: 3 }),
      ],
      "lowest-cost",
    );
    const panel = buildRecommendationPanel(rows, "lowest-cost");

    expect(panel?.listingId).toBe("stale-cheapest");
    expect(panel?.label).toBe(NEUTRAL_RECOMMENDATION_LABEL);
    expect(panel?.rationale).toContain("outdated");
    expect(panel?.rationale).not.toContain("Lowest cost because");
  });

  it("missing information: reports real data gaps without inventing values", () => {
    const rows = sortCompareRows(
      [
        makeRow({
          id: "thin-data",
          price: 50,
          url: undefined,
          deliveryLabel: FALLBACK_COPY.delivery,
          availabilityLabel: FALLBACK_COPY.availability,
        }),
        makeRow({ id: "pricier", price: 70 }),
      ],
      "lowest-cost",
    );
    const panel = buildRecommendationPanel(rows, "lowest-cost");

    expect(panel?.missingInformation).toEqual(
      expect.arrayContaining([
        "Warranty details not provided by this source",
        "Return period not provided by this source",
        "Delivery estimate not available",
        "Stock status not confirmed",
        "Direct retailer link not available",
      ]),
    );
  });
});

describe("hasTiedTop / NO_RECOMMENDATION_TEXT", () => {
  it("is not tied when the top two differ on the active priority's metric", () => {
    const rows = sortCompareRows(
      [makeRow({ id: "a", price: 50 }), makeRow({ id: "b", price: 60 })],
      "lowest-cost",
    );
    expect(hasTiedTop(rows, "lowest-cost")).toBe(false);
  });

  it("exposes the exact fallback copy to show when there's no reliable recommendation", () => {
    expect(NO_RECOMMENDATION_TEXT).toBe("No clear best option based on the available data.");
  });
});
