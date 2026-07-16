import { describe, expect, it } from "vitest";
import {
  categoryDescriptionFor,
  categoryDisplayTitle,
  categoryHasImage,
  categoryImageAlt,
  categoryImageSrc,
  normalizeCategoryKey,
} from "@/lib/category-visuals";

describe("category-visuals", () => {
  it("aliases beauty-devices to beauty", () => {
    expect(normalizeCategoryKey("beauty-devices")).toBe("beauty");
    expect(categoryImageSrc("beauty-devices")).toBe("/images/categories/beauty.png");
    expect(categoryHasImage("beauty-devices")).toBe(true);
  });

  it("returns appliances copy and image for clarify category", () => {
    expect(categoryDisplayTitle("appliances")).toBe("Appliances");
    expect(categoryDescriptionFor("appliances")).toContain("Kitchen");
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
});
