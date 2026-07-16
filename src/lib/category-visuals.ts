/**
 * Shared category visual metadata for homepage cards, clarify flow,
 * search results headers, and empty states. Keep image paths and copy here —
 * do not duplicate mappings in UI components.
 */

export const categoryImages: Record<string, string> = {
  electronics: "/images/categories/electronics.png",
  appliances: "/images/categories/appliances.png",
  kitchen: "/images/categories/kitchen.png",
  footwear: "/images/categories/footwear.png",
  beauty: "/images/categories/beauty.png",
  accessories: "/images/categories/accessories.png",
  automotive: "/images/categories/automotive.png",
  outdoors: "/images/categories/outdoors.png",
  home: "/images/categories/home.png",
};

export const categoryDescriptions: Record<string, string> = {
  electronics: "Phones, audio, tablets, laptops, and smart devices.",
  appliances: "Kitchen, laundry, cleaning, and home appliances.",
  kitchen: "Cookware, coffee tools, food prep, and kitchen essentials.",
  footwear: "Running shoes, casual shoes, and seasonal footwear.",
  beauty: "Beauty devices, grooming tools, and personal-care products.",
  accessories: "Chargers, cases, bags, organizers, and everyday add-ons.",
  automotive: "Car accessories, tools, chargers, and maintenance products.",
  outdoors: "Backpacks, camping gear, travel tools, and outdoor essentials.",
  home: "Furniture, cleaning, storage, and smart-home products.",
};

const CATEGORY_TITLES: Record<string, string> = {
  electronics: "Electronics",
  appliances: "Appliances",
  kitchen: "Kitchen",
  footwear: "Footwear",
  beauty: "Beauty",
  accessories: "Accessories",
  automotive: "Automotive",
  outdoors: "Outdoors",
  home: "Home",
};

/** Slugs used in nav/DB that alias onto the visual key set above. */
const CATEGORY_ALIASES: Record<string, string> = {
  "beauty-devices": "beauty",
  headphones: "electronics",
  audio: "electronics",
  "leisure-outdoors": "outdoors",
  leisure: "outdoors",
};

/**
 * Categories known to have image files on disk. Keys without a file still
 * resolve a path for the mapping, but `categoryHasImage` reports false so the
 * UI can show a neutral placeholder instead of a broken <img>.
 */
const CATEGORIES_WITH_IMAGE_FILES = new Set([
  "electronics",
  "appliances",
  "kitchen",
  "footwear",
  "beauty",
  "accessories",
  "automotive",
  "outdoors",
  "home",
]);

export function normalizeCategoryKey(category: string): string {
  const raw = category.trim().toLowerCase();
  return CATEGORY_ALIASES[raw] ?? raw;
}

export function categoryDisplayTitle(category: string, title?: string): string {
  if (title?.trim()) return title.trim();
  const key = normalizeCategoryKey(category);
  return CATEGORY_TITLES[key] ?? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function categoryDescriptionFor(category: string, description?: string): string {
  if (description?.trim()) return description.trim();
  const key = normalizeCategoryKey(category);
  return categoryDescriptions[key] ?? "Browse approved offers in this category.";
}

/** Image path when mapped; null when the category is unknown. */
export function categoryImageSrc(category: string): string | null {
  const key = normalizeCategoryKey(category);
  return categoryImages[key] ?? null;
}

/** True when we expect a real file behind the mapped path. */
export function categoryHasImage(category: string): boolean {
  const key = normalizeCategoryKey(category);
  return CATEGORIES_WITH_IMAGE_FILES.has(key) && Boolean(categoryImages[key]);
}

export function categoryImageAlt(category: string, title?: string): string {
  return `${categoryDisplayTitle(category, title)} category image`;
}
