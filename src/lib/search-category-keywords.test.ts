import { describe, expect, it } from "vitest";
import { suggestedCategoriesForQuery } from "@/lib/search-category-keywords";

describe("suggestedCategoriesForQuery", () => {
  it("maps 'bowl' to kitchen with dinnerware-style chips", () => {
    const result = suggestedCategoriesForQuery("bowl");
    expect(result).toEqual([
      { slug: "kitchen", chips: ["Dinnerware", "Cookware", "Food storage", "Serving bowls"] },
    ]);
  });

  it("maps plural forms the same as singular", () => {
    expect(suggestedCategoriesForQuery("plates")).toEqual(suggestedCategoriesForQuery("plate"));
  });

  it("is case-insensitive and tolerates punctuation", () => {
    expect(suggestedCategoriesForQuery("BOWL!")).toEqual(suggestedCategoriesForQuery("bowl"));
  });

  it("maps 'headphones' to electronics", () => {
    expect(suggestedCategoriesForQuery("headphones")).toEqual([
      { slug: "electronics", chips: ["Audio", "Headphones"] },
    ]);
  });

  it("maps 'dishwasher' to appliances", () => {
    expect(suggestedCategoriesForQuery("dishwasher")).toEqual([
      { slug: "appliances", chips: ["Dishwashers"] },
    ]);
  });

  it("surfaces both plausible departments for an ambiguous term like 'diffuser'", () => {
    const result = suggestedCategoriesForQuery("diffuser");
    expect(result.map((r) => r.slug)).toEqual(["home", "beauty"]);
  });

  it("surfaces both plausible departments for an ambiguous term like 'mirror'", () => {
    const result = suggestedCategoriesForQuery("mirror");
    expect(result.map((r) => r.slug)).toEqual(["beauty", "home"]);
  });

  it("merges chips and dedupes departments across multiple matched words in one query", () => {
    const result = suggestedCategoriesForQuery("mug and bowl set");
    expect(result).toHaveLength(1);
    expect(result[0]!.slug).toBe("kitchen");
    expect(result[0]!.chips).toEqual(
      expect.arrayContaining(["Drinkware", "Dinnerware", "Cookware", "Food storage", "Serving bowls"]),
    );
  });

  it("returns an empty array for a broad term with no recognized department", () => {
    expect(suggestedCategoriesForQuery("deals")).toEqual([]);
    expect(suggestedCategoriesForQuery("kitchen")).toEqual([]);
    expect(suggestedCategoriesForQuery("cheap")).toEqual([]);
  });

  it("returns an empty array for an empty query", () => {
    expect(suggestedCategoriesForQuery("")).toEqual([]);
  });
});
