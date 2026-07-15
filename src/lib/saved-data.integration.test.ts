import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { getBestCurrentPrice, getSaveAndAlertState, getUserWatchlist } from "@/lib/saved-data";

// Real database, same reasoning as the other *.integration.test.ts files in
// this project: the thing under test is Prisma reads/joins against real
// listing prices, not something a mock should stand in for.
const PRODUCT_ID = "cp-iphone-6";

describe("saved products and price alerts", () => {
  const testUserId = `test-user-saved-data-${Date.now()}`;

  beforeAll(async () => {
    await prisma.appUser.create({
      data: { id: testUserId, email: `${testUserId}@example.test`, authProvider: "test" },
    });
    await prisma.savedProduct.create({
      data: { userId: testUserId, canonicalProductId: PRODUCT_ID },
    });
    await prisma.alert.create({
      data: {
        userId: testUserId,
        canonicalProductId: PRODUCT_ID,
        type: "price-drop",
        threshold: "999999", // absurdly high so it's reliably "not yet triggered" in one assertion
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.alert.deleteMany({ where: { userId: testUserId } });
    await prisma.savedProduct.deleteMany({ where: { userId: testUserId } });
    await prisma.appUser.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  it("computes the lowest total known cost across real listings", async () => {
    const price = await getBestCurrentPrice(PRODUCT_ID);
    expect(price).not.toBeNull();
    expect(price!).toBeGreaterThan(0);
  });

  it("returns null for a product with no listings", async () => {
    const price = await getBestCurrentPrice("cp-does-not-exist");
    expect(price).toBeNull();
  });

  it("getSaveAndAlertState reflects the saved product and alert just created", async () => {
    const state = await getSaveAndAlertState(testUserId, PRODUCT_ID);
    expect(state.isSaved).toBe(true);
    expect(state.alert).not.toBeNull();
    expect(state.alert!.threshold).toBe("999999");
    expect(state.alert!.isActive).toBe(true);
  });

  it("getSaveAndAlertState is false/null for a product the user hasn't saved", async () => {
    const state = await getSaveAndAlertState(testUserId, "cp-apex-ah4200");
    expect(state.isSaved).toBe(false);
    expect(state.alert).toBeNull();
  });

  it("getUserWatchlist includes the saved product with a live-computed status", async () => {
    const items = await getUserWatchlist(testUserId);
    const item = items.find((i) => i.canonicalProductId === PRODUCT_ID);
    expect(item).toBeTruthy();
    expect(item!.savedProductId).not.toBeNull();
    expect(item!.alertId).not.toBeNull();
    // Threshold is absurdly high, so a real current price must be below it.
    expect(item!.status).toBe("triggered");
  });

  it("getUserWatchlist returns nothing for a user with no saved products", async () => {
    const items = await getUserWatchlist("nonexistent-user-id");
    expect(items).toEqual([]);
  });
});
