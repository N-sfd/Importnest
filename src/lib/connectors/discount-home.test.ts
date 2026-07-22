import { describe, expect, it } from "vitest";
import { mapDummyJsonHomeProduct } from "./discount-home";

describe("mapDummyJsonHomeProduct", () => {
  it("maps a DummyJSON home-goods product to a connector listing", () => {
    const listing = mapDummyJsonHomeProduct({
      id: 5,
      title: "Bamboo Cutting Board",
      price: 24.99,
      category: "kitchen-accessories",
      sku: "KIT-BAM-005",
      shippingInformation: "Ships in 3 days",
      meta: { barcode: "1234567890123" },
    });

    expect(listing).toEqual({
      externalId: "dh-5",
      condition: "new",
      price: 24.99,
      upc: "1234567890123",
      mpn: "KIT-BAM-005",
      modelName: "Bamboo Cutting Board",
      deliveryLabel: "Ships in 3 days",
    });
  });

  it("tolerates a missing barcode", () => {
    const listing = mapDummyJsonHomeProduct({ id: 1, title: "No Barcode Item", price: 9.99 });
    expect(listing.upc).toBeUndefined();
  });
});
