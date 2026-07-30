/**
 * Round-image carousel tiles for category browse pages, covering every shop
 * category (Appliances, Electronics, Kitchen, Footwear, Beauty, Accessories,
 * Automotive, Outdoors, Home). Categories not in BUILDERS resolve to an empty
 * list, so CategoryRoundCarousel simply renders nothing for them.
 *
 * Subtype tiles use dedicated transparent PNG assets under
 * /images/subtypes/{category}/ (studio backdrops removed) so circles never
 * show a white disc. Reset tiles use lifestyle category collages with cover.
 */

import type { CategoryImageMode, CategoryRoundCarouselItem } from "@/components/CategoryRoundCarousel";
import { categoryDisplayTitle, normalizeCategoryKey } from "@/lib/category-visuals";
import { categoryImageFor } from "@/lib/images";

const DEALS_BADGE_IMAGE = "/images/categories/deals-badge.svg";

type SubtypeDef = {
  /** Search keyword used both as the tile's slug and the `q` filter value. */
  query: string;
  label: string;
  /** Transparent PNG (or lifestyle photo) for the circle tile. */
  imageUrl: string;
  imageMode: CategoryImageMode;
};

function subtypeHref(categorySlug: string, query: string): string {
  return `/search/results?category=${encodeURIComponent(categorySlug)}&q=${encodeURIComponent(query)}`;
}

function buildCategoryItems(categorySlug: string, subtypes: SubtypeDef[]): CategoryRoundCarouselItem[] {
  const fallback = categoryImageFor(categorySlug);

  const resetTile: CategoryRoundCarouselItem = {
    slug: "",
    label: categoryDisplayTitle(categorySlug),
    imageUrl: fallback,
    href: `/search/results?category=${encodeURIComponent(categorySlug)}`,
    // Department image is a wide lifestyle/collage photo — cropping to fill
    // the circle reads better than letterboxing it with object-fit: contain.
    imageMode: "lifestyle-cover",
  };

  const subtypeTiles: CategoryRoundCarouselItem[] = subtypes.map((s) => ({
    slug: s.query,
    label: s.label,
    imageUrl: s.imageUrl,
    href: subtypeHref(categorySlug, s.query),
    imageMode: s.imageMode,
  }));

  const dealsTile: CategoryRoundCarouselItem = {
    slug: "deals",
    label: "Best Deals",
    imageUrl: DEALS_BADGE_IMAGE,
    href: `/search/results?category=${encodeURIComponent(categorySlug)}&sort=lowest_cost`,
    badge: "Deals",
    imageMode: "transparent-contain",
  };

  return [resetTile, ...subtypeTiles, dealsTile];
}

/** Transparent subtype PNG helper — keeps paths consistent and auditable. */
function subtypePng(category: string, file: string): string {
  return `/images/subtypes/${category}/${file}.png`;
}

/** Pre-circularized subtype PNGs — fill the CSS circle edge-to-edge. */
const CIRCLE_COVER: CategoryImageMode = "photo-cover";

