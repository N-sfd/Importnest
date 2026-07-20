import { describe, expect, it } from "vitest";
import {
  addToCart,
  CART_LINE_LIMIT,
  CART_MAX_QUANTITY,
  cartSummaryTotals,
  isInCart,
  lineUnitCost,
  parseCartJSON,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart-storage";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "cp-1",
    listingId: "lst-1",
    title: "Apex Quiet Dishwasher",
    brand: "Apex Home",
    imageUrl: "/images/products/dishwasher.png",
    retailerName: "SportLane",
    condition: "New",
    itemPrice: 100,
    shipping: 10,
    fees: 5,
    totalKnownCost: 115,
    quantity: 1,
    addedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("parseCartJSON", () => {
  it("returns an empty array for null (no localStorage entry yet)", () => {
    expect(parseCartJSON(null)).toEqual([]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseCartJSON("")).toEqual([]);
  });

  it("returns an empty array for malformed JSON instead of throwing", () => {
    expect(parseCartJSON("{not valid json")).toEqual([]);
  });

  it("returns an empty array when the parsed value isn't an array", () => {
    expect(parseCartJSON(JSON.stringify({ productId: "cp-1" }))).toEqual([]);
  });

  it("parses a single valid entry with all optional fields present", () => {
    const item = makeItem();
    expect(parseCartJSON(JSON.stringify([item]))).toEqual([item]);
  });

  it("parses an entry with only the required fields (all others omitted)", () => {
    const minimal = { productId: "cp-1", title: "Some Product", quantity: 1, addedAt: "2026-01-01T00:00:00.000Z" };
    expect(parseCartJSON(JSON.stringify([minimal]))).toEqual([minimal]);
  });

  it("drops malformed entries within an otherwise-valid array, keeping the rest", () => {
    const good = makeItem();
    const raw = JSON.stringify([
      good,
      { productId: 42, title: "Bad id type", quantity: 1, addedAt: "x" },
      { productId: "cp-2", title: "Missing quantity", addedAt: "x" },
      { ...makeItem({ productId: "cp-3" }), itemPrice: "not a number" },
      null,
      "just a string",
      42,
    ]);
    expect(parseCartJSON(raw)).toEqual([good]);
  });

  it("clamps an out-of-range or non-integer quantity into [1, CART_MAX_QUANTITY]", () => {
    const raw = JSON.stringify([
      makeItem({ productId: "cp-a", listingId: "lst-a", quantity: 0 }),
      makeItem({ productId: "cp-b", listingId: "lst-b", quantity: -5 }),
      makeItem({ productId: "cp-c", listingId: "lst-c", quantity: 999 }),
      makeItem({ productId: "cp-d", listingId: "lst-d", quantity: 2.7 }),
    ]);
    const result = parseCartJSON(raw);
    expect(result.map((i) => i.quantity)).toEqual([1, 1, CART_MAX_QUANTITY, 3]);
  });

  it("truncates to a sane maximum number of lines instead of accepting an unbounded array", () => {
    const entries = Array.from({ length: 150 }, (_, i) =>
      makeItem({ productId: `cp-${i}`, listingId: `lst-${i}` }),
    );
    const result = parseCartJSON(JSON.stringify(entries));
    expect(result.length).toBeLessThanOrEqual(100);
  });
});

describe("addToCart", () => {
  it("adds a new line to an empty cart with quantity 1 and outcome 'added'", () => {
    const item = makeItem();
    const { quantity, addedAt, ...newItem } = item;
    const result = addToCart([], newItem);
    expect(result.outcome).toBe("added");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.quantity).toBe(1);
    expect(result.items[0]!.productId).toBe("cp-1");
  });

  it("merges into the existing line (increments quantity, no duplicate row) for the same product + same listing, outcome 'merged'", () => {
    const current = [makeItem({ quantity: 2 })];
    const { quantity, addedAt, ...newItem } = makeItem();
    const result = addToCart(current, newItem);
    expect(result.outcome).toBe("merged");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.quantity).toBe(3);
  });

  it("does not merge two different listings of the same product into one row", () => {
    const current = [makeItem({ listingId: "lst-1" })];
    const { quantity, addedAt, ...newItem } = makeItem({ listingId: "lst-2" });
    const result = addToCart(current, newItem);
    expect(result.outcome).toBe("added");
    expect(result.items).toHaveLength(2);
  });

  it("caps quantity at CART_MAX_QUANTITY when repeatedly adding the same line", () => {
    let items = [makeItem({ quantity: CART_MAX_QUANTITY })];
    const { quantity, addedAt, ...newItem } = makeItem();
    items = addToCart(items, newItem).items;
    expect(items[0]!.quantity).toBe(CART_MAX_QUANTITY);
  });

  it("refuses to add a new line past CART_LINE_LIMIT distinct products, outcome 'limit'", () => {
    const current = Array.from({ length: CART_LINE_LIMIT }, (_, i) =>
      makeItem({ productId: `cp-${i}`, listingId: `lst-${i}` }),
    );
    const { quantity, addedAt, ...newItem } = makeItem({ productId: "cp-new", listingId: "lst-new" });
    const result = addToCart(current, newItem);
    expect(result.outcome).toBe("limit");
    expect(result.items).toBe(current);
    expect(result.items).toHaveLength(CART_LINE_LIMIT);
  });

  it("still merges an already-in-cart line even when the cart is at CART_LINE_LIMIT", () => {
    const current = Array.from({ length: CART_LINE_LIMIT }, (_, i) =>
      makeItem({ productId: `cp-${i}`, listingId: `lst-${i}`, quantity: 1 }),
    );
    const { quantity, addedAt, ...newItem } = makeItem({ productId: "cp-0", listingId: "lst-0" });
    const result = addToCart(current, newItem);
    expect(result.outcome).toBe("merged");
    expect(result.items).toHaveLength(CART_LINE_LIMIT);
    expect(result.items[0]!.quantity).toBe(2);
  });
});

