import { describe, expect, it } from "vitest";
import { mapPlatziProduct } from "./authorized-outlet";

describe("mapPlatziProduct", () => {
  it("maps a Platzi product to a certified-refurbished connector listing", () => {
    const listing = mapPlatziProduct({ id: 8, title: "Classic Red Jogger Sweatpants", price: 98 });

    expect(listing).toEqual({
      externalId: "ao-8",
      condition: "certified-refurbished",
      price: 98,
      mpn: "AO-8",
      modelName: "Classic Red Jogger Sweatpants",
    });
  });
});
