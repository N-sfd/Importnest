import { describe, expect, it } from "vitest";
import { getCategoryDemoProducts } from "@/data/category-demo-products";
import {
  BRAND_FALLBACK_IMAGE,
  getFallbackByProductId,
  getProductDisplayImage,
  imageForSubtype,
  productImageAlt,
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

  it("rotates to a real category photo — not the brand mark — when the category is known but the subtype isn't", () => {
    const image = getProductDisplayImage({ productId: "unknown-product", categorySlug: "appliances" });
    expect(image).not.toBe(BRAND_FALLBACK_IMAGE);
    expect(image).toMatch(/^\/images\/products\/appliances\//);
  });

  it("falls back to the brand mark only when the category itself is unrecognized", () => {
    expect(
      getProductDisplayImage({ productId: "unknown-product", categorySlug: "not-a-real-category" }),
    ).toBe(BRAND_FALLBACK_IMAGE);
  });

  it("aliases beauty-devices to beauty subtype photos", () => {
    expect(
      getProductDisplayImage({
        categorySlug: "beauty-devices",
        title: "Rosemere Hair Dryer",
      }),
    ).toContain("/images/products/beauty/");
  });

  it("uses brand fallback when no product, subtype, or category signal is available", () => {
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

  it("resolves distinct images per subtype for Featured/Best deals card data", () => {
    expect(subtypeFallbackImage("kitchen", "ChefLine Electric Kettle")).toContain("kettle");
    expect(subtypeFallbackImage("electronics", "Nimbus Pro Tablet")).toContain("tablet");
    expect(subtypeFallbackImage("electronics", "Nimbus Solace Smartwatch")).toContain("smartwatch");
    expect(subtypeFallbackImage("automotive", "RoadPro Dash Cam 1080p")).toContain("dash-cam");
    expect(subtypeFallbackImage("footwear", "Stride Summer Sandal")).toContain("sandal");
    expect(subtypeFallbackImage("accessories", "CarryAll Leather Bifold Wallet")).toContain(
      "wallet",
    );
    expect(subtypeFallbackImage("beauty-devices", "Verabelle LED Vanity Mirror")).toContain(
      "led-mirror",
    );
  });
});

describe("getFallbackByProductId", () => {
  it("is deterministic — the same product id always resolves to the same image", () => {
    const first = getFallbackByProductId("kitchen", "cp-unknown-kitchen-item");
    const second = getFallbackByProductId("kitchen", "cp-unknown-kitchen-item");
    expect(first).toBe(second);
    expect(first).toMatch(/^\/images\/products\/kitchen\//);
  });

  it("spreads different unknown product ids across the category's photo pool", () => {
    const ids = ["cp-unknown-a", "cp-unknown-b", "cp-unknown-c", "cp-unknown-d", "cp-unknown-e"];
    const images = new Set(ids.map((id) => getFallbackByProductId("kitchen", id)));
    expect(images.size).toBeGreaterThan(1);
  });

  it("returns null for a category with no known fallback pool", () => {
    expect(getFallbackByProductId("unknown-category", "cp-1")).toBeNull();
    expect(getFallbackByProductId(undefined, "cp-1")).toBeNull();
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
