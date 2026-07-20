/** Stable image paths for seeded / demo products and categories. */

import {
  categoryImageSrc,
  categoryImages as sharedCategoryImages,
  normalizeCategoryKey,
} from "@/lib/category-visuals";

/** Compact brand mark used as a product-card placeholder. */
export const BRAND_FALLBACK_IMAGE = "/brand/importnest-icon.png";

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

/**
 * Subtype-specific fallbacks — distinct photo thumbnails per product type
 * so category grids never repeat one shared hero image.
 */
export const productImageFallbacks: Record<string, Record<string, string>> = {
  footwear: {
    "trail runner": "/images/products/footwear/trail-runner.jpg",
    "canvas sneaker": "/images/products/footwear/canvas-sneaker.jpg",
    sneaker: "/images/products/footwear/canvas-sneaker.jpg",
    "hiking boot": "/images/products/footwear/hiking-boot.jpg",
    loafer: "/images/products/footwear/loafer.jpg",
    sandal: "/images/products/footwear/sandal.jpg",
    "winter boot": "/images/products/footwear/winter-boot.jpg",
    "training shoe": "/images/products/footwear/training-shoe.jpg",
    "chukka boot": "/images/products/footwear/chukka-boot.jpg",
  },
  accessories: {
    wallet: "/images/products/accessories/wallet.jpg",
    backpack: "/images/products/accessories/backpack.jpg",
    "phone case": "/images/products/accessories/phone-case.jpg",
    "travel organizer": "/images/products/accessories/travel-organizer.jpg",
    sunglasses: "/images/products/accessories/sunglasses.jpg",
    cable: "/images/products/accessories/cable-set.jpg",
    crossbody: "/images/products/accessories/crossbody-bag.jpg",
    "watch band": "/images/products/accessories/watch-band.jpg",
  },
  beauty: {
    "hair dryer": "/images/products/beauty/hair-dryer.jpg",
    "cleansing brush": "/images/products/beauty/facial-cleansing-brush.jpg",
    "facial cleansing": "/images/products/beauty/facial-cleansing-brush.jpg",
    shaver: "/images/products/beauty/electric-shaver.jpg",
    razor: "/images/products/beauty/electric-shaver.jpg",
    "skincare fridge": "/images/products/beauty/skincare-fridge.jpg",
    "curling iron": "/images/products/beauty/curling-iron.jpg",
    "flat iron": "/images/products/beauty/curling-iron.jpg",
    "led mirror": "/images/products/beauty/led-mirror.jpg",
    mirror: "/images/products/beauty/led-mirror.jpg",
    massage: "/images/products/beauty/massage-tool.jpg",
    manicure: "/images/products/beauty/manicure-kit.jpg",
    nail: "/images/products/beauty/manicure-kit.jpg",
    steamer: "/images/products/beauty/skincare-fridge.jpg",
  },
  appliances: {
    dishwasher: "/images/products/appliances/dishwasher.jpg",
    vacuum: "/images/products/appliances/vacuum.jpg",
    "upright vacuum": "/images/products/appliances/upright-vacuum.jpg",
    microwave: "/images/products/appliances/microwave.jpg",
    toaster: "/images/products/appliances/toaster-oven.jpg",
    "slow cooker": "/images/products/appliances/slow-cooker.jpg",
    "air fryer": "/images/products/appliances/air-fryer.jpg",
    freezer: "/images/products/appliances/freezer.jpg",
    "window ac": "/images/products/appliances/window-ac.jpg",
    dehumidifier: "/images/products/appliances/dehumidifier.jpg",
  },
  kitchen: {
    cookware: "/images/products/kitchen/cookware.jpg",
    "pour-over": "/images/products/kitchen/pour-over.jpg",
    coffee: "/images/products/kitchen/pour-over.jpg",
    knife: "/images/products/kitchen/knife-block.jpg",
    mixer: "/images/products/kitchen/stand-mixer.jpg",
    "cutting board": "/images/products/kitchen/cutting-board.jpg",
    kettle: "/images/products/kitchen/kettle.jpg",
    storage: "/images/products/kitchen/food-storage.jpg",
    skillet: "/images/products/kitchen/cast-iron.jpg",
    "cast iron": "/images/products/kitchen/cast-iron.jpg",
  },
  home: {
    blanket: "/images/products/home/blanket.jpg",
    lamp: "/images/products/home/table-lamp.jpg",
    storage: "/images/products/home/storage-bins.jpg",
    pillow: "/images/products/home/throw-pillow.jpg",
    filter: "/images/products/home/air-filter.jpg",
    "air purifier": "/images/products/home/air-filter.jpg",
    clock: "/images/products/home/wall-clock.jpg",
    diffuser: "/images/products/home/diffuser.jpg",
    curtain: "/images/products/home/curtains.jpg",
  },
  electronics: {
    ultrabook: "/images/products/electronics/ultrabook.jpg",
    laptop: "/images/products/electronics/ultrabook.jpg",
    earbuds: "/images/products/electronics/earbuds.jpg",
    streaming: "/images/products/electronics/streaming-stick.jpg",
    smartwatch: "/images/products/electronics/smartwatch.jpg",
    tablet: "/images/products/electronics/tablet.jpg",
    keyboard: "/images/products/electronics/keyboard.jpg",
    ssd: "/images/products/electronics/ssd.jpg",
    speaker: "/images/products/electronics/speaker.jpg",
  },
  automotive: {
    "dash cam": "/images/products/automotive/dash-cam.jpg",
    "jump starter": "/images/products/automotive/jump-starter.jpg",
    cargo: "/images/products/automotive/cargo-organizer.jpg",
    headlight: "/images/products/automotive/headlight-kit.jpg",
    "phone mount": "/images/products/automotive/phone-mount.jpg",
    "floor mat": "/images/products/automotive/floor-mats.jpg",
    inflator: "/images/products/automotive/tire-inflator.jpg",
    "car vacuum": "/images/products/automotive/car-vacuum.jpg",
  },
  outdoors: {
    daypack: "/images/products/outdoors/daypack.jpg",
    tent: "/images/products/outdoors/tent.jpg",
    "sleeping bag": "/images/products/outdoors/sleeping-bag.jpg",
    stove: "/images/products/outdoors/camp-stove.jpg",
    bottle: "/images/products/outdoors/water-bottle.jpg",
    trekking: "/images/products/outdoors/trekking-poles.jpg",
    lantern: "/images/products/outdoors/lantern.jpg",
    chair: "/images/products/outdoors/camp-chair.jpg",
  },
};

