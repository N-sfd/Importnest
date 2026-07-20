/**
 * Centralized product image resolution.
 * Prefer this module over ad-hoc image paths in UI components.
 *
 * Priority for getProductDisplayImage(product):
 * 1. product.imageUrl / primaryImage
 * 2. listing.imageUrl
 * 3. seeded product id map
 * 4. subtype-specific fallback (title, subtitle, tags, subtype)
 * 5. category-specific fallback (/images/categories/…)
 * 6. neutral brand fallback
 */

import {
  categoryDisplayTitle,
  categoryImageSrc,
  normalizeCategoryKey,
} from "@/lib/category-visuals";

/** Compact brand mark used as a product-card placeholder. */
export const BRAND_FALLBACK_IMAGE = "/brand/importnest-icon.png";

/** Consistent square thumbnail size for product cards and grids. */
export const PRODUCT_IMAGE_SIZE = { width: 400, height: 400 } as const;

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

export const productImageFallbacks: Record<string, Record<string, string>> = {
  footwear: {
    "trail runner": "/images/products/footwear/trail-runner.jpg",
    "running shoe": "/images/products/footwear/running-shoe.jpg",
    "canvas sneaker": "/images/products/footwear/canvas-sneaker.jpg",
    sneaker: "/images/products/footwear/canvas-sneaker.jpg",
    "hiking boot": "/images/products/footwear/hiking-boot.jpg",
    loafer: "/images/products/footwear/loafer.jpg",
    sandal: "/images/products/footwear/sandal.jpg",
    "winter boot": "/images/products/footwear/winter-boot.jpg",
    "training shoe": "/images/products/footwear/training-shoe.jpg",
    "chukka boot": "/images/products/footwear/chukka-boot.jpg",
    "casual shoe": "/images/products/footwear/casual-shoe.jpg",
    "dress shoe": "/images/products/footwear/dress-shoe.jpg",
    "slip-on shoe": "/images/products/footwear/slip-on.jpg",
    "slip-on": "/images/products/footwear/slip-on.jpg",
    "slip on": "/images/products/footwear/slip-on.jpg",
  },
  accessories: {
    wallet: "/images/products/accessories/wallet.jpg",
    backpack: "/images/products/accessories/backpack.jpg",
    "phone case": "/images/products/accessories/phone-case.jpg",
    "travel organizer": "/images/products/accessories/travel-organizer.jpg",
    sunglasses: "/images/products/accessories/sunglasses.jpg",
    cable: "/images/products/accessories/cable-set.jpg",
    "charging cable": "/images/products/accessories/cable-set.jpg",
    charging: "/images/products/accessories/cable-set.jpg",
    crossbody: "/images/products/accessories/crossbody-bag.jpg",
    "crossbody bag": "/images/products/accessories/crossbody-bag.jpg",
    "watch band": "/images/products/accessories/watch-band.jpg",
    "laptop sleeve": "/images/products/accessories/laptop-sleeve.jpg",
    "charging pad": "/images/products/accessories/wireless-charger.jpg",
    "wireless charg": "/images/products/accessories/wireless-charger.jpg",
    "wireless charger": "/images/products/accessories/wireless-charger.jpg",
    "wireless-charging-pad": "/images/products/accessories/wireless-charging-pad.jpg",
  },
  beauty: {
    "hair dryer": "/images/products/beauty/hair-dryer.jpg",
    "facial brush": "/images/products/beauty/facial-cleansing-brush.jpg",
    "facial cleansing brush": "/images/products/beauty/facial-cleansing-brush.jpg",
    "cleansing brush": "/images/products/beauty/facial-cleansing-brush.jpg",
    "facial cleansing": "/images/products/beauty/facial-cleansing-brush.jpg",
    "electric shaver": "/images/products/beauty/electric-shaver.jpg",
    shaver: "/images/products/beauty/electric-shaver.jpg",
    razor: "/images/products/beauty/electric-shaver.jpg",
    "skincare fridge": "/images/products/beauty/skincare-fridge.jpg",
    "curling iron": "/images/products/beauty/curling-iron.jpg",
    "hair straightener": "/images/products/beauty/hair-straightener.jpg",
    straightener: "/images/products/beauty/hair-straightener.jpg",
    "flat iron": "/images/products/beauty/hair-straightener.jpg",
    "led mirror": "/images/products/beauty/led-mirror.jpg",
    mirror: "/images/products/beauty/led-mirror.jpg",
    "massage tool": "/images/products/beauty/massage-tool.jpg",
    massage: "/images/products/beauty/massage-tool.jpg",
    "manicure kit": "/images/products/beauty/manicure-kit.jpg",
    manicure: "/images/products/beauty/manicure-kit.jpg",
    nail: "/images/products/beauty/manicure-kit.jpg",
    "grooming kit": "/images/products/beauty/grooming-kit.jpg",
    grooming: "/images/products/beauty/grooming-kit.jpg",
    steamer: "/images/products/beauty/skincare-fridge.jpg",
  },
  appliances: {
    dishwasher: "/images/products/appliances/dishwasher.jpg",
    refrigerator: "/images/products/appliances/refrigerator.jpg",
    fridge: "/images/products/appliances/refrigerator.jpg",
    vacuum: "/images/products/appliances/vacuum.jpg",
    "upright vacuum": "/images/products/appliances/upright-vacuum.jpg",
    microwave: "/images/products/appliances/microwave.jpg",
    "toaster oven": "/images/products/appliances/toaster-oven.jpg",
    toaster: "/images/products/appliances/toaster-oven.jpg",
    "slow cooker": "/images/products/appliances/slow-cooker.jpg",
    "air fryer": "/images/products/appliances/air-fryer.jpg",
    "coffee maker": "/images/products/appliances/coffee-maker.jpg",
    freezer: "/images/products/appliances/freezer.jpg",
    "window ac": "/images/products/appliances/window-ac.jpg",
    "air conditioner": "/images/products/appliances/air-conditioner.jpg",
    dehumidifier: "/images/products/appliances/dehumidifier.jpg",
    "air purifier": "/images/products/appliances/air-purifier.jpg",
    "washing machine": "/images/products/appliances/washing-machine.jpg",
    washer: "/images/products/appliances/washing-machine.jpg",
    "laundry appliance": "/images/products/appliances/washing-machine.jpg",
    laundry: "/images/products/appliances/washing-machine.jpg",
  },
  kitchen: {
    cookware: "/images/products/kitchen/cookware.jpg",
    dinnerware: "/images/products/kitchen/dinnerware.jpg",
    utensils: "/images/products/kitchen/utensils.jpg",
    utensil: "/images/products/kitchen/utensils.jpg",
    blender: "/images/products/kitchen/blender.jpg",
    "pour-over": "/images/products/kitchen/pour-over.jpg",
    "coffee machine": "/images/products/kitchen/coffee-machine.jpg",
    coffee: "/images/products/kitchen/coffee-machine.jpg",
    knife: "/images/products/kitchen/knife-set.jpg",
    "knife set": "/images/products/kitchen/knife-set.jpg",
    "knife-set": "/images/products/kitchen/knife-set.jpg",
    "knife block": "/images/products/kitchen/knife-block.jpg",
    mixer: "/images/products/kitchen/stand-mixer.jpg",
    "stand mixer": "/images/products/kitchen/stand-mixer.jpg",
    "cutting board": "/images/products/kitchen/cutting-board.jpg",
    kettle: "/images/products/kitchen/kettle.jpg",
    "food storage": "/images/products/kitchen/food-storage.jpg",
    storage: "/images/products/kitchen/food-storage.jpg",
    bakeware: "/images/products/kitchen/bakeware.jpg",
    organizer: "/images/products/kitchen/kitchen-organizer.jpg",
    "kitchen organizer": "/images/products/kitchen/kitchen-organizer.jpg",
    skillet: "/images/products/kitchen/cast-iron.jpg",
    "cast iron": "/images/products/kitchen/cast-iron.jpg",
  },
  home: {
    blanket: "/images/products/home/blanket.jpg",
    "table lamp": "/images/products/home/table-lamp.jpg",
    lamp: "/images/products/home/table-lamp.jpg",
    "storage bins": "/images/products/home/storage-bins.jpg",
    storage: "/images/products/home/storage-bins.jpg",
    "throw pillows": "/images/products/home/throw-pillow.jpg",
    pillow: "/images/products/home/throw-pillow.jpg",
    filter: "/images/products/home/air-filter.jpg",
    "home air purifier": "/images/products/home/air-purifier.jpg",
    "air purifier": "/images/products/home/air-purifier.jpg",
    "wall clock": "/images/products/home/wall-clock.jpg",
    clock: "/images/products/home/wall-clock.jpg",
    diffuser: "/images/products/home/diffuser.jpg",
    curtains: "/images/products/home/curtains.jpg",
    curtain: "/images/products/home/curtains.jpg",
    rug: "/images/products/home/rug.jpg",
    organizer: "/images/products/home/home-organizer.jpg",
    "home organizer": "/images/products/home/home-organizer.jpg",
  },
  electronics: {
    phone: "/images/products/electronics/phone.jpg",
    smartphone: "/images/products/electronics/phone.jpg",
    ultrabook: "/images/products/electronics/ultrabook.jpg",
    laptop: "/images/products/electronics/laptop.jpg",
    earbuds: "/images/products/electronics/earbuds.jpg",
    headphones: "/images/products/electronics/headphones.jpg",
    monitor: "/images/products/electronics/monitor.jpg",
    streaming: "/images/products/electronics/streaming-stick.jpg",
    "smart watch": "/images/products/electronics/smartwatch.jpg",
    smartwatch: "/images/products/electronics/smartwatch.jpg",
    tablet: "/images/products/electronics/tablet.jpg",
    keyboard: "/images/products/electronics/keyboard.jpg",
    ssd: "/images/products/electronics/ssd.jpg",
    speaker: "/images/products/electronics/speaker.jpg",
    camera: "/images/products/electronics/camera.jpg",
    "gaming accessory": "/images/products/electronics/gaming.jpg",
    gaming: "/images/products/electronics/gaming.jpg",
    gamepad: "/images/products/electronics/gaming.jpg",
  },
  automotive: {
    "dash cam": "/images/products/automotive/dash-cam.jpg",
    "jump starter": "/images/products/automotive/jump-starter.jpg",
    cargo: "/images/products/automotive/cargo-organizer.jpg",
    headlight: "/images/products/automotive/headlight-kit.jpg",
    "phone mount": "/images/products/automotive/phone-mount.jpg",
    "floor mats": "/images/products/automotive/floor-mats.jpg",
    "floor mat": "/images/products/automotive/floor-mats.jpg",
    "tire inflator": "/images/products/automotive/tire-inflator.jpg",
    inflator: "/images/products/automotive/tire-inflator.jpg",
    "car vacuum": "/images/products/automotive/car-vacuum.jpg",
    "battery charger": "/images/products/automotive/battery-charger.jpg",
    "car charger": "/images/products/automotive/car-charger.jpg",
    "seat cover": "/images/products/automotive/seat-cover.jpg",
    "windshield wipers": "/images/products/automotive/windshield-wipers.jpg",
    wiper: "/images/products/automotive/windshield-wipers.jpg",
    "tool kit": "/images/products/automotive/tool-kit.jpg",
  },
  outdoors: {
    backpack: "/images/products/outdoors/backpack.jpg",
    daypack: "/images/products/outdoors/daypack.jpg",
    tent: "/images/products/outdoors/tent.jpg",
    "sleeping bag": "/images/products/outdoors/sleeping-bag.jpg",
    "portable stove": "/images/products/outdoors/camp-stove.jpg",
    stove: "/images/products/outdoors/camp-stove.jpg",
    "hiking bottle": "/images/products/outdoors/hiking-bottle.jpg",
    bottle: "/images/products/outdoors/hiking-bottle.jpg",
    trekking: "/images/products/outdoors/trekking-poles.jpg",
    "camping lantern": "/images/products/outdoors/lantern.jpg",
    lantern: "/images/products/outdoors/lantern.jpg",
    "outdoor chair": "/images/products/outdoors/camp-chair.jpg",
    chair: "/images/products/outdoors/camp-chair.jpg",
    cooler: "/images/products/outdoors/cooler.jpg",
    "picnic blanket": "/images/products/outdoors/picnic-blanket.jpg",
    picnic: "/images/products/outdoors/picnic-blanket.jpg",
    "travel bag": "/images/products/outdoors/travel-bag.jpg",
  },
};

