import { describe, expect, it } from "vitest";
import { getCategoryDemoProducts } from "@/data/category-demo-products";
import {
  BRAND_FALLBACK_IMAGE,
  getProductDisplayImage,
  imageForSubtype,
  productImageAlt,
  productImageFor,
  PRODUCT_IMAGE_SIZE,
  subtypeFallbackImage,
} from "@/lib/product-images";

describe("getProductDisplayImage", () => {
  it("prefers product.imageUrl when present", () => {
    expect(
      getProductDisplayImage({
        productId: "cp-apex-ah4200",
        categorySlug: "appliances",
        imageUrl: "/custom.png",
      }),
    ).toBe("/custom.png");
  });

  it("prefers primaryImage before listing imageUrl", () => {
    expect(
      getProductDisplayImage({
        categorySlug: "footwear",
        primaryImage: "/primary.jpg",
        listing: { imageUrl: "/listing.jpg" },
      }),
    ).toBe("/primary.jpg");
  });

  it("uses listing.imageUrl before subtype fallbacks", () => {
    expect(
      getProductDisplayImage({
        categorySlug: "footwear",
        title: "Pinnacle Running Shoe",
        listing: { imageUrl: "/from-listing.jpg" },
      }),
    ).toBe("/from-listing.jpg");
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
        title: "Pinnacle Running Shoe",
      }),
    ).toBe("/images/products/footwear/running-shoe.jpg");
  });

  it("uses explicit subtype before category fallback", () => {
    expect(
      getProductDisplayImage({
        categorySlug: "electronics",
        subtype: "headphones",
      }),
    ).toBe("/images/products/electronics/headphones.jpg");
  });

  it("falls back to the category photo when no product or subtype image exists", () => {
    expect(getProductDisplayImage({ productId: "unknown-product", categorySlug: "appliances" })).toBe(
      "/images/categories/appliances.png",
    );
  });

  it("aliases beauty-devices to the beauty category image", () => {
    expect(productImageFor("unknown", "beauty-devices")).toContain("beauty");
  });

  it("uses brand fallback only when no product or category image is available", () => {
    expect(getProductDisplayImage({ productId: "unknown" })).toBe(BRAND_FALLBACK_IMAGE);
  });

  it("reads category from nested category.slug", () => {
    expect(
      getProductDisplayImage({
        category: { slug: "kitchen" },
        title: "Whirlblend Countertop Blender",
      }),
    ).toContain("blender");
  });
});

describe("productImageAlt", () => {
  it("prefers title for alt text", () => {
    expect(productImageAlt({ title: "Apex Dishwasher", categorySlug: "appliances" })).toBe(
      "Apex Dishwasher",
    );
  });

  it("falls back to subtype and category", () => {
    expect(productImageAlt({ subtype: "headphones", categorySlug: "electronics" })).toBe(
      "headphones — Electronics",
    );
  });
});

describe("PRODUCT_IMAGE_SIZE", () => {
  it("keeps square product thumbnails consistent", () => {
    expect(PRODUCT_IMAGE_SIZE.width).toBe(PRODUCT_IMAGE_SIZE.height);
    expect(PRODUCT_IMAGE_SIZE.width).toBe(400);
  });
});

describe("subtypeFallbackImage", () => {
  it("matches footwear subtypes from titles", () => {
    expect(subtypeFallbackImage("footwear", "Harborline Canvas Sneaker")).toContain("canvas-sneaker");
    expect(subtypeFallbackImage("footwear", "Pinnacle Running Shoe")).toContain("running-shoe");
    expect(subtypeFallbackImage("footwear", "Glenmoor Chukka Boot")).toContain("chukka-boot");
  });

  it("prefers exact subtype tags over looser title matches", () => {
    expect(
      subtypeFallbackImage("footwear", "Trail Runner Style", null, ["running shoe"]),
    ).toContain("running-shoe");
  });

  it("resolves imageForSubtype for every seeded demo subtype", () => {
    for (const slug of [
      "electronics",
      "appliances",
      "kitchen",
      "beauty",
      "footwear",
      "accessories",
      "automotive",
      "outdoors",
      "home",
    ] as const) {
      for (const product of getCategoryDemoProducts(slug)) {
        expect(imageForSubtype(slug, product.subtype)).toBeTruthy();
        expect(product.image).toBe(imageForSubtype(slug, product.subtype));
      }
    }
  });

  it("matches electronics subtypes including phone and headphones", () => {
    expect(subtypeFallbackImage("electronics", "Pixelbay Smart Phone SE")).toContain("phone");
    expect(subtypeFallbackImage("electronics", "Harborline Over-Ear Headphones")).toContain(
      "headphones",
    );
    expect(subtypeFallbackImage("appliances", "Birchfield Air Conditioner")).toContain(
      "air-conditioner",
    );
  });

  it("matches kitchen and beauty subtypes from titles", () => {
    expect(subtypeFallbackImage("kitchen", "Whirlblend Countertop Blender")).toContain("blender");
    expect(subtypeFallbackImage("beauty", "Sleekline Hair Straightener")).toContain(
      "hair-straightener",
    );
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

  it("provides at least 10 demo products per major category", () => {
    for (const slug of categories) {
      expect(getCategoryDemoProducts(slug).length).toBeGreaterThanOrEqual(10);
    }
  });

  it("uses distinct photo paths within every major category (no shared collage)", () => {
    for (const slug of categories) {
      const products = getCategoryDemoProducts(slug);
      const images = products.map((p) => p.image);
      const unique = new Set(images);
      if (unique.size !== images.length) {
        const dups = images.filter((img, i) => images.indexOf(img) !== i);
        throw new Error(`${slug} has duplicate images: ${[...new Set(dups)].join(", ")}`);
      }
      expect(unique.size).toBe(images.length);
      for (const image of images) {
        expect(image).not.toContain("/demo-icons/");
        expect(image).not.toContain("/images/categories/");
        expect(image).toMatch(/\.(png|jpe?g|webp)$/i);
        expect(image).toMatch(new RegExp(`/images/products/${slug}/`));
      }
    }
  });

  it("maps kitchen subtypes to the expected dedicated files", () => {
    const expected: Record<string, string> = {
      cookware: "cookware.jpg",
      dinnerware: "dinnerware.jpg",
      utensils: "utensils.jpg",
      blender: "blender.jpg",
      "coffee machine": "coffee-machine.jpg",
      kettle: "kettle.jpg",
      "cutting board": "cutting-board.jpg",
      "food storage": "food-storage.jpg",
      bakeware: "bakeware.jpg",
      organizer: "organizer.jpg",
    };
    for (const product of getCategoryDemoProducts("kitchen")) {
      const file = expected[product.subtype];
      expect(file).toBeTruthy();
      expect(product.image).toBe(`/images/products/kitchen/${file}`);
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
    for (const product of products) {
      expect(product.categorySlug).toBe("beauty");
    }
  });

  it("never mixes footwear, appliances, or accessories demos across categories", () => {
    const footwear = new Set(getCategoryDemoProducts("footwear").map((p) => p.id));
    const appliances = new Set(getCategoryDemoProducts("appliances").map((p) => p.id));
    const accessories = new Set(getCategoryDemoProducts("accessories").map((p) => p.id));
    for (const id of footwear) {
      expect(appliances.has(id)).toBe(false);
      expect(accessories.has(id)).toBe(false);
    }
  });
});
