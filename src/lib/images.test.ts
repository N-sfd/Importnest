import { describe, expect, it } from "vitest";
import {
  BRAND_FALLBACK_IMAGE,
  getCategoryCollageImages,
  getProductDisplayImage,
  isBrandFallbackImage,
  productThumbClass,
} from "@/lib/images";

describe("getCategoryCollageImages", () => {
  it("prefers kitchen-appliance collage when query is kitchen and category is appliances", () => {
    const thumbs = getCategoryCollageImages("appliances", "kitchen");
    expect(thumbs).toHaveLength(4);
    expect(thumbs.some((t) => t.includes("microwave"))).toBe(true);
    expect(thumbs.some((t) => t.includes("dishwasher"))).toBe(true);
    expect(thumbs.some((t) => t.includes("coffee-maker"))).toBe(true);
    expect(thumbs.some((t) => t.includes("air-fryer"))).toBe(true);
  });
});

describe("productThumbClass re-export", () => {
  it("uses contain for product photos and padded contain for brand placeholders", () => {
    expect(productThumbClass("/images/products/accessories/wallet.jpg")).toContain("object-contain");
    expect(productThumbClass(BRAND_FALLBACK_IMAGE)).toContain("object-contain");
    expect(productThumbClass(BRAND_FALLBACK_IMAGE)).toContain("p-5");
    expect(isBrandFallbackImage("/images/demo-icons/microwave.svg")).toBe(true);
  });

  it("re-exports getProductDisplayImage from product-images", () => {
    expect(
      getProductDisplayImage({ categorySlug: "appliances", title: "Brightwell Dishwasher" }),
    ).toContain("dishwasher");
    expect(getProductDisplayImage({ categorySlug: "appliances" })).toBe(BRAND_FALLBACK_IMAGE);
  });
});
