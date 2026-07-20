import { describe, expect, it } from "vitest";
import {
  BRAND_FALLBACK_IMAGE,
  getProductDisplayImage,
  isBrandFallbackImage,
  productImageFor,
  productThumbClass,
  subtypeFallbackImage,
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

  it("prefers primaryImage before listing and category fallbacks", () => {
    expect(
      getProductDisplayImage({
        categorySlug: "footwear",
        primaryImage: "/primary.jpg",
        listingImageUrl: "/listing.jpg",
      }),
    ).toBe("/primary.jpg");
  });

  it("uses seeded product photos before category fallbacks", () => {
    expect(getProductDisplayImage({ productId: "cp-apex-ah4200", categorySlug: "appliances" })).toBe(
      "/images/products/dishwasher.png",
    );
  });

  it("uses subtype fallbacks from title before the shared category photo", () => {
    expect(
      getProductDisplayImage({
        productId: "unknown-product",
        categorySlug: "footwear",
        title: "Pinnacle Trail Runner",
      }),
    ).toBe("/images/products/footwear/trail-runner.jpg");
  });

  it("falls back to the category photo when no product or subtype image exists", () => {
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

describe("subtypeFallbackImage", () => {
  it("matches footwear subtypes from titles", () => {
    expect(subtypeFallbackImage("footwear", "Harborline Canvas Sneaker")).toContain("canvas-sneaker");
    expect(subtypeFallbackImage("footwear", "Glenmoor Chukka Boot")).toContain("chukka-boot");
  });

  it("matches accessories and beauty subtypes", () => {
    expect(subtypeFallbackImage("accessories", "Kestrel Laptop Backpack")).toContain("backpack");
    expect(subtypeFallbackImage("beauty", "Rosemere Hair Dryer 1875W")).toContain("hair-dryer");
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
  const categories = [
    "footwear",
    "beauty",
    "accessories",
    "appliances",
    "electronics",
    "kitchen",
    "home",
    "automotive",
    "outdoors",
  ] as const;

  it("provides at least 8 demo products per major category", () => {
    for (const slug of categories) {
      expect(getCategoryDemoProducts(slug).length).toBeGreaterThanOrEqual(8);
    }
  });

  it("uses distinct photos within footwear, beauty, accessories, and appliances", () => {
    for (const slug of ["footwear", "beauty", "accessories", "appliances"] as const) {
      const products = getCategoryDemoProducts(slug);
      const images = products.map((p) => p.image);
      expect(new Set(images).size).toBe(images.length);
      for (const image of images) {
        expect(image).not.toContain("/demo-icons/");
        expect(image).toMatch(/\.(png|jpe?g|webp)$/i);
      }
    }
  });

  it("keeps More to explore tiles inside the requested category", () => {
    for (const slug of categories) {
      for (const product of getCategoryDemoProducts(slug)) {
        expect(product.categorySlug).toBe(slug);
      }
    }
  });

  it("resolves beauty-devices alias to beauty demo tiles with photos", () => {
    const products = getCategoryDemoProducts("beauty-devices");
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]?.image).not.toContain("/demo-icons/");
  });
});
