/** Stable image paths for seeded / demo products and categories. */

/** Compact brand mark used as a product-card placeholder. */
export const BRAND_FALLBACK_IMAGE = "/brand/logo-app-icon-light.png";

export const productImages: Record<string, string> = {
  "cp-apex-ah4200": "/products/dishwasher.png",
  "cp-air-purifier": "/products/air-purifier.png",
  "cp-running-shoe": "/products/running-shoe.png",
  "cp-cordless-vacuum": "/products/cordless-vacuum.png",
};

export const categoryImages: Record<string, string> = {
  electronics: "/categories/electronics.png",
  appliances: "/categories/appliances.png",
  footwear: "/categories/footwear.png",
  home: "/categories/home.png",
};

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
  "src-official": "/sources/official.svg",
  "src-retailer-direct": "/sources/retailer-direct.svg",
  "src-local-electronics": "/sources/local-electronics.svg",
  "src-authorized-outlet": "/sources/authorized-outlet.svg",
  "src-discount-home": "/sources/discount-home.svg",
  "src-amazon": "/sources/amazon.svg",
  "src-idealo": "/sources/idealo.svg",
  "src-google-shopping": "/sources/google-shopping.svg",
};

export function sourceImageFor(sourceId: string) {
  return sourceImages[sourceId] ?? BRAND_FALLBACK_IMAGE;
}