describe("removeFromCart", () => {
  it("removes the matching line by listingId", () => {
    const current = [makeItem({ productId: "cp-1", listingId: "lst-1" }), makeItem({ productId: "cp-2", listingId: "lst-2" })];
    expect(removeFromCart(current, "lst-1", "cp-1")).toEqual([current[1]]);
  });

  it("removing the last item empties the cart", () => {
    const current = [makeItem()];
    expect(removeFromCart(current, "lst-1", "cp-1")).toEqual([]);
  });

  it("is a no-op when nothing matches", () => {
    const current = [makeItem()];
    expect(removeFromCart(current, "lst-does-not-exist", "cp-1")).toEqual(current);
  });
});

describe("updateCartQuantity", () => {
  it("updates the quantity of the matching line", () => {
    const current = [makeItem({ quantity: 1 })];
    const result = updateCartQuantity(current, "lst-1", "cp-1", 4);
    expect(result[0]!.quantity).toBe(4);
  });

  it("clamps below 1 up to 1", () => {
    const current = [makeItem({ quantity: 1 })];
    expect(updateCartQuantity(current, "lst-1", "cp-1", 0)[0]!.quantity).toBe(1);
    expect(updateCartQuantity(current, "lst-1", "cp-1", -3)[0]!.quantity).toBe(1);
  });

  it("clamps above CART_MAX_QUANTITY down to CART_MAX_QUANTITY", () => {
    const current = [makeItem({ quantity: 1 })];
    expect(updateCartQuantity(current, "lst-1", "cp-1", 999)[0]!.quantity).toBe(CART_MAX_QUANTITY);
  });
});

describe("isInCart", () => {
  it("is true for a matching listingId", () => {
    expect(isInCart([makeItem()], "lst-1", "cp-1")).toBe(true);
  });

  it("is false when nothing matches", () => {
    expect(isInCart([makeItem()], "lst-2", "cp-1")).toBe(false);
    expect(isInCart([], "lst-1", "cp-1")).toBe(false);
  });
});

describe("lineUnitCost", () => {
  it("prefers totalKnownCost when present", () => {
    expect(lineUnitCost({ totalKnownCost: 115, itemPrice: 100 })).toBe(115);
  });

  it("falls back to itemPrice when totalKnownCost is missing", () => {
    expect(lineUnitCost({ totalKnownCost: undefined, itemPrice: 100 })).toBe(100);
  });

  it("is undefined when neither field is present", () => {
    expect(lineUnitCost({ totalKnownCost: undefined, itemPrice: undefined })).toBeUndefined();
  });
});

describe("cartSummaryTotals", () => {
  it("sums subtotal/shipping/fees/total across quantities", () => {
    const items = [
      makeItem({ productId: "cp-1", listingId: "lst-1", itemPrice: 100, shipping: 10, fees: 5, totalKnownCost: 115, quantity: 2 }),
      makeItem({ productId: "cp-2", listingId: "lst-2", itemPrice: 50, shipping: 0, fees: 0, totalKnownCost: 50, quantity: 1 }),
    ];
    const totals = cartSummaryTotals(items);
    expect(totals.subtotal).toBe(250);
    expect(totals.shippingTotal).toBe(20);
    expect(totals.feesTotal).toBe(10);
    expect(totals.totalKnownCost).toBe(280);
    expect(totals.hasUnknownShipping).toBe(false);
    expect(totals.hasUnknownFees).toBe(false);
  });

  it("flags unknown shipping/fees without crashing, treating them as 0 in the running totals", () => {
    const items = [
      makeItem({ shipping: undefined, fees: undefined, totalKnownCost: undefined, itemPrice: 100, quantity: 1 }),
    ];
    const totals = cartSummaryTotals(items);
    expect(totals.hasUnknownShipping).toBe(true);
    expect(totals.hasUnknownFees).toBe(true);
    expect(totals.shippingTotal).toBe(0);
    expect(totals.feesTotal).toBe(0);
    expect(totals.totalKnownCost).toBe(100);
  });

  it("returns all-zero totals for an empty cart", () => {
    const totals = cartSummaryTotals([]);
    expect(totals.subtotal).toBe(0);
    expect(totals.totalKnownCost).toBe(0);
  });
});
