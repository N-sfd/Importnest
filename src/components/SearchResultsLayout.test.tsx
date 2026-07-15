import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchResultProductCard } from "@/components/SearchResultsLayout";
import type { SearchResultProduct } from "@/lib/search-results";

function makeProduct(overrides: Partial<SearchResultProduct> = {}): SearchResultProduct {
  return {
    id: "cp-1",
    brandName: "Apex Home",
    productName: "Apex Quiet Dishwasher",
    modelNumber: "AH-4200",
    categoryName: "Appliances",
    categorySlug: "appliances",
    imageSrc: "/brand/logo-app-icon-light.png",
    lowestTotalCost: 899,
    offerCount: 3,
    freshnessMinutesAgo: 10,
    hasPickup: false,
    conditions: ["new"],
    attributes: [],
    sourceIds: ["src-1"],
    isSaved: false,
    matchKind: "exact",
    highlights: [],
    ...overrides,
  };
}

describe("SearchResultProductCard — no source data (zero listings for this product)", () => {
  it("shows an honest 'No offers' instead of a fabricated price or offer count", () => {
    const html = renderToStaticMarkup(
      <SearchResultProductCard
        product={makeProduct({ offerCount: 0, lowestTotalCost: null, sourceIds: [] })}
        signedIn={false}
        redirectTo="/search/results"
      />,
    );
    expect(html).toContain("No offers");
    expect(html).not.toContain("$0.00");
    expect(html).not.toContain("From");
  });

  it("still links to the comparison page even with no current offers", () => {
    const html = renderToStaticMarkup(
      <SearchResultProductCard
        product={makeProduct({ offerCount: 0, lowestTotalCost: null })}
        signedIn={false}
        redirectTo="/search/results"
      />,
    );
    expect(html).toContain('href="/compare/cp-1"');
  });
});

describe("SearchResultProductCard — comparable alternative labeling", () => {
  it("labels a comparable-match product 'Comparable alternative'", () => {
    const html = renderToStaticMarkup(
      <SearchResultProductCard
        product={makeProduct({ matchKind: "comparable" })}
        signedIn={false}
        redirectTo="/search/results"
      />,
    );
    expect(html).toContain("Comparable alternative");
    expect(html).not.toContain("Exact match");
  });

  it("labels an exact-match product 'Exact match', never mixing in the comparable badge", () => {
    const html = renderToStaticMarkup(
      <SearchResultProductCard
        product={makeProduct({ matchKind: "exact" })}
        signedIn={false}
        redirectTo="/search/results"
      />,
    );
    expect(html).toContain("Exact match");
    expect(html).not.toContain("Comparable alternative");
  });
});
