/** Stable image paths for seeded / demo products and categories. */

/** Compact brand mark used as a product-card placeholder. */
export const BRAND_FALLBACK_IMAGE = "/brand/logo-app-icon-light.png";

export const productImages: Record<string, string> = {
  "cp-apex-ah4200": "/images/products/dishwasher.png",
  "cp-air-purifier": "/images/products/air-purifier.png",
  "cp-running-shoe": "/images/products/running-shoe.png",
  "cp-cordless-vacuum": "/images/products/cordless-vacuum.png",
};

export const categoryImages: Record<string, string> = {
  electronics: "/images/categories/electronics.png",
  appliances: "/images/categories/appliances.png",
  footwear: "/images/categories/footwear.png",
  home: "/images/categories/home.png",
  headphones: "/images/categories/headphones.png",
  outdoors: "/images/categories/outdoors.png",
  automotive: "/images/categories/automotive.png",
};

export const emptyStateImage = "/images/empty-states/saved-watchlist.svg";

export function productImageFor(productId: string) {
  return productImages[productId] ?? BRAND_FALLBACK_IMAGE;
}

export function isBrandFallbackImage(src: string) {
  return (
    src === BRAND_FALLBACK_IMAGE ||
    src.includes("logo-app-icon") ||
    src.includes("logo9-icon") ||
    src.includes("logo-mark") ||
    src.includes("logo8-mark") ||
    src.includes("logo8-icon") ||
    src.includes("logo-circle")
  );
}

/** Extra padding so brand placeholders stay small inside product thumbnails. */
export function productThumbClass(src: string) {
  return isBrandFallbackImage(src)
    ? "object-contain p-5 sm:p-6"
    : "object-contain p-1.5";
}

/** Retailer / connector logos for listings loaded from the backend. */
export const sourceImages: Record<string, string> = {
  "src-official": "/sources/brands/apex-home.svg",
  "src-retailer-direct": "/sources/brands/best-buy.svg",
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
