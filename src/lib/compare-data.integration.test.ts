import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { FALLBACK_COPY, getCompareProduct, getCompareRows } from "@/lib/compare-data";

// This exercises the real dev database (see prisma/schema.prisma DATABASE_URL),
// not a mock, because the thing under test is exactly the failure mode a mock
// would hide: compare-data.ts used to only render correctly for listing ids
// that were hand-keyed into static tables. Every synced (non-seeded) product
// is a regression check for that.
const PRODUCT_ID = "cp-iphone-6";

describe("live-synced product comparison (no seeded display copy)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("has a canonical product with at least one real UPC identifier", async () => {
    const product = await prisma.canonicalProduct.findUnique({
      where: { id: PRODUCT_ID },
      include: { identifiers: true },
    });
    expect(product).not.toBeNull();
    expect(product!.identifiers.some((i) => i.type === "UPC")).toBe(true);
  });

  it("has multiple listing rows, all pointing at this canonical product", async () => {
    const listings = await prisma.listing.findMany({ where: { canonicalProductId: PRODUCT_ID } });
    expect(listings.length).toBeGreaterThan(1);
    for (const listing of listings) {
      expect(listing.canonicalProductId).toBe(PRODUCT_ID);
    }
  });

  it("renders a full comparison without any hand-authored per-listing copy", async () => {
    const product = await getCompareProduct(PRODUCT_ID);
    expect(product).not.toBeNull();

    const rows = await getCompareRows(PRODUCT_ID);
    expect(rows.length).toBeGreaterThan(1);

    const sellerNames = new Set(rows.map((r) => r.listing.sourceName));
    // Real, distinct merchants — not a single connector-level placeholder name
    // repeated for every row (the retailer-identity bug this test would catch).
    expect(sellerNames.size).toBeGreaterThan(1);

    for (const { listing, recommendation } of rows) {
      // Every listing must resolve to *some* valid label — sourced either from
      // real data or from the shared fallback constants, never undefined/blank
      // from a missing per-id table entry.
      expect(listing.sourceName).toBeTruthy();
      expect(listing.sourceName).not.toBe(FALLBACK_COPY.retailer);
      expect([FALLBACK_COPY.warranty]).toContain(listing.warrantyLabel);
      expect([FALLBACK_COPY.returns]).toContain(listing.returnPolicyLabel);
      expect(listing.deliveryLabel).toBeTruthy();

      expect(recommendation.rank).toBeGreaterThan(0);
      expect(recommendation.label).toBeTruthy();
      expect(recommendation.rationale).toBeTruthy();
      expect(Array.isArray(recommendation.assumptions)).toBe(true);
    }

    const ranks = rows.map((r) => r.recommendation.rank);
    expect(new Set(ranks).size).toBe(ranks.length); // ranks are unique, not duplicated
  });
});
