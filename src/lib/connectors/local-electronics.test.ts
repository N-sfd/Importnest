import { describe, expect, it } from "vitest";
import { mapDummyJsonProduct } from "./local-electronics";

describe("mapDummyJsonProduct", () => {
  it("maps a DummyJSON product to a connector listing", () => {
    const listing = mapDummyJsonProduct({
      id: 121,
      title: "iPhone 5s",
      price: 199.99,
      category: "smartphones",
      sku: "SMA-APP-IPH-121",
      shippingInformation: "Ships in 1 month",
      meta: { barcode: "8814683940853" },
    });

    expect(listing).toEqual({
      externalId: "dj-121",
      condition: "new",
      price: 199.99,
      upc: "8814683940853",
      mpn: "SMA-APP-IPH-121",
      modelName: "iPhone 5s",
      deliveryLabel: "Ships in 1 month",
    });
  });

  it("tolerates a missing barcode", () => {
    const listing = mapDummyJsonProduct({ id: 1, title: "No Barcode Item", price: 9.99 });
    expect(listing.upc).toBeUndefined();
  });
});
