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

const TRANSPARENT: CategoryImageMode = "transparent-contain";

const SUBTYPES: Record<string, SubtypeDef[]> = {
  appliances: [
    { query: "refrigerator", label: "Refrigerators", imageUrl: subtypePng("appliances", "refrigerator"), imageMode: TRANSPARENT },
    { query: "washing machine", label: "Laundry", imageUrl: subtypePng("appliances", "washing-machine"), imageMode: TRANSPARENT },
    { query: "cooking", label: "Cooking", imageUrl: subtypePng("appliances", "air-fryer"), imageMode: TRANSPARENT },
    { query: "dishwasher", label: "Dishwashers", imageUrl: subtypePng("appliances", "dishwasher"), imageMode: TRANSPARENT },
    { query: "freezer", label: "Freezers", imageUrl: subtypePng("appliances", "freezer"), imageMode: TRANSPARENT },
    { query: "small appliance", label: "Small Appliances", imageUrl: subtypePng("appliances", "slow-cooker"), imageMode: TRANSPARENT },
    { query: "vacuum", label: "Vacuum Cleaners", imageUrl: subtypePng("appliances", "vacuum"), imageMode: TRANSPARENT },
    { query: "air purifier", label: "Air Purifiers", imageUrl: subtypePng("appliances", "air-purifier"), imageMode: TRANSPARENT },
    { query: "coffee maker", label: "Coffee Machines", imageUrl: subtypePng("appliances", "coffee-maker"), imageMode: TRANSPARENT },
    { query: "microwave", label: "Microwaves", imageUrl: subtypePng("appliances", "microwave"), imageMode: TRANSPARENT },
  ],
  electronics: [
    { query: "smartphone", label: "Phones", imageUrl: subtypePng("electronics", "phone"), imageMode: TRANSPARENT },
    { query: "laptop", label: "Laptops", imageUrl: subtypePng("electronics", "laptop"), imageMode: TRANSPARENT },
    { query: "tablet", label: "Tablets", imageUrl: subtypePng("electronics", "tablet"), imageMode: TRANSPARENT },
    { query: "headphones", label: "Headphones", imageUrl: subtypePng("electronics", "headphones"), imageMode: TRANSPARENT },
    { query: "earbuds", label: "Earbuds", imageUrl: subtypePng("electronics", "earbuds"), imageMode: TRANSPARENT },
    { query: "monitor", label: "Monitors", imageUrl: subtypePng("electronics", "monitor"), imageMode: TRANSPARENT },
    { query: "smart watch", label: "Smartwatches", imageUrl: subtypePng("electronics", "smartwatch"), imageMode: TRANSPARENT },
    { query: "speaker", label: "Speakers", imageUrl: subtypePng("electronics", "speaker"), imageMode: TRANSPARENT },
    { query: "camera", label: "Cameras", imageUrl: subtypePng("electronics", "camera"), imageMode: TRANSPARENT },
    { query: "gaming accessory", label: "Gaming", imageUrl: subtypePng("electronics", "gaming"), imageMode: TRANSPARENT },
  ],
  kitchen: [
    { query: "cookware", label: "Cookware", imageUrl: subtypePng("kitchen", "cookware"), imageMode: TRANSPARENT },
    { query: "blender", label: "Blenders", imageUrl: subtypePng("kitchen", "blender"), imageMode: TRANSPARENT },
    { query: "coffee machine", label: "Coffee Machines", imageUrl: subtypePng("kitchen", "coffee-machine"), imageMode: TRANSPARENT },
    { query: "knife set", label: "Knife Sets", imageUrl: subtypePng("kitchen", "knife-set"), imageMode: TRANSPARENT },
    { query: "stand mixer", label: "Stand Mixers", imageUrl: subtypePng("kitchen", "stand-mixer"), imageMode: TRANSPARENT },
    { query: "cutting board", label: "Cutting Boards", imageUrl: subtypePng("kitchen", "cutting-board"), imageMode: TRANSPARENT },
    { query: "kettle", label: "Kettles", imageUrl: subtypePng("kitchen", "kettle"), imageMode: TRANSPARENT },
    { query: "bakeware", label: "Bakeware", imageUrl: subtypePng("kitchen", "bakeware"), imageMode: TRANSPARENT },
    { query: "food storage", label: "Food Storage", imageUrl: subtypePng("kitchen", "food-storage"), imageMode: TRANSPARENT },
    { query: "kitchen organizer", label: "Organizers", imageUrl: subtypePng("kitchen", "organizer"), imageMode: TRANSPARENT },
  ],
  footwear: [
    { query: "running shoe", label: "Running", imageUrl: subtypePng("footwear", "running-shoe"), imageMode: TRANSPARENT },
    { query: "sneaker", label: "Sneakers", imageUrl: subtypePng("footwear", "sneaker"), imageMode: TRANSPARENT },
    { query: "trail runner", label: "Trail Runners", imageUrl: subtypePng("footwear", "trail-runner"), imageMode: TRANSPARENT },
    { query: "hiking boot", label: "Hiking Boots", imageUrl: subtypePng("footwear", "hiking-boot"), imageMode: TRANSPARENT },
    { query: "sandal", label: "Sandals", imageUrl: subtypePng("footwear", "sandal"), imageMode: TRANSPARENT },
    { query: "loafer", label: "Loafers", imageUrl: subtypePng("footwear", "loafer"), imageMode: TRANSPARENT },
    { query: "winter boot", label: "Winter Boots", imageUrl: subtypePng("footwear", "winter-boot"), imageMode: TRANSPARENT },
    { query: "training shoe", label: "Training", imageUrl: subtypePng("footwear", "training-shoe"), imageMode: TRANSPARENT },
    { query: "casual shoe", label: "Casual", imageUrl: subtypePng("footwear", "casual-shoe"), imageMode: TRANSPARENT },
    { query: "dress shoe", label: "Dress Shoes", imageUrl: subtypePng("footwear", "dress-shoe"), imageMode: TRANSPARENT },
  ],
  beauty: [
    { query: "hair dryer", label: "Hair Dryers", imageUrl: subtypePng("beauty", "hair-dryer"), imageMode: TRANSPARENT },
    { query: "facial cleansing brush", label: "Facial Brushes", imageUrl: subtypePng("beauty", "facial-cleansing-brush"), imageMode: TRANSPARENT },
    { query: "electric shaver", label: "Shavers", imageUrl: subtypePng("beauty", "electric-shaver"), imageMode: TRANSPARENT },
    { query: "skincare fridge", label: "Skincare Fridges", imageUrl: subtypePng("beauty", "skincare-fridge"), imageMode: TRANSPARENT },
    { query: "curling iron", label: "Curling Irons", imageUrl: subtypePng("beauty", "curling-iron"), imageMode: TRANSPARENT },
    { query: "hair straightener", label: "Straighteners", imageUrl: subtypePng("beauty", "hair-straightener"), imageMode: TRANSPARENT },
    { query: "led mirror", label: "LED Mirrors", imageUrl: subtypePng("beauty", "led-mirror"), imageMode: TRANSPARENT },
    { query: "massage tool", label: "Massage Tools", imageUrl: subtypePng("beauty", "massage-tool"), imageMode: TRANSPARENT },
    { query: "manicure kit", label: "Manicure Kits", imageUrl: subtypePng("beauty", "manicure-kit"), imageMode: TRANSPARENT },
    { query: "grooming kit", label: "Grooming Kits", imageUrl: subtypePng("beauty", "grooming-kit"), imageMode: TRANSPARENT },
  ],
  accessories: [
    { query: "wallet", label: "Wallets", imageUrl: subtypePng("accessories", "wallet"), imageMode: TRANSPARENT },
    { query: "backpack", label: "Backpacks", imageUrl: subtypePng("accessories", "backpack"), imageMode: TRANSPARENT },
    { query: "phone case", label: "Phone Cases", imageUrl: subtypePng("accessories", "phone-case"), imageMode: TRANSPARENT },
    { query: "sunglasses", label: "Sunglasses", imageUrl: subtypePng("accessories", "sunglasses"), imageMode: TRANSPARENT },
    { query: "crossbody bag", label: "Crossbody Bags", imageUrl: subtypePng("accessories", "crossbody-bag"), imageMode: TRANSPARENT },
    { query: "watch band", label: "Watch Bands", imageUrl: subtypePng("accessories", "watch-band"), imageMode: TRANSPARENT },
    { query: "charging cable", label: "Charging Cables", imageUrl: subtypePng("accessories", "charging-cable"), imageMode: TRANSPARENT },
    { query: "laptop sleeve", label: "Laptop Sleeves", imageUrl: subtypePng("accessories", "laptop-sleeve"), imageMode: TRANSPARENT },
    { query: "wireless charger", label: "Wireless Chargers", imageUrl: subtypePng("accessories", "wireless-charger"), imageMode: TRANSPARENT },
    { query: "travel organizer", label: "Travel Organizers", imageUrl: subtypePng("accessories", "travel-organizer"), imageMode: TRANSPARENT },
  ],
  automotive: [
    { query: "dash cam", label: "Dash Cams", imageUrl: subtypePng("automotive", "dash-cam"), imageMode: TRANSPARENT },
    { query: "phone mount", label: "Phone Mounts", imageUrl: subtypePng("automotive", "phone-mount"), imageMode: TRANSPARENT },
    { query: "floor mats", label: "Floor Mats", imageUrl: subtypePng("automotive", "floor-mats"), imageMode: TRANSPARENT },
    { query: "tire inflator", label: "Tire Inflators", imageUrl: subtypePng("automotive", "tire-inflator"), imageMode: TRANSPARENT },
    { query: "car vacuum", label: "Car Vacuums", imageUrl: subtypePng("automotive", "car-vacuum"), imageMode: TRANSPARENT },
    { query: "battery charger", label: "Battery Chargers", imageUrl: subtypePng("automotive", "battery-charger"), imageMode: TRANSPARENT },
    { query: "seat cover", label: "Seat Covers", imageUrl: subtypePng("automotive", "seat-cover"), imageMode: TRANSPARENT },
    { query: "windshield wipers", label: "Wipers", imageUrl: subtypePng("automotive", "wipers"), imageMode: TRANSPARENT },
    { query: "tool kit", label: "Tool Kits", imageUrl: subtypePng("automotive", "tool-kit"), imageMode: TRANSPARENT },
    { query: "jump starter", label: "Jump Starters", imageUrl: subtypePng("automotive", "jump-starter"), imageMode: TRANSPARENT },
  ],
  outdoors: [
    { query: "hiking backpack", label: "Backpacks", imageUrl: subtypePng("outdoors", "hiking-backpack"), imageMode: TRANSPARENT },
    { query: "tent", label: "Tents", imageUrl: subtypePng("outdoors", "tent"), imageMode: TRANSPARENT },
    { query: "sleeping bag", label: "Sleeping Bags", imageUrl: subtypePng("outdoors", "sleeping-bag"), imageMode: TRANSPARENT },
    { query: "camp stove", label: "Camp Stoves", imageUrl: subtypePng("outdoors", "camp-stove"), imageMode: TRANSPARENT },
    { query: "water bottle", label: "Water Bottles", imageUrl: subtypePng("outdoors", "water-bottle"), imageMode: TRANSPARENT },
    { query: "camping lantern", label: "Lanterns", imageUrl: subtypePng("outdoors", "lantern"), imageMode: TRANSPARENT },
    { query: "outdoor chair", label: "Outdoor Chairs", imageUrl: subtypePng("outdoors", "outdoor-chair"), imageMode: TRANSPARENT },
    { query: "cooler", label: "Coolers", imageUrl: subtypePng("outdoors", "cooler"), imageMode: TRANSPARENT },
    { query: "picnic blanket", label: "Picnic Blankets", imageUrl: subtypePng("outdoors", "picnic-blanket"), imageMode: TRANSPARENT },
    { query: "travel bag", label: "Travel Bags", imageUrl: subtypePng("outdoors", "travel-bag"), imageMode: TRANSPARENT },
  ],
  home: [
    { query: "blanket", label: "Blankets", imageUrl: subtypePng("home", "blanket"), imageMode: TRANSPARENT },
    { query: "table lamp", label: "Table Lamps", imageUrl: subtypePng("home", "table-lamp"), imageMode: TRANSPARENT },
    { query: "storage bins", label: "Storage Bins", imageUrl: subtypePng("home", "storage-bins"), imageMode: TRANSPARENT },
    { query: "throw pillows", label: "Throw Pillows", imageUrl: subtypePng("home", "throw-pillow"), imageMode: TRANSPARENT },
    { query: "home air purifier", label: "Air Purifiers", imageUrl: subtypePng("home", "air-purifier"), imageMode: TRANSPARENT },
    { query: "wall clock", label: "Wall Clocks", imageUrl: subtypePng("home", "wall-clock"), imageMode: TRANSPARENT },
    { query: "diffuser", label: "Diffusers", imageUrl: subtypePng("home", "diffuser"), imageMode: TRANSPARENT },
    { query: "curtains", label: "Curtains", imageUrl: subtypePng("home", "curtains"), imageMode: TRANSPARENT },
    { query: "rug", label: "Rugs", imageUrl: subtypePng("home", "rug"), imageMode: TRANSPARENT },
    { query: "home organizer", label: "Organizers", imageUrl: subtypePng("home", "organizer"), imageMode: TRANSPARENT },
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
