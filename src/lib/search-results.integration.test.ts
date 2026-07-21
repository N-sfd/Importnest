import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { getSearchResults } from "@/lib/search-results";
import { getBestDeals } from "@/lib/best-deals";
import { getPopularComparisons } from "@/lib/popular-comparisons";
import { normalizeCategorySlug } from "@/lib/category-visuals";

// Exercises the real database because the thing under test is exactly the
// category=all / empty / missing browse path: a shopper who clicks "All" in
// the nav must see real cross-category products, never an empty result
// caused by a literal (and non-existent) "all" category slug reaching Prisma.
describe("All products browse — category=all / empty / missing", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("normalizes all, empty, and missing category params to no filter", () => {
    expect(normalizeCategorySlug("all")).toBeUndefined();
    expect(normalizeCategorySlug("All")).toBeUndefined();
    expect(normalizeCategorySlug("")).toBeUndefined();
    expect(normalizeCategorySlug(null)).toBeUndefined();
    expect(normalizeCategorySlug(undefined)).toBeUndefined();
  });

  it("category=all returns products across multiple categories, not zero", async () => {
    const results = await getSearchResults({
      categorySlug: normalizeCategorySlug("all"),
      availableOnly: true,
    });
    expect(results.products.length).toBeGreaterThan(0);
    const distinctCategories = new Set(results.products.map((p) => p.categorySlug));
    expect(distinctCategories.size).toBeGreaterThan(1);
  });

  it("no category param returns the same unfiltered browse as category=all", async () => {
    const noCategoryResults = await getSearchResults({
      categorySlug: normalizeCategorySlug(undefined),
      availableOnly: true,
    });
    const allResults = await getSearchResults({
      categorySlug: normalizeCategorySlug("all"),
      availableOnly: true,
    });
    expect(noCategoryResults.total).toBe(allResults.total);
    expect(noCategoryResults.total).toBeGreaterThan(0);
  });

  it("empty category param returns products, not an empty result", async () => {
    const results = await getSearchResults({
      categorySlug: normalizeCategorySlug(""),
      availableOnly: true,
    });
    expect(results.products.length).toBeGreaterThan(0);
  });

  it("Best deals and Popular comparisons work unfiltered for the All browse", async () => {
    const deals = await getBestDeals(8, new Set(), normalizeCategorySlug("all"));
    const popular = await getPopularComparisons(8, new Set(), normalizeCategorySlug("all"));
    expect(deals.length).toBeGreaterThan(0);
    expect(popular.length).toBeGreaterThan(0);
  });

  it("a real category slug still filters normally (no regression)", async () => {
    const results = await getSearchResults({
      categorySlug: normalizeCategorySlug("electronics"),
      availableOnly: true,
    });
    expect(results.products.length).toBeGreaterThan(0);
    for (const p of results.products) {
      expect(p.categorySlug).toBe("electronics");
    }
  });

  it("category aliases still resolve to the canonical slug and filter correctly", async () => {
    const results = await getSearchResults({
      categorySlug: normalizeCategorySlug("Beauty Devices"),
      availableOnly: true,
    });
    expect(results.products.length).toBeGreaterThan(0);
    for (const p of results.products) {
      expect(p.categorySlug).toBe("beauty-devices");
    }
  });
});
