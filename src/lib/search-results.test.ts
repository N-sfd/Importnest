import { describe, expect, it } from "vitest";
import { partitionByMatchKind, type SearchResultProduct } from "@/lib/search-results";

function makeProduct(overrides: Partial<SearchResultProduct> = {}): SearchResultProduct {
  return {
    id: "cp-1",
    brandName: "Apex Home",
    productName: "Apex Quiet Dishwasher",
    modelNumber: null,
    categoryName: "Appliances",
    categorySlug: "appliances",
    imageSrc: "/brand/logo-app-icon-light.png",
    lowestTotalCost: 899,
    offerCount: 3,
    freshnessMinutesAgo: 10,
    hasPickup: false,
    conditions: ["new"],
    rating: null,
    attributes: [],
    sourceIds: ["src-1"],
    isSaved: false,
    matchKind: "exact",
    highlights: [],
    bestListing: null,
    ...overrides,
  };
}

describe("partitionByMatchKind", () => {
  it("separates exact matches from comparable alternatives", () => {
    const exactOne = makeProduct({ id: "a", matchKind: "exact" });
    const comparableOne = makeProduct({ id: "b", matchKind: "comparable" });
    const { exact, comparable } = partitionByMatchKind([exactOne, comparableOne]);

    expect(exact.map((p) => p.id)).toEqual(["a"]);
    expect(comparable.map((p) => p.id)).toEqual(["b"]);
  });

  it("treats a null matchKind (no text query) as exact, not comparable", () => {
    const { exact, comparable } = partitionByMatchKind([makeProduct({ matchKind: null })]);
    expect(exact).toHaveLength(1);
    expect(comparable).toHaveLength(0);
  });

  it("never drops or duplicates a product across the two groups", () => {
    const products = [
      makeProduct({ id: "a", matchKind: "exact" }),
      makeProduct({ id: "b", matchKind: "comparable" }),
      makeProduct({ id: "c", matchKind: "exact" }),
    ];
    const { exact, comparable } = partitionByMatchKind(products);
    expect(exact.length + comparable.length).toBe(products.length);
    expect([...exact, ...comparable].map((p) => p.id).sort()).toEqual(["a", "b", "c"]);
  });
});