const SUBTYPES: Record<string, SubtypeDef[]> = {
  appliances: [
    { query: "refrigerator", label: "Refrigerators", imageUrl: subtypePng("appliances", "refrigerator"), imageMode: CIRCLE_COVER },
    { query: "washing machine", label: "Laundry", imageUrl: subtypePng("appliances", "washing-machine"), imageMode: CIRCLE_COVER },
    { query: "cooking", label: "Cooking", imageUrl: subtypePng("appliances", "air-fryer"), imageMode: CIRCLE_COVER },
    { query: "dishwasher", label: "Dishwashers", imageUrl: subtypePng("appliances", "dishwasher"), imageMode: CIRCLE_COVER },
    { query: "freezer", label: "Freezers", imageUrl: subtypePng("appliances", "freezer"), imageMode: CIRCLE_COVER },
    { query: "small appliance", label: "Small Appliances", imageUrl: subtypePng("appliances", "slow-cooker"), imageMode: CIRCLE_COVER },
    { query: "vacuum", label: "Vacuum Cleaners", imageUrl: subtypePng("appliances", "vacuum"), imageMode: CIRCLE_COVER },
    { query: "air purifier", label: "Air Purifiers", imageUrl: subtypePng("appliances", "air-purifier"), imageMode: CIRCLE_COVER },
    { query: "coffee maker", label: "Coffee Machines", imageUrl: subtypePng("appliances", "coffee-maker"), imageMode: CIRCLE_COVER },
    { query: "microwave", label: "Microwaves", imageUrl: subtypePng("appliances", "microwave"), imageMode: CIRCLE_COVER },
  ],
  electronics: [
    { query: "smartphone", label: "Phones", imageUrl: subtypePng("electronics", "phone"), imageMode: CIRCLE_COVER },
    { query: "laptop", label: "Laptops", imageUrl: subtypePng("electronics", "laptop"), imageMode: CIRCLE_COVER },
    { query: "tablet", label: "Tablets", imageUrl: subtypePng("electronics", "tablet"), imageMode: CIRCLE_COVER },
    { query: "headphones", label: "Headphones", imageUrl: subtypePng("electronics", "headphones"), imageMode: CIRCLE_COVER },
    { query: "earbuds", label: "Earbuds", imageUrl: subtypePng("electronics", "earbuds"), imageMode: CIRCLE_COVER },
    { query: "monitor", label: "Monitors", imageUrl: subtypePng("electronics", "monitor"), imageMode: CIRCLE_COVER },
    { query: "smart watch", label: "Smartwatches", imageUrl: subtypePng("electronics", "smartwatch"), imageMode: CIRCLE_COVER },
    { query: "speaker", label: "Speakers", imageUrl: subtypePng("electronics", "speaker"), imageMode: CIRCLE_COVER },
    { query: "camera", label: "Cameras", imageUrl: subtypePng("electronics", "camera"), imageMode: CIRCLE_COVER },
    { query: "gaming accessory", label: "Gaming", imageUrl: subtypePng("electronics", "gaming"), imageMode: CIRCLE_COVER },
  ],
  kitchen: [
    { query: "cookware", label: "Cookware", imageUrl: subtypePng("kitchen", "cookware"), imageMode: CIRCLE_COVER },
    { query: "blender", label: "Blenders", imageUrl: subtypePng("kitchen", "blender"), imageMode: CIRCLE_COVER },
    { query: "coffee machine", label: "Coffee Machines", imageUrl: subtypePng("kitchen", "coffee-machine"), imageMode: CIRCLE_COVER },
    { query: "knife set", label: "Knife Sets", imageUrl: subtypePng("kitchen", "knife-set"), imageMode: CIRCLE_COVER },
    { query: "stand mixer", label: "Stand Mixers", imageUrl: subtypePng("kitchen", "stand-mixer"), imageMode: CIRCLE_COVER },
    { query: "cutting board", label: "Cutting Boards", imageUrl: subtypePng("kitchen", "cutting-board"), imageMode: CIRCLE_COVER },
    { query: "kettle", label: "Kettles", imageUrl: subtypePng("kitchen", "kettle"), imageMode: CIRCLE_COVER },
    { query: "bakeware", label: "Bakeware", imageUrl: subtypePng("kitchen", "bakeware"), imageMode: CIRCLE_COVER },
    { query: "food storage", label: "Food Storage", imageUrl: subtypePng("kitchen", "food-storage"), imageMode: CIRCLE_COVER },
    { query: "kitchen organizer", label: "Organizers", imageUrl: subtypePng("kitchen", "organizer"), imageMode: CIRCLE_COVER },
  ],
  footwear: [
    { query: "running shoe", label: "Running", imageUrl: subtypePng("footwear", "running-shoe"), imageMode: CIRCLE_COVER },
    { query: "sneaker", label: "Sneakers", imageUrl: subtypePng("footwear", "sneaker"), imageMode: CIRCLE_COVER },
    { query: "trail runner", label: "Trail Runners", imageUrl: subtypePng("footwear", "trail-runner"), imageMode: CIRCLE_COVER },
    { query: "hiking boot", label: "Hiking Boots", imageUrl: subtypePng("footwear", "hiking-boot"), imageMode: CIRCLE_COVER },
    { query: "sandal", label: "Sandals", imageUrl: subtypePng("footwear", "sandal"), imageMode: CIRCLE_COVER },
    { query: "loafer", label: "Loafers", imageUrl: subtypePng("footwear", "loafer"), imageMode: CIRCLE_COVER },
    { query: "winter boot", label: "Winter Boots", imageUrl: subtypePng("footwear", "winter-boot"), imageMode: CIRCLE_COVER },
    { query: "training shoe", label: "Training", imageUrl: subtypePng("footwear", "training-shoe"), imageMode: CIRCLE_COVER },
    { query: "casual shoe", label: "Casual", imageUrl: subtypePng("footwear", "casual-shoe"), imageMode: CIRCLE_COVER },
    { query: "dress shoe", label: "Dress Shoes", imageUrl: subtypePng("footwear", "dress-shoe"), imageMode: CIRCLE_COVER },
  ],
  beauty: [
    { query: "hair dryer", label: "Hair Dryers", imageUrl: subtypePng("beauty", "hair-dryer"), imageMode: CIRCLE_COVER },
    { query: "facial cleansing brush", label: "Facial Brushes", imageUrl: subtypePng("beauty", "facial-cleansing-brush"), imageMode: CIRCLE_COVER },
    { query: "electric shaver", label: "Shavers", imageUrl: subtypePng("beauty", "electric-shaver"), imageMode: CIRCLE_COVER },
    { query: "skincare fridge", label: "Skincare Fridges", imageUrl: subtypePng("beauty", "skincare-fridge"), imageMode: CIRCLE_COVER },
    { query: "curling iron", label: "Curling Irons", imageUrl: subtypePng("beauty", "curling-iron"), imageMode: CIRCLE_COVER },
    { query: "hair straightener", label: "Straighteners", imageUrl: subtypePng("beauty", "hair-straightener"), imageMode: CIRCLE_COVER },
    { query: "led mirror", label: "LED Mirrors", imageUrl: subtypePng("beauty", "led-mirror"), imageMode: CIRCLE_COVER },
    { query: "massage tool", label: "Massage Tools", imageUrl: subtypePng("beauty", "massage-tool"), imageMode: CIRCLE_COVER },
    { query: "manicure kit", label: "Manicure Kits", imageUrl: subtypePng("beauty", "manicure-kit"), imageMode: CIRCLE_COVER },
    { query: "grooming kit", label: "Grooming Kits", imageUrl: subtypePng("beauty", "grooming-kit"), imageMode: CIRCLE_COVER },
  ],
  accessories: [
    { query: "wallet", label: "Wallets", imageUrl: subtypePng("accessories", "wallet"), imageMode: CIRCLE_COVER },
    { query: "backpack", label: "Backpacks", imageUrl: subtypePng("accessories", "backpack"), imageMode: CIRCLE_COVER },
    { query: "phone case", label: "Phone Cases", imageUrl: subtypePng("accessories", "phone-case"), imageMode: CIRCLE_COVER },
    { query: "sunglasses", label: "Sunglasses", imageUrl: subtypePng("accessories", "sunglasses"), imageMode: CIRCLE_COVER },
    { query: "crossbody bag", label: "Crossbody Bags", imageUrl: subtypePng("accessories", "crossbody-bag"), imageMode: CIRCLE_COVER },
    { query: "watch band", label: "Watch Bands", imageUrl: subtypePng("accessories", "watch-band"), imageMode: CIRCLE_COVER },
    { query: "charging cable", label: "Charging Cables", imageUrl: subtypePng("accessories", "charging-cable"), imageMode: CIRCLE_COVER },
    { query: "laptop sleeve", label: "Laptop Sleeves", imageUrl: subtypePng("accessories", "laptop-sleeve"), imageMode: CIRCLE_COVER },
    { query: "wireless charger", label: "Wireless Chargers", imageUrl: subtypePng("accessories", "wireless-charger"), imageMode: CIRCLE_COVER },
    { query: "travel organizer", label: "Travel Organizers", imageUrl: subtypePng("accessories", "travel-organizer"), imageMode: CIRCLE_COVER },
  ],
  automotive: [
    { query: "dash cam", label: "Dash Cams", imageUrl: subtypePng("automotive", "dash-cam"), imageMode: CIRCLE_COVER },
    { query: "phone mount", label: "Phone Mounts", imageUrl: subtypePng("automotive", "phone-mount"), imageMode: CIRCLE_COVER },
    { query: "floor mats", label: "Floor Mats", imageUrl: subtypePng("automotive", "floor-mats"), imageMode: CIRCLE_COVER },
    { query: "tire inflator", label: "Tire Inflators", imageUrl: subtypePng("automotive", "tire-inflator"), imageMode: CIRCLE_COVER },
    { query: "car vacuum", label: "Car Vacuums", imageUrl: subtypePng("automotive", "car-vacuum"), imageMode: CIRCLE_COVER },
    { query: "battery charger", label: "Battery Chargers", imageUrl: subtypePng("automotive", "battery-charger"), imageMode: CIRCLE_COVER },
    { query: "seat cover", label: "Seat Covers", imageUrl: subtypePng("automotive", "seat-cover"), imageMode: CIRCLE_COVER },
    { query: "windshield wipers", label: "Wipers", imageUrl: subtypePng("automotive", "wipers"), imageMode: CIRCLE_COVER },
    { query: "tool kit", label: "Tool Kits", imageUrl: subtypePng("automotive", "tool-kit"), imageMode: CIRCLE_COVER },
    { query: "jump starter", label: "Jump Starters", imageUrl: subtypePng("automotive", "jump-starter"), imageMode: CIRCLE_COVER },
  ],
  outdoors: [
    { query: "hiking backpack", label: "Backpacks", imageUrl: subtypePng("outdoors", "hiking-backpack"), imageMode: CIRCLE_COVER },
    { query: "tent", label: "Tents", imageUrl: subtypePng("outdoors", "tent"), imageMode: CIRCLE_COVER },
    { query: "sleeping bag", label: "Sleeping Bags", imageUrl: subtypePng("outdoors", "sleeping-bag"), imageMode: CIRCLE_COVER },
    { query: "camp stove", label: "Camp Stoves", imageUrl: subtypePng("outdoors", "camp-stove"), imageMode: CIRCLE_COVER },
    { query: "water bottle", label: "Water Bottles", imageUrl: subtypePng("outdoors", "water-bottle"), imageMode: CIRCLE_COVER },
    { query: "camping lantern", label: "Lanterns", imageUrl: subtypePng("outdoors", "lantern"), imageMode: CIRCLE_COVER },
    { query: "outdoor chair", label: "Outdoor Chairs", imageUrl: subtypePng("outdoors", "outdoor-chair"), imageMode: CIRCLE_COVER },
    { query: "cooler", label: "Coolers", imageUrl: subtypePng("outdoors", "cooler"), imageMode: CIRCLE_COVER },
    { query: "picnic blanket", label: "Picnic Blankets", imageUrl: subtypePng("outdoors", "picnic-blanket"), imageMode: CIRCLE_COVER },
    { query: "travel bag", label: "Travel Bags", imageUrl: subtypePng("outdoors", "travel-bag"), imageMode: CIRCLE_COVER },
  ],
  home: [
    { query: "blanket", label: "Blankets", imageUrl: subtypePng("home", "blanket"), imageMode: CIRCLE_COVER },
    { query: "table lamp", label: "Table Lamps", imageUrl: subtypePng("home", "table-lamp"), imageMode: CIRCLE_COVER },
    { query: "storage bins", label: "Storage Bins", imageUrl: subtypePng("home", "storage-bins"), imageMode: CIRCLE_COVER },
    { query: "throw pillows", label: "Throw Pillows", imageUrl: subtypePng("home", "throw-pillow"), imageMode: CIRCLE_COVER },
    { query: "home air purifier", label: "Air Purifiers", imageUrl: subtypePng("home", "air-purifier"), imageMode: CIRCLE_COVER },
    { query: "wall clock", label: "Wall Clocks", imageUrl: subtypePng("home", "wall-clock"), imageMode: CIRCLE_COVER },
    { query: "diffuser", label: "Diffusers", imageUrl: subtypePng("home", "diffuser"), imageMode: CIRCLE_COVER },
    { query: "curtains", label: "Curtains", imageUrl: subtypePng("home", "curtains"), imageMode: CIRCLE_COVER },
    { query: "rug", label: "Rugs", imageUrl: subtypePng("home", "rug"), imageMode: CIRCLE_COVER },
    { query: "home organizer", label: "Organizers", imageUrl: subtypePng("home", "organizer"), imageMode: CIRCLE_COVER },
  ],
};

/** Round-carousel tiles for a category, or [] when that category isn't wired up yet. */
export function getCategoryRoundCarouselItems(categorySlug: string): CategoryRoundCarouselItem[] {
  const key = normalizeCategoryKey(categorySlug);
  const subtypes = SUBTYPES[key];
  return subtypes ? buildCategoryItems(categorySlug, subtypes) : [];
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
