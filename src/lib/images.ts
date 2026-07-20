/** Stable image paths for seeded / demo products and categories. */

import {
  categoryImageSrc,
  categoryImages as sharedCategoryImages,
} from "@/lib/category-visuals";

/** Compact brand mark used as a product-card placeholder. */
export const BRAND_FALLBACK_IMAGE = "/brand/logo-app-icon-light.png";

const PRODUCT_FILES: Record<string, string> = {
  "cp-apex-ah4200": "dishwasher.png",
  "cp-air-purifier": "air-purifier.png",
  "cp-running-shoe": "running-shoe.png",
  "cp-cordless-vacuum": "cordless-vacuum.png",
};

/** App-wide product thumbnails (compare, saved, search). */
export const productImages: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_FILES).map(([id, file]) => [id, `/images/products/${file}`]),
);

/** Homepage Top Products imagery. */
export const homeTopProductImages: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_FILES).map(([id, file]) => [
    id,
    `/images/home/top-products/${file}`,
  ]),
);

/** Homepage Best Deals imagery. */
export const homeDealImages: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_FILES).map(([id, file]) => [id, `/images/home/deals/${file}`]),
);

/** Shared category paths — single source in category-visuals.ts. */
export const categoryImages: Record<string, string> = {
  ...sharedCategoryImages,
  /** Extra homepage/nav key kept for audio browsing cards. */
  headphones: "/images/categories/headphones.png",
};

/**
 * Homepage Shop by Category imagery.
 * Prefer home-specific assets when present; otherwise shared category visuals.
 */
export const homeCategoryImages: Record<string, string> = {
  headphones: "/images/home/categories/headphones.png",
  outdoors: "/images/home/categories/outdoors.png",
  automotive: "/images/home/categories/automotive.png",
  appliances: "/images/home/categories/appliances.png",
  electronics: "/images/home/categories/electronics.png",
};

/** Resolve a category image for cards/headers — never returns a broken path. */
export function categoryImageFor(category: string, fallback = BRAND_FALLBACK_IMAGE) {
  return (
    homeCategoryImages[category] ??
    categoryImageSrc(category) ??
    categoryImages[category] ??
    fallback
  );
}

export const emptyStateImage = "/images/empty-states/saved-watchlist.svg";

/**
 * Product photo when one is seeded, otherwise the product's own category
 * image (when a category slug is available) rather than one generic brand
 * icon shared by every uncategorized card — real assets only, never invented.
 */
export function getProductDisplayImage(options: {
  productId?: string;
  categorySlug?: string;
  imageUrl?: string | null;
  listingImageUrl?: string | null;
}): string {
  if (options.imageUrl?.trim()) return options.imageUrl.trim();
  if (options.listingImageUrl?.trim()) return options.listingImageUrl.trim();
  if (options.productId && productImages[options.productId]) {
    return productImages[options.productId]!;
  }
  if (options.categorySlug) return categoryImageFor(options.categorySlug);
  return BRAND_FALLBACK_IMAGE;
}

export function productImageFor(productId: string, categorySlug?: string) {
  return getProductDisplayImage({ productId, categorySlug });
}

export function homeTopProductImageFor(productId: string, categorySlug?: string) {
  return homeTopProductImages[productId] ?? productImageFor(productId, categorySlug);
}

export function homeDealImageFor(productId: string, categorySlug?: string) {
  return homeDealImages[productId] ?? productImageFor(productId, categorySlug);
}

export function isBrandFallbackImage(src: string) {
  return (
    src === BRAND_FALLBACK_IMAGE ||
    src.includes("logo-app-icon") ||
    src.includes("logo9-icon") ||
    src.includes("logo-mark") ||
    src.includes("logo8-mark") ||
    src.includes("logo8-icon") ||
    src.includes("logo-circle") ||
    src.includes("/demo-icons/")
  );
}

/**
 * Shopping-card thumbnails: cover for real photos / category imagery;
 * padded contain only for brand-mark placeholders.
 */
export function productThumbClass(src: string) {
  return isBrandFallbackImage(src)
    ? "object-contain p-5 sm:p-6"
    : "object-cover";
}

/** Retailer / connector logos for listings loaded from the backend. */
export const sourceImages: Record<string, string> = {
  "src-official": "/sources/brands/apex-home.svg",
  "src-retailer-direct": "/sources/retailer-direct.svg",
  "src-local-electronics": "/sources/brands/local-apex-dealer.svg",
  "src-authorized-outlet": "/sources/authorized-outlet.svg",
  "src-discount-home": "/sources/brands/wayfair.svg",
  "src-amazon": "/sources/brands/amazon.svg",
  "src-idealo": "/sources/brands/idealo.svg",
  "src-google-shopping": "/sources/brands/google-shopping.svg",
};

export function sourceImageFor(sourceId: string) {
  return sourceImages[sourceId] ?? BRAND_FALLBACK_IMAGE;
}
