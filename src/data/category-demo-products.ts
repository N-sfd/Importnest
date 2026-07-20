/**
 * Homepage/category-browsing demo data only — see AGENTS.md.
 *
 * These are NOT real listings: no price, no offer count, no source count,
 * no condition, no "last checked" freshness. Showing invented values for
 * any of those would misrepresent them as real commerce facts, which is
 * exactly what this project avoids everywhere else (compare pages, search
 * results, Top Products/Best Deals all derive strictly from seeded
 * Listing/PriceHistory rows). This file exists purely to keep category
 * browsing visually populated — rendered as non-interactive discovery
 * tiles (see CategoryDemoGrid), never wired into compare, save, alerts,
 * or ranking logic. Real products (the ones actually seeded in the DB)
 * keep full functionality everywhere they appear.
 */

export type CategoryDemoProduct = {
  id: string;
  title: string;
  brand: string;
  categorySlug: string;
  subtitle: string;
  badge?: string;
  /** Overrides the category's shared hero image when a distinct real asset exists. */
  image?: string;
};

const badgeCycle = ["Featured", "Popular pick", "Editor's pick", undefined] as const;

/**
 * A few categories have real, unused (not wired to any seeded product)
 * extra images sitting in public/images/home/ — cycle through those for
 * visual variety instead of repeating the single category hero image 8
 * times.
 *
 * Every other category gets a distinct, clearly-generic line-icon SVG per
 * sub-type instead (public/images/demo-icons/) rather than one repeated
 * photo — these are abstract placeholders, not claimed product photos, and
 * are assigned one-to-one below via each product's `image` field.
 */
const EXTRA_IMAGES: Record<string, string[]> = {
  electronics: [
    "/images/home/headphones/overear.png",
    "/images/home/headphones/airbuds-pro-3.png",
    "/images/home/headphones/earbuds-case.png",
  ],
  automotive: [
    "/images/home/automotive/car-jump-starter.png",
    "/images/home/automotive/car-phone-mount.png",
    "/images/home/automotive/car-usb-charger.png",
  ],
};

const DEMO_ICON = (slug: string) => `/images/demo-icons/${slug}.svg`;

/** One icon per product, in the same order as each category's entry list below. */
const ICON_IMAGES: Record<string, string[]> = {
  appliances: [
    "microwave",
    "toaster-oven",
    "vacuum",
    "slow-cooker",
    "air-fryer",
    "freezer",
    "ac-unit",
    "dehumidifier",
  ].map(DEMO_ICON),
  kitchen: [
    "cookware-set",
    "pour-over",
    "knife-block",
    "stand-mixer",
    "cutting-board",
    "kettle",
    "food-storage",
    "cast-iron-skillet",
  ].map(DEMO_ICON),
  footwear: [
    "trail-runner",
    "sneaker",
    "hiking-boot",
    "loafer",
    "sandal",
    "winter-boot",
    "training-shoe",
    "chukka-boot",
  ].map(DEMO_ICON),
  beauty: [
    "cleansing-brush",
    "hair-dryer",
    "flat-iron",
    "led-mirror",
    "razor",
    "facial-steamer",
    "sonic-cleansing",
    "nail-care",
  ].map(DEMO_ICON),
  accessories: [
    "wallet",
    "backpack",
    "phone-case",
    "travel-organizer",
    "sunglasses",
    "cable",
    "crossbody-bag",
    "watch-band",
  ].map(DEMO_ICON),
  outdoors: [
    "daypack",
    "tent",
    "sleeping-bag",
    "camp-stove",
    "water-bottle",
    "trekking-poles",
    "lantern",
    "camp-chair",
  ].map(DEMO_ICON),
  home: [
    "blanket",
    "table-lamp",
    "storage-bins",
    "throw-pillow",
    "air-filter",
    "wall-clock",
    "diffuser",
    "curtains",
  ].map(DEMO_ICON),
};

function withBadges(
  categorySlug: string,
  entries: { title: string; brand: string; subtitle: string }[],
): CategoryDemoProduct[] {
  const images = EXTRA_IMAGES[categorySlug] ?? ICON_IMAGES[categorySlug];
  return entries.map((e, i) => ({
    id: `demo-${categorySlug}-${i + 1}`,
    categorySlug,
    badge: badgeCycle[i % badgeCycle.length],
    image: images ? images[i % images.length] : undefined,
    ...e,
  }));
}

