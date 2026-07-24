/**
 * Round-image carousel tiles for category browse pages, covering every shop
 * category (Appliances, Electronics, Kitchen, Footwear, Beauty, Accessories,
 * Automotive, Outdoors, Home). Categories not in BUILDERS resolve to an empty
 * list, so CategoryRoundCarousel simply renders nothing for them.
 *
 * Images resolve through the existing product-images subtype map so tiles
 * reuse real, already-approved photo assets instead of new/invented ones.
 */

import type { CategoryRoundCarouselItem } from "@/components/CategoryRoundCarousel";
import { categoryDisplayTitle, normalizeCategoryKey } from "@/lib/category-visuals";
import { categoryImageFor } from "@/lib/images";
import { imageForSubtype } from "@/lib/product-images";

const DEALS_BADGE_IMAGE = "/images/categories/deals-badge.svg";

type SubtypeDef = {
  /** Search keyword used both as the tile's slug and the `q` filter value. */
  query: string;
  label: string;
  /** Only when the image lookup keyword differs from the search query (e.g. a grouped label). */
  imageQuery?: string;
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
    lifestyle: true,
  };

  const subtypeTiles: CategoryRoundCarouselItem[] = subtypes.map((s) => ({
    slug: s.query,
    label: s.label,
    imageUrl: imageForSubtype(categorySlug, s.imageQuery ?? s.query) ?? fallback,
    href: subtypeHref(categorySlug, s.query),
  }));

  const dealsTile: CategoryRoundCarouselItem = {
    slug: "deals",
    label: "Best Deals",
    imageUrl: DEALS_BADGE_IMAGE,
    href: `/search/results?category=${encodeURIComponent(categorySlug)}&sort=lowest_cost`,
    badge: "Deals",
  };

  return [resetTile, ...subtypeTiles, dealsTile];
}

const SUBTYPES: Record<string, SubtypeDef[]> = {
  appliances: [
    { query: "refrigerator", label: "Refrigerators" },
    { query: "washing machine", label: "Laundry" },
    { query: "cooking", label: "Cooking", imageQuery: "air fryer" },
    { query: "dishwasher", label: "Dishwashers" },
    { query: "freezer", label: "Freezers" },
    { query: "small appliance", label: "Small Appliances", imageQuery: "slow cooker" },
    { query: "vacuum", label: "Vacuum Cleaners" },
    { query: "air purifier", label: "Air Purifiers" },
    { query: "coffee maker", label: "Coffee Machines" },
    { query: "microwave", label: "Microwaves" },
  ],
  electronics: [
    { query: "smartphone", label: "Phones" },
    { query: "laptop", label: "Laptops" },
    { query: "tablet", label: "Tablets" },
    { query: "headphones", label: "Headphones" },
    { query: "earbuds", label: "Earbuds" },
    { query: "monitor", label: "Monitors" },
    { query: "smart watch", label: "Smartwatches" },
    { query: "speaker", label: "Speakers" },
    { query: "camera", label: "Cameras" },
    { query: "gaming accessory", label: "Gaming" },
  ],
  kitchen: [
    { query: "cookware", label: "Cookware" },
    { query: "blender", label: "Blenders" },
    { query: "coffee machine", label: "Coffee Machines" },
    { query: "knife set", label: "Knife Sets" },
    { query: "stand mixer", label: "Stand Mixers" },
    { query: "cutting board", label: "Cutting Boards" },
    { query: "kettle", label: "Kettles" },
    { query: "bakeware", label: "Bakeware" },
    { query: "food storage", label: "Food Storage" },
    { query: "kitchen organizer", label: "Organizers" },
  ],
  footwear: [
    { query: "running shoe", label: "Running" },
    { query: "sneaker", label: "Sneakers" },
    { query: "trail runner", label: "Trail Runners" },
    { query: "hiking boot", label: "Hiking Boots" },
    { query: "sandal", label: "Sandals" },
    { query: "loafer", label: "Loafers" },
    { query: "winter boot", label: "Winter Boots" },
    { query: "training shoe", label: "Training" },
    { query: "casual shoe", label: "Casual" },
    { query: "dress shoe", label: "Dress Shoes" },
  ],
  beauty: [
    { query: "hair dryer", label: "Hair Dryers" },
    { query: "facial cleansing brush", label: "Facial Brushes" },
    { query: "electric shaver", label: "Shavers" },
    { query: "skincare fridge", label: "Skincare Fridges" },
    { query: "curling iron", label: "Curling Irons" },
    { query: "hair straightener", label: "Straighteners" },
    { query: "led mirror", label: "LED Mirrors" },
    { query: "massage tool", label: "Massage Tools" },
    { query: "manicure kit", label: "Manicure Kits" },
    { query: "grooming kit", label: "Grooming Kits" },
  ],
  accessories: [
    { query: "wallet", label: "Wallets" },
    { query: "backpack", label: "Backpacks" },
    { query: "phone case", label: "Phone Cases" },
    { query: "sunglasses", label: "Sunglasses" },
    { query: "crossbody bag", label: "Crossbody Bags" },
    { query: "watch band", label: "Watch Bands" },
    { query: "charging cable", label: "Charging Cables" },
    { query: "laptop sleeve", label: "Laptop Sleeves" },
    { query: "wireless charger", label: "Wireless Chargers" },
    { query: "travel organizer", label: "Travel Organizers" },
  ],
  automotive: [
    { query: "dash cam", label: "Dash Cams" },
    { query: "phone mount", label: "Phone Mounts" },
    { query: "floor mats", label: "Floor Mats" },
    { query: "tire inflator", label: "Tire Inflators" },
    { query: "car vacuum", label: "Car Vacuums" },
    { query: "battery charger", label: "Battery Chargers" },
    { query: "seat cover", label: "Seat Covers" },
    { query: "windshield wipers", label: "Wipers" },
    { query: "tool kit", label: "Tool Kits" },
    { query: "jump starter", label: "Jump Starters" },
  ],
  outdoors: [
    { query: "hiking backpack", label: "Backpacks" },
    { query: "tent", label: "Tents" },
    { query: "sleeping bag", label: "Sleeping Bags" },
    { query: "camp stove", label: "Camp Stoves" },
    { query: "water bottle", label: "Water Bottles" },
    { query: "camping lantern", label: "Lanterns" },
    { query: "outdoor chair", label: "Outdoor Chairs" },
    { query: "cooler", label: "Coolers" },
    { query: "picnic blanket", label: "Picnic Blankets" },
    { query: "travel bag", label: "Travel Bags" },
  ],
  home: [
    { query: "blanket", label: "Blankets" },
    { query: "table lamp", label: "Table Lamps" },
    { query: "storage bins", label: "Storage Bins" },
    { query: "throw pillows", label: "Throw Pillows" },
    { query: "home air purifier", label: "Air Purifiers" },
    { query: "wall clock", label: "Wall Clocks" },
    { query: "diffuser", label: "Diffusers" },
    { query: "curtains", label: "Curtains" },
    { query: "rug", label: "Rugs" },
    { query: "home organizer", label: "Organizers" },
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
