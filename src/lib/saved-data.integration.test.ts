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

describe("ownership — a shopper only ever sees their own saved products and alerts", () => {
  const ownerId = `test-user-saved-owner-${Date.now()}`;
  const otherId = `test-user-saved-other-${Date.now()}`;

  beforeAll(async () => {
    await prisma.appUser.createMany({
      data: [
        { id: ownerId, email: `${ownerId}@example.test`, authProvider: "test" },
        { id: otherId, email: `${otherId}@example.test`, authProvider: "test" },
      ],
    });
    // Both users save and set an alert on the SAME product with DIFFERENT
    // thresholds — the strongest test that reads are scoped by userId and
    // not accidentally shared/merged across accounts.
    await prisma.savedProduct.createMany({
      data: [
        { userId: ownerId, canonicalProductId: PRODUCT_ID },
        { userId: otherId, canonicalProductId: PRODUCT_ID },
      ],
    });
    await prisma.alert.createMany({
      data: [
        { userId: ownerId, canonicalProductId: PRODUCT_ID, type: "price-drop", threshold: "111", isActive: true },
        { userId: otherId, canonicalProductId: PRODUCT_ID, type: "price-drop", threshold: "222", isActive: false },
      ],
    });
  });

  afterAll(async () => {
    await prisma.alert.deleteMany({ where: { userId: { in: [ownerId, otherId] } } });
    await prisma.savedProduct.deleteMany({ where: { userId: { in: [ownerId, otherId] } } });
    await prisma.appUser.deleteMany({ where: { id: { in: [ownerId, otherId] } } });
    await prisma.$disconnect();
  });

  it("getSaveAndAlertState never returns another user's threshold or active state for the same product", async () => {
    const owner = await getSaveAndAlertState(ownerId, PRODUCT_ID);
    const other = await getSaveAndAlertState(otherId, PRODUCT_ID);

    expect(owner.isSaved).toBe(true);
    expect(owner.alert!.threshold).toBe("111");
    expect(owner.alert!.isActive).toBe(true);

    expect(other.isSaved).toBe(true);
    expect(other.alert!.threshold).toBe("222");
    expect(other.alert!.isActive).toBe(false);
  });

  it("getUserWatchlist scopes strictly to the requesting user's own alert, even for a product both users saved", async () => {
    const ownerItems = await getUserWatchlist(ownerId);
    const otherItems = await getUserWatchlist(otherId);

    const ownerItem = ownerItems.find((i) => i.canonicalProductId === PRODUCT_ID);
    const otherItem = otherItems.find((i) => i.canonicalProductId === PRODUCT_ID);

    expect(ownerItem!.targetPrice).toBe(111);
    expect(ownerItem!.status).not.toBe("paused");

    expect(otherItem!.targetPrice).toBe(222);
    expect(otherItem!.status).toBe("paused");

    // Neither list leaks the other account's saved/alert row id.
    expect(ownerItem!.alertId).not.toBe(otherItem!.alertId);
    expect(ownerItem!.savedProductId).not.toBe(otherItem!.savedProductId);
  });

  it("removing one user's saved product does not touch the other user's row for the same product", async () => {
    await prisma.savedProduct.deleteMany({ where: { userId: otherId, canonicalProductId: PRODUCT_ID } });

    const ownerState = await getSaveAndAlertState(ownerId, PRODUCT_ID);
    const otherState = await getSaveAndAlertState(otherId, PRODUCT_ID);

    expect(ownerState.isSaved).toBe(true);
    expect(otherState.isSaved).toBe(false);
    // The other user's alert is untouched by the unrelated savedProduct deletion.
    expect(otherState.alert).not.toBeNull();

    // Restore so afterAll's cleanup doesn't need special-casing.
    await prisma.savedProduct.create({ data: { userId: otherId, canonicalProductId: PRODUCT_ID } });
  });
});