export const CATEGORY_DEMO_PRODUCTS: Record<string, CategoryDemoProduct[]> = {
  electronics: withBadges("electronics", [
    { title: "Vantage 13\" Ultrabook", brand: "Nordstream", subtitle: "Thin-and-light laptop for everyday work" },
    { title: "Crestline Noise-Cancelling Earbuds", brand: "Alto", subtitle: "Compact true-wireless earbuds" },
    { title: "Marlow 4K Streaming Stick", brand: "Kindred", subtitle: "Streaming device for any TV" },
    { title: "Solace Smartwatch SE", brand: "Everline", subtitle: "Fitness and notifications on your wrist" },
    { title: "Halcyon Tablet 10", brand: "Nordstream", subtitle: "Everyday tablet for browsing and media" },
    { title: "Pilcrow Mechanical Keyboard", brand: "Alto", subtitle: "Compact keyboard for desk setups" },
    { title: "Rivermark Portable SSD 1TB", brand: "Kindred", subtitle: "Fast portable storage" },
    { title: "Auralite Bluetooth Speaker", brand: "Everline", subtitle: "Compact speaker for home or travel" },
  ]),
  appliances: withBadges("appliances", [
    { title: "Wintervale Countertop Microwave", brand: "Hearthcrest", subtitle: "Compact microwave for small kitchens" },
    { title: "Millbrook 6-Slice Toaster Oven", brand: "Fernwood", subtitle: "Countertop oven for toasting and baking" },
    { title: "Grayson Upright Vacuum", brand: "Hearthcrest", subtitle: "Bagless vacuum for carpets and floors" },
    { title: "Ashford Slow Cooker 6-Qt", brand: "Fernwood", subtitle: "Programmable slow cooker" },
    { title: "Larkspur Air Fryer", brand: "Hearthcrest", subtitle: "Compact air fryer for everyday cooking" },
    { title: "Dunmore Chest Freezer", brand: "Fernwood", subtitle: "Extra freezer storage for the garage" },
    { title: "Birchfield Window AC Unit", brand: "Hearthcrest", subtitle: "Cooling for a single room" },
    { title: "Thornbury Dehumidifier", brand: "Fernwood", subtitle: "Moisture control for basements" },
  ]),
  kitchen: withBadges("kitchen", [
    { title: "Copperfield Nonstick Cookware Set", brand: "Bramblewood", subtitle: "8-piece everyday cookware set" },
    { title: "Millhouse Pour-Over Coffee Set", brand: "Ashgrove", subtitle: "Manual brew set for coffee lovers" },
    { title: "Oakstead Knife Block Set", brand: "Bramblewood", subtitle: "Kitchen knives with wood block" },
    { title: "Ferngate Stand Mixer", brand: "Ashgrove", subtitle: "Countertop mixer for baking" },
    { title: "Willowmere Cutting Board Set", brand: "Bramblewood", subtitle: "Bamboo cutting boards, set of 3" },
    { title: "Cobblestone Electric Kettle", brand: "Ashgrove", subtitle: "Fast-boil kettle with auto shutoff" },
    { title: "Hazelbrook Food Storage Set", brand: "Bramblewood", subtitle: "Stackable airtight containers" },
    { title: "Rosedale Cast Iron Skillet", brand: "Ashgrove", subtitle: "Pre-seasoned 10-inch skillet" },
  ]),
  footwear: withBadges("footwear", [
    { title: "Pinnacle Trail Runner", brand: "Cadence", subtitle: "Lightweight shoe for trail and road" },
    { title: "Harborline Canvas Sneaker", brand: "Wayfarer", subtitle: "Everyday casual sneaker" },
    { title: "Ridgeway Hiking Boot", brand: "Cadence", subtitle: "Waterproof boot for the outdoors" },
    { title: "Meadowlark Slip-On Loafer", brand: "Wayfarer", subtitle: "Comfortable everyday loafer" },
    { title: "Summit Trail Sandal", brand: "Cadence", subtitle: "Adjustable sandal for warm weather" },
    { title: "Northbend Winter Boot", brand: "Wayfarer", subtitle: "Insulated boot for cold climates" },
    { title: "Fleetfoot Training Shoe", brand: "Cadence", subtitle: "Cross-training shoe for the gym" },
    { title: "Glenmoor Chukka Boot", brand: "Wayfarer", subtitle: "Classic ankle boot" },
  ]),
  beauty: withBadges("beauty", [
    { title: "Lumenne Facial Cleansing Brush", brand: "Sable & Co.", subtitle: "Gentle daily cleansing device" },
    { title: "Rosemere Hair Dryer 1875W", brand: "Verabelle", subtitle: "Fast-drying dryer with cool shot" },
    { title: "Silkwood Flat Iron", brand: "Sable & Co.", subtitle: "Ceramic plates for smooth styling" },
    { title: "Petalglow LED Mirror", brand: "Verabelle", subtitle: "Lighted vanity mirror" },
    { title: "Ambervale Electric Razor", brand: "Sable & Co.", subtitle: "Rechargeable grooming razor" },
    { title: "Willowmist Facial Steamer", brand: "Verabelle", subtitle: "At-home facial steaming device" },
    { title: "Cascade Sonic Cleansing Kit", brand: "Sable & Co.", subtitle: "Sonic cleansing with travel case" },
    { title: "Marigold Nail Care Set", brand: "Verabelle", subtitle: "Manicure and pedicure kit" },
  ]),
  accessories: withBadges("accessories", [
    { title: "Harrowgate Leather Wallet", brand: "Coalridge", subtitle: "Slim bifold wallet" },
    { title: "Kestrel Laptop Backpack", brand: "Portside", subtitle: "Padded backpack with laptop sleeve" },
    { title: "Brindlewood Phone Case", brand: "Coalridge", subtitle: "Protective case with card slot" },
    { title: "Ledgerline Travel Organizer", brand: "Portside", subtitle: "Pouch for cables and chargers" },
    { title: "Ashcombe Sunglasses", brand: "Coalridge", subtitle: "Polarized everyday sunglasses" },
    { title: "Millpond Fast-Charge Cable Set", brand: "Portside", subtitle: "Braided charging cables, 3-pack" },
    { title: "Foxglove Crossbody Bag", brand: "Coalridge", subtitle: "Compact everyday crossbody" },
    { title: "Ironbridge Watch Band", brand: "Portside", subtitle: "Adjustable band for smartwatches" },
  ]),
  automotive: withBadges("automotive", [
    { title: "Redline Dash Cam 1080p", brand: "Ferroline", subtitle: "Front-view dash camera" },
    { title: "Trailhead Portable Jump Starter", brand: "Roadcrest", subtitle: "Compact jump starter and power bank" },
    { title: "Ironclad Cargo Organizer", brand: "Ferroline", subtitle: "Trunk storage organizer" },
    { title: "Highbeam LED Headlight Kit", brand: "Roadcrest", subtitle: "Upgrade headlight bulb kit" },
    { title: "Wayline Phone Mount", brand: "Ferroline", subtitle: "Magnetic vent phone mount" },
    { title: "Stonegate All-Weather Floor Mats", brand: "Roadcrest", subtitle: "Set of 4 all-weather mats" },
    { title: "Cinderpath Tire Inflator", brand: "Ferroline", subtitle: "Portable air compressor" },
    { title: "Millbank Car Vacuum", brand: "Roadcrest", subtitle: "Compact handheld car vacuum" },
  ]),
  outdoors: withBadges("outdoors", [
    { title: "Timberline Daypack 24L", brand: "Northfell", subtitle: "Everyday hiking daypack" },
    { title: "Basecamp 2-Person Tent", brand: "Greylock", subtitle: "Lightweight backpacking tent" },
    { title: "Alpineglow Sleeping Bag", brand: "Northfell", subtitle: "3-season sleeping bag" },
    { title: "Riverstone Camp Stove", brand: "Greylock", subtitle: "Portable propane camp stove" },
    { title: "Windward Insulated Bottle", brand: "Northfell", subtitle: "32oz insulated water bottle" },
    { title: "Craghold Trekking Poles", brand: "Greylock", subtitle: "Adjustable aluminum trekking poles" },
    { title: "Duskfall Camping Lantern", brand: "Northfell", subtitle: "Rechargeable LED lantern" },
    { title: "Fernway Camp Chair", brand: "Greylock", subtitle: "Folding camp chair with cup holder" },
  ]),
  home: withBadges("home", [
    { title: "Aldergrove Weighted Blanket", brand: "Homestead & Co.", subtitle: "12lb weighted blanket" },
    { title: "Brookline Table Lamp", brand: "Linden", subtitle: "Ceramic base table lamp" },
    { title: "Mossgate Storage Bins", brand: "Homestead & Co.", subtitle: "Stackable fabric storage bins, set of 3" },
    { title: "Thistledown Throw Pillow Set", brand: "Linden", subtitle: "Decorative pillow covers, set of 2" },
    { title: "Grovemont Air Purifier Filter", brand: "Homestead & Co.", subtitle: "Replacement filter, 3-pack" },
    { title: "Hollowbrook Wall Clock", brand: "Linden", subtitle: "Minimalist wall clock" },
    { title: "Pemberton Diffuser", brand: "Homestead & Co.", subtitle: "Essential oil diffuser" },
    { title: "Willowcrest Curtain Panels", brand: "Linden", subtitle: "Blackout curtain panels, pair" },
  ]),
};

export function getCategoryDemoProducts(categorySlug: string, limit = 8): CategoryDemoProduct[] {
  return (CATEGORY_DEMO_PRODUCTS[categorySlug] ?? []).slice(0, limit);
}
