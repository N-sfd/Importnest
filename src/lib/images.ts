/** Stable image paths for seeded / demo products and categories. */

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
  return productImages[productId] ?? "/brand/logo-mark.png";
}

/** Retailer / connector logos for listings loaded from the backend. */
export const sourceImages: Record<string, string> = {
  "src-official": "/sources/official.svg",
  "src-retailer-direct": "/sources/retailer-direct.svg",
  "src-local-electronics": "/sources/local-electronics.svg",
  "src-authorized-outlet": "/sources/authorized-outlet.svg",
  "src-discount-home": "/sources/discount-home.svg",
};

export function sourceImageFor(sourceId: string) {
  return sourceImages[sourceId] ?? "/brand/logo-mark.png";
}