/** Loose product shape accepted by getProductDisplayImage. */
export type ProductImageSource = {
  id?: string;
  productId?: string;
  title?: string | null;
  modelName?: string | null;
  name?: string | null;
  productName?: string | null;
  subtitle?: string | null;
  category?: string | { slug?: string; name?: string } | null;
  categorySlug?: string | null;
  tags?: string[] | null;
  subtype?: string | null;
  imageUrl?: string | null;
  primaryImage?: string | null;
  listing?: { imageUrl?: string | null } | null;
  listingImageUrl?: string | null;
};

function categorySlugFrom(product: ProductImageSource): string | undefined {
  if (product.categorySlug?.trim()) return product.categorySlug.trim();
  if (typeof product.category === "string" && product.category.trim()) {
    return product.category.trim();
  }
  if (product.category && typeof product.category === "object" && product.category.slug) {
    return product.category.slug;
  }
  return undefined;
}

function titleFrom(product: ProductImageSource): string | null {
  return (
    product.title?.trim() ||
    product.modelName?.trim() ||
    product.name?.trim() ||
    product.productName?.trim() ||
    null
  );
}

function tagsFrom(product: ProductImageSource): string[] | null {
  const tags = [...(product.tags ?? [])];
  if (product.subtype?.trim()) tags.unshift(product.subtype.trim());
  return tags.length ? tags : null;
}