/** Resolve a category image for cards/headers — never returns a broken path. */
export function categoryImageFor(category: string, fallback = BRAND_FALLBACK_IMAGE) {
  const key = normalizeCategoryKey(category);
  return (
    homeCategoryImages[key] ??
    categoryImageSrc(key) ??
    categoryImages[key] ??
    categoryImages[category] ??
    fallback
  );
}

export const emptyStateImage = "/images/empty-states/saved-watchlist.svg";

/**
 * Match title/subtitle text against subtype keys for a category.
 * Longer keys win so "hiking boot" beats a hypothetical "boot".
 */
export function subtypeFallbackImage(
  categorySlug: string | undefined,
  title?: string | null,
  subtitle?: string | null,
): string | null {
  if (!categorySlug) return null;
  const key = normalizeCategoryKey(categorySlug);
  const map = productImageFallbacks[key];
  if (!map) return null;

  const haystack = `${title ?? ""} ${subtitle ?? ""}`.toLowerCase();
  if (!haystack.trim()) return null;

  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [needle, src] of entries) {
    if (haystack.includes(needle)) return src;
  }
  return null;
}

/**
 * Product photo resolution:
 * 1. product.imageUrl / primaryImage
 * 2. listing.imageUrl
 * 3. seeded product id map
 * 4. subtype-specific fallback (title/subtitle match)
 * 5. category-specific fallback
 * 6. neutral brand fallback
 */
export function getProductDisplayImage(options: {
  productId?: string;
  categorySlug?: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  primaryImage?: string | null;
  listingImageUrl?: string | null;
}): string {
  if (options.imageUrl?.trim()) return options.imageUrl.trim();
  if (options.primaryImage?.trim()) return options.primaryImage.trim();
  if (options.listingImageUrl?.trim()) return options.listingImageUrl.trim();
  if (options.productId && productImages[options.productId]) {
    return productImages[options.productId]!;
  }
  const subtype = subtypeFallbackImage(
    options.categorySlug,
    options.title,
    options.subtitle,
  );
  if (subtype) return subtype;
  if (options.categorySlug) return categoryImageFor(options.categorySlug);
  return BRAND_FALLBACK_IMAGE;
}

export function productImageFor(
  productId: string,
  categorySlug?: string,
  title?: string | null,
) {
  return getProductDisplayImage({ productId, categorySlug, title });
}

export function homeTopProductImageFor(
  productId: string,
  categorySlug?: string,
  title?: string | null,
) {
  return (
    homeTopProductImages[productId] ?? productImageFor(productId, categorySlug, title)
  );
}

export function homeDealImageFor(
  productId: string,
  categorySlug?: string,
  title?: string | null,
) {
  return homeDealImages[productId] ?? productImageFor(productId, categorySlug, title);
}

export function isBrandFallbackImage(src: string) {
  return (
    src === BRAND_FALLBACK_IMAGE ||
    src.includes("importnest-icon") ||
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
