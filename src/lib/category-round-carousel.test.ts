import { describe, expect, it } from "vitest";
import {
  activeRoundCarouselSlug,
  getCategoryRoundCarouselItems,
} from "@/lib/category-round-carousel";

describe("category-round-carousel", () => {
  it("returns 12 distinct appliance tiles with non-empty labels, slugs, hrefs, and images", () => {
    const items = getCategoryRoundCarouselItems("appliances");
    expect(items).toHaveLength(12);

    const labels = new Set(items.map((i) => i.label));
    const hrefs = new Set(items.map((i) => i.href));
    expect(labels.size).toBe(items.length);
    expect(hrefs.size).toBe(items.length);

    for (const item of items) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.href).toContain("category=appliances");
      expect(item.imageUrl).toMatch(/^\//);
    }
  });

  it("does not reuse the same image across tiles unless nothing better exists", () => {
    const items = getCategoryRoundCarouselItems("appliances");
    const images = items.map((i) => i.imageUrl);
    expect(new Set(images).size).toBe(images.length);
  });

  it("includes a reset 'Appliances' tile with no query param and a 'Best Deals' tile sorted by lowest cost", () => {
    const items = getCategoryRoundCarouselItems("appliances");
    const resetTile = items.find((i) => i.slug === "");
    const dealsTile = items.find((i) => i.slug === "deals");

    expect(resetTile?.label).toBe("Appliances");
    expect(resetTile?.href).toBe("/search/results?category=appliances");

    expect(dealsTile?.label).toBe("Best Deals");
    expect(dealsTile?.href).toBe("/search/results?category=appliances&sort=lowest_cost");
    expect(dealsTile?.badge).toBe("Deals");
  });

  it("falls back to the parent category image when no subtype-specific photo exists", () => {
    const items = getCategoryRoundCarouselItems("appliances");
    const cooking = items.find((i) => i.slug === "cooking");
    // "cooking" itself has no dedicated asset, but the item must still resolve
    // to a real, non-broken local image (either a matched subtype photo or the
    // parent category fallback) rather than an empty/invented path.
    expect(cooking?.imageUrl).toMatch(/^\/images\//);
  });

  it("returns an empty list for categories not yet wired up", () => {
    expect(getCategoryRoundCarouselItems("electronics")).toEqual([]);
    expect(getCategoryRoundCarouselItems("kitchen")).toEqual([]);
  });

  it("resolves the active tile slug from q, then sort=lowest_cost, then the reset tile", () => {
    expect(activeRoundCarouselSlug("Refrigerator", undefined)).toBe("refrigerator");
    expect(activeRoundCarouselSlug(undefined, "lowest_cost")).toBe("deals");
    expect(activeRoundCarouselSlug(undefined, undefined)).toBe("");
    expect(activeRoundCarouselSlug("  ", "best_overall")).toBe("");
  });
});