/** Category photo under /images/categories — never a broken path. */
export function categoryFallbackImage(
  category: string,
  fallback = BRAND_FALLBACK_IMAGE,
): string {
  return categoryImageSrc(category) ?? fallback;
}

/**
 * Match title/subtitle/tags text against subtype keys for a category.
 * Longer keys win so "hiking boot" beats a hypothetical "boot".
 * Exact subtype tag matches are preferred first.
 */
export function subtypeFallbackImage(
  categorySlug: string | undefined,
  title?: string | null,
  subtitle?: string | null,
  tags?: string[] | null,
): string | null {
  if (!categorySlug) return null;
  const key = normalizeCategoryKey(categorySlug);
  const map = productImageFallbacks[key];
  if (!map) return null;

  for (const tag of tags ?? []) {
    const exact = map[tag.toLowerCase().trim()];
    if (exact) return exact;
  }

  const haystack = `${title ?? ""} ${subtitle ?? ""} ${(tags ?? []).join(" ")}`.toLowerCase();
  if (!haystack.trim()) return null;

  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [needle, src] of entries) {
    if (haystack.includes(needle)) return src;
  }
  return null;
}

/** Direct subtype → image lookup for seeded category browse tiles. */
export function imageForSubtype(categorySlug: string, subtype: string): string | null {
  const key = normalizeCategoryKey(categorySlug);
  const map = productImageFallbacks[key];
  if (!map) return null;
  const needle = subtype.toLowerCase().trim();
  if (map[needle]) return map[needle]!;
  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [keyNeedle, src] of entries) {
    if (needle.includes(keyNeedle) || keyNeedle.includes(needle)) return src;
  }
  return null;
}

