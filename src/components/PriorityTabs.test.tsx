import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PriorityTabs } from "@/components/PriorityTabs";
import {
  FALLBACK_COPY,
  NEUTRAL_RECOMMENDATION_LABEL,
  NO_RECOMMENDATION_TEXT,
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

describe("PriorityTabs — no offers", () => {
  it("renders an honest empty state instead of an offer list", () => {
    const html = renderToStaticMarkup(<PriorityTabs productId="cp-1" rows={[]} />);
    expect(html).toContain("Source temporarily unavailable");
    expect(html).not.toContain("Sort by");
  });
});

describe("PriorityTabs — stale offers", () => {
  it("shows the stale-data banner and never assigns a definitive label to a stale top offer", () => {
    const rows = [
      makeRow({ id: "a", price: 50, freshnessMinutesAgo: FRESHNESS_STALE_MINUTES }),
      makeRow({ id: "b", price: 80, freshnessMinutesAgo: 2 }),
    ];
    const html = renderToStaticMarkup(<PriorityTabs productId="cp-1" rows={rows} />);

    expect(html).toContain("Some prices look stale");
    expect(html).toContain("Data may be outdated");
    expect(html).toContain(NEUTRAL_RECOMMENDATION_LABEL);
  });

  it("assigns the definitive label (not the neutral fallback) when every offer is fresh", () => {
    const rows = [makeRow({ id: "a", price: 50, freshnessMinutesAgo: 2 })];
    const html = renderToStaticMarkup(<PriorityTabs productId="cp-1" rows={rows} />);

    expect(html).not.toContain("Some prices look stale");
    expect(html).not.toContain("Data may be outdated");
    expect(html).not.toContain(NEUTRAL_RECOMMENDATION_LABEL);
  });
});

describe("PriorityTabs — recommendation summary content", () => {
  it("shows the explanation, one trade-off line, missing information, and last-checked time", () => {
    const rows = [
      makeRow({
        id: "cheap-used",
        price: 40,
        condition: "used",
        pickupAvailable: false,
        freshnessMinutesAgo: 5,
      }),
      makeRow({
        id: "pricier-pickup",
        price: 55,
        condition: "used",
        pickupAvailable: true,
        freshnessMinutesAgo: 5,
      }),
    ];
    const html = renderToStaticMarkup(
      <PriorityTabs productId="cp-1" rows={rows} initialPriority="fastest-delivery" />,
    );

    expect(html).toContain("because it has faster pickup availability");
    expect(html).toContain("It costs $15.00 more than the cheapest listing but has faster pickup availability.");
    expect(html).toContain("Missing information");
    expect(html).toContain("Updated");
  });

  it("shows 'No clear best option' instead of a badge/highlight when the top spot is tied", () => {
    const rows = [
      makeRow({ id: "a", price: 60, freshnessMinutesAgo: 5 }),
      makeRow({ id: "b", price: 60, freshnessMinutesAgo: 5 }),
    ];
    const html = renderToStaticMarkup(
      <PriorityTabs productId="cp-1" rows={rows} initialPriority="lowest-cost" />,
    );

    expect(html).toContain(NO_RECOMMENDATION_TEXT);
    expect(html).not.toContain("Recommended");
  });
});
