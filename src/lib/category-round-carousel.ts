/**
 * Round-image carousel tiles for category browse pages. Only Appliances is
 * wired up as the pilot (per rollout plan) — every other category resolves to
 * an empty list, so CategoryRoundCarousel simply renders nothing for them.
 *
 * Images resolve through the existing product-images subtype map so tiles
 * reuse real, already-approved photo assets instead of new/invented ones.
 */

import type { CategoryRoundCarouselItem } from "@/components/CategoryRoundCarousel";
import { categoryImageFor } from "@/lib/images";
import { imageForSubtype } from "@/lib/product-images";
import { normalizeCategoryKey } from "@/lib/category-visuals";

const DEALS_BADGE_IMAGE = "/images/categories/deals-badge.svg";

function subtypeHref(categorySlug: string, query: string): string {
  return `/search/results?category=${encodeURIComponent(categorySlug)}&q=${encodeURIComponent(query)}`;
}

function applianceItems(categorySlug: string): CategoryRoundCarouselItem[] {
  const fallback = categoryImageFor("appliances");
  const subtypeImage = (query: string) => imageForSubtype("appliances", query) ?? fallback;

  return [
    {
      slug: "",
      label: "Appliances",
      imageUrl: fallback,
      href: `/search/results?category=${encodeURIComponent(categorySlug)}`,
    },
    {
      slug: "refrigerator",
      label: "Refrigerators",
      imageUrl: subtypeImage("refrigerator"),
      href: subtypeHref(categorySlug, "refrigerator"),
    },
    {
      slug: "washing machine",
      label: "Laundry",
      imageUrl: subtypeImage("washing machine"),
      href: subtypeHref(categorySlug, "washing machine"),
    },
    {
      slug: "cooking",
      label: "Cooking",
      imageUrl: subtypeImage("air fryer"),
      href: subtypeHref(categorySlug, "cooking"),
    },
    {
      slug: "dishwasher",
      label: "Dishwashers",
      imageUrl: subtypeImage("dishwasher"),
      href: subtypeHref(categorySlug, "dishwasher"),
    },
    {
      slug: "freezer",
      label: "Freezers",
      imageUrl: subtypeImage("freezer"),
      href: subtypeHref(categorySlug, "freezer"),
    },
    {
      slug: "small appliance",
      label: "Small Appliances",
      imageUrl: subtypeImage("slow cooker"),
      href: subtypeHref(categorySlug, "small appliance"),
    },
    {
      slug: "vacuum",
      label: "Vacuum Cleaners",
      imageUrl: subtypeImage("vacuum"),
      href: subtypeHref(categorySlug, "vacuum"),
    },
    {
      slug: "air purifier",
      label: "Air Purifiers",
      imageUrl: subtypeImage("air purifier"),
      href: subtypeHref(categorySlug, "air purifier"),
    },
    {
      slug: "coffee maker",
      label: "Coffee Machines",
      imageUrl: subtypeImage("coffee maker"),
      href: subtypeHref(categorySlug, "coffee maker"),
    },
    {
      slug: "microwave",
      label: "Microwaves",
      imageUrl: subtypeImage("microwave"),
      href: subtypeHref(categorySlug, "microwave"),
    },
    {
      slug: "deals",
      label: "Best Deals",
      imageUrl: DEALS_BADGE_IMAGE,
      href: `/search/results?category=${encodeURIComponent(categorySlug)}&sort=lowest_cost`,
      badge: "Deals",
    },
  ];
}

const BUILDERS: Record<string, (categorySlug: string) => CategoryRoundCarouselItem[]> = {
  appliances: applianceItems,
};

/** Round-carousel tiles for a category, or [] when that category isn't wired up yet. */
export function getCategoryRoundCarouselItems(categorySlug: string): CategoryRoundCarouselItem[] {
  const key = normalizeCategoryKey(categorySlug);
  const build = BUILDERS[key];
  return build ? build(categorySlug) : [];
}

/**
 * Resolve which tile should be highlighted from the page's current `q` /
 * `sort` params — mirrors the same subtype-matching convention already used
 * by CategoryBrowseHeader's chip strip.
 */
export function activeRoundCarouselSlug(query: string | undefined, sort: string | undefined): string {
  const trimmedQuery = query?.trim().toLowerCase();
  if (trimmedQuery) return trimmedQuery;
  if (sort === "lowest_cost") return "deals";
  return "";
}
