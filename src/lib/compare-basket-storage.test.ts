import { describe, expect, it } from "vitest";
import {
  addToBasket,
  COMPARE_BASKET_LIMIT,
  parseCompareBasketJSON,
  removeFromBasket,
} from "@/lib/compare-basket-storage";

describe("parseCompareBasketJSON", () => {
  it("returns an empty array for null (no localStorage entry yet)", () => {
    expect(parseCompareBasketJSON(null)).toEqual([]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseCompareBasketJSON("")).toEqual([]);
  });

  it("returns an empty array for malformed JSON instead of throwing", () => {
    expect(parseCompareBasketJSON("{not valid json")).toEqual([]);
  });

  it("returns an empty array when the parsed value isn't an array", () => {
    expect(parseCompareBasketJSON(JSON.stringify({ id: "a", name: "A" }))).toEqual([]);
  });

  it("parses a single valid entry", () => {
    const raw = JSON.stringify([{ id: "cp-1", name: "Product One" }]);
    expect(parseCompareBasketJSON(raw)).toEqual([{ id: "cp-1", name: "Product One" }]);
  });

  it("drops malformed entries within an otherwise-valid array", () => {
    const raw = JSON.stringify([
      { id: "cp-1", name: "Product One" },
      { id: 42, name: "Bad id type" },
      { id: "cp-2" },
      null,
      "just a string",
    ]);
    expect(parseCompareBasketJSON(raw)).toEqual([{ id: "cp-1", name: "Product One" }]);
  });

  it("truncates to COMPARE_BASKET_LIMIT entries", () => {
    const entries = Array.from({ length: COMPARE_BASKET_LIMIT + 3 }, (_, i) => ({
      id: `cp-${i}`,
      name: `Product ${i}`,
    }));
    const result = parseCompareBasketJSON(JSON.stringify(entries));
    expect(result).toHaveLength(COMPARE_BASKET_LIMIT);
    expect(result).toEqual(entries.slice(0, COMPARE_BASKET_LIMIT));
  });
});

describe("addToBasket", () => {
  it("adds to an empty basket", () => {
    const result = addToBasket([], "cp-1", "Product One");
    expect(result.outcome).toBe("added");
    expect(result.items).toEqual([{ id: "cp-1", name: "Product One" }]);
  });

  it("is a no-op when the id is already present", () => {
    const current = [{ id: "cp-1", name: "Product One" }];
    const result = addToBasket(current, "cp-1", "Product One");
    expect(result.outcome).toBe("duplicate");
    expect(result.items).toBe(current);
  });

  it("refuses to add past COMPARE_BASKET_LIMIT", () => {
    const current = Array.from({ length: COMPARE_BASKET_LIMIT }, (_, i) => ({
      id: `cp-${i}`,
      name: `Product ${i}`,
    }));
    const result = addToBasket(current, "cp-new", "New Product");
    expect(result.outcome).toBe("limit");
    expect(result.items).toBe(current);
    expect(result.items).toHaveLength(COMPARE_BASKET_LIMIT);
  });
});

describe("removeFromBasket", () => {
  it("removes a matching item", () => {
    const current = [
      { id: "cp-1", name: "Product One" },
      { id: "cp-2", name: "Product Two" },
    ];
    expect(removeFromBasket(current, "cp-1")).toEqual([{ id: "cp-2", name: "Product Two" }]);
  });

  it("is a no-op when the id isn't present", () => {
    const current = [{ id: "cp-1", name: "Product One" }];
    expect(removeFromBasket(current, "cp-does-not-exist")).toEqual(current);
  });

  it("clearing down to an empty array works (remove last item)", () => {
    const current = [{ id: "cp-1", name: "Product One" }];
    expect(removeFromBasket(current, "cp-1")).toEqual([]);
  });
});
