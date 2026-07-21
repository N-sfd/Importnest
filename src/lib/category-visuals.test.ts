import { describe, expect, it } from "vitest";
import {
  categoryDescriptionFor,
  categoryDisplayTitle,
  categoryHasImage,
  categoryImageAlt,
  categoryImageSrc,
  normalizeCategoryKey,
  normalizeCategorySlug,
  relatedCategorySlugs,
} from "@/lib/category-visuals";
import { getCategoryCollageImages } from "@/lib/images";

describe("category-visuals", () => {
  it("aliases beauty-devices to beauty", () => {
    expect(normalizeCategoryKey("beauty-devices")).toBe("beauty");
    expect(categoryImageSrc("beauty-devices")).toBe("/images/categories/beauty.png");
    expect(categoryHasImage("beauty-devices")).toBe(true);
  });

  it("returns appliances copy and image for clarify category", () => {
    expect(categoryDisplayTitle("appliances")).toBe("Appliances");
    expect(categoryDescriptionFor("appliances")).toContain("Compare");
    expect(categoryDescriptionFor("electronics")).toContain("phones");
    expect(categoryImageSrc("appliances")).toBe("/images/categories/appliances.png");
    expect(categoryImageAlt("appliances")).toBe("Appliances category image");
  });

  it("allows title/description overrides", () => {
    expect(categoryDisplayTitle("appliances", "Kitchen appliances")).toBe("Kitchen appliances");
    expect(categoryDescriptionFor("appliances", "Custom desc")).toBe("Custom desc");
  });

  it("returns null image for unknown categories without breaking", () => {
    expect(categoryImageSrc("unknown-widget")).toBeNull();
    expect(categoryHasImage("unknown-widget")).toBe(false);
    expect(categoryDisplayTitle("unknown-widget")).toBe("Unknown Widget");
  });

  it("returns related categories that exclude the current department", () => {
    const related = relatedCategorySlugs("footwear");
    expect(related).not.toContain("footwear");
    expect(related.length).toBeGreaterThan(0);
  });

  it("normalizes any beauty variant to the canonical DB/URL slug", () => {
    expect(normalizeCategorySlug("Beauty")).toBe("beauty-devices");
    expect(normalizeCategorySlug("Beauty Devices")).toBe("beauty-devices");
    expect(normalizeCategorySlug("beauty_devices")).toBe("beauty-devices");
    expect(normalizeCategorySlug("beauty-devices")).toBe("beauty-devices");
    expect(normalizeCategorySlug("Kitchen")).toBe("kitchen");
  });
});

describe("kitchen + appliances collage", () => {
  it("uses microwave, dishwasher, coffee maker, and air fryer thumbs", () => {
    const thumbs = getCategoryCollageImages("appliances", "kitchen");
    expect(thumbs).toEqual([
      "/images/products/appliances/microwave.jpg",
      "/images/products/appliances/dishwasher.jpg",
      "/images/products/appliances/coffee-maker.jpg",
      "/images/products/appliances/air-fryer.jpg",
    ]);
  });
});