/**
 * Resolve a stable display image for a product.
 * Accepts a product-like object (preferred) or a flat options bag.
 */
export function getProductDisplayImage(product: ProductImageSource): string {
  if (product.imageUrl?.trim()) return product.imageUrl.trim();
  if (product.primaryImage?.trim()) return product.primaryImage.trim();

  const listingUrl = product.listing?.imageUrl?.trim() || product.listingImageUrl?.trim();
  if (listingUrl) return listingUrl;

  const productId = product.productId ?? product.id;
  if (productId && productImages[productId]) {
    return productImages[productId]!;
  }

  const categorySlug = categorySlugFrom(product);
  const title = titleFrom(product);
  const subtype = subtypeFallbackImage(categorySlug, title, product.subtitle, tagsFrom(product));
  if (subtype) return subtype;

  if (categorySlug) return categoryFallbackImage(categorySlug);
  return BRAND_FALLBACK_IMAGE;
}

export function productImageFor(
  productId: string,
  categorySlug?: string,
  title?: string | null,
) {
  return getProductDisplayImage({ productId, categorySlug, title });
}

/** Accessible alt text for product thumbnails. */
export function productImageAlt(product: ProductImageSource): string {
  const title = titleFrom(product);
  const categorySlug = categorySlugFrom(product);
  if (title) return title;
  if (product.subtype?.trim()) {
    const cat = categorySlug ? categoryDisplayTitle(categorySlug) : "Product";
    return `${product.subtype.trim()} — ${cat}`;
  }
  if (categorySlug) return `${categoryDisplayTitle(categorySlug)} product`;
  return "Product image";
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
 * Shopping-card thumbnails: contain on light studio backgrounds so product
 * photos are never stretched or harshly cropped. Brand-mark placeholders keep
 * extra padding so the mark reads as a placeholder.
 */
export function productThumbClass(src: string) {
  return isBrandFallbackImage(src)
    ? "object-contain p-5 sm:p-6"
    : "object-contain p-2.5 sm:p-3";
}
