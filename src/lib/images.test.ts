import { describe, expect, it } from "vitest";
import {
  BRAND_FALLBACK_IMAGE,
  getProductDisplayImage,
  isBrandFallbackImage,
  productImageFor,
  productThumbClass,
} from "@/lib/images";
import { getCategoryDemoProducts } from "@/data/category-demo-products";

describe("getProductDisplayImage", () => {
  it("prefers an explicit imageUrl when present", () => {
    expect(
      getProductDisplayImage({
        productId: "cp-apex-ah4200",
        categorySlug: "appliances",
        imageUrl: "/custom.png",
      }),
    ).toBe("/custom.png");
  });

  it("uses seeded product photos before category fallbacks", () => {
    expect(getProductDisplayImage({ productId: "cp-apex-ah4200", categorySlug: "appliances" })).toBe(
      "/images/products/dishwasher.png",
    );
  });

  it("falls back to the category photo when no product image exists", () => {
    expect(getProductDisplayImage({ productId: "unknown-product", categorySlug: "appliances" })).toBe(
      "/images/home/categories/appliances.png",
    );
  });

  it("aliases beauty-devices to the beauty category image", () => {
    expect(productImageFor("unknown", "beauty-devices")).toContain("beauty");
  });

  it("uses brand fallback only when no product or category image is available", () => {
    expect(getProductDisplayImage({ productId: "unknown" })).toBe(BRAND_FALLBACK_IMAGE);
  });
});

describe("productThumbClass", () => {
  it("uses cover for real photos and contain for brand placeholders", () => {
    expect(productThumbClass("/images/categories/appliances.png")).toBe("object-cover");
    expect(productThumbClass(BRAND_FALLBACK_IMAGE)).toContain("object-contain");
    expect(isBrandFallbackImage("/images/demo-icons/microwave.svg")).toBe(true);
  });
});

describe("category demo thumbnails", () => {
  it("does not use line-icon SVGs for appliances explore tiles", () => {
    const products = getCategoryDemoProducts("appliances");
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p.image).toBeTruthy();
      expect(p.image).not.toContain("/demo-icons/");
      expect(p.image).toMatch(/\.(png|jpe?g|webp)$/i);
    }
  });

  it("resolves beauty-devices alias to beauty demo tiles with photos", () => {
    const products = getCategoryDemoProducts("beauty-devices");
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]?.image).not.toContain("/demo-icons/");
  });
});
