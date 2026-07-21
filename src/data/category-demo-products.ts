/**
 * Category-browsing demo data only — see AGENTS.md / homepage-demo-data rule.
 *
 * These are NOT real listings: no invented live retailer offers.
 * Each category has 10 distinct subtypes with distinct thumbnail photos.
 */

import { normalizeCategoryKey } from "@/lib/category-visuals";
import { getProductDisplayImage, imageForSubtype } from "@/lib/product-images";

export type CategoryDemoProduct = {
  id: string;
  title: string;
  brand: string;
  categorySlug: string;
  subtype: string;
  subtitle: string;
  badge?: string;
  image: string;
};

const badgeCycle = ["Featured", "Popular pick", "Editor's pick", undefined] as const;

function withBadges(
  categorySlug: string,
  entries: { title: string; brand: string; subtitle: string; subtype: string }[],
): CategoryDemoProduct[] {
  return entries.map((e, i) => ({
    id: `demo-${categorySlug}-${i + 1}`,
    categorySlug,
    badge: badgeCycle[i % badgeCycle.length],
    image:
      imageForSubtype(categorySlug, e.subtype) ??
      getProductDisplayImage({
        categorySlug,
        title: e.title,
        subtitle: e.subtitle,
        subtype: e.subtype,
        tags: [e.subtype],
      }),
    ...e,
  }));
}

export const CATEGORY_DEMO_PRODUCTS: Record<string, CategoryDemoProduct[]> = {
  electronics: withBadges("electronics", [
    { title: "Pixelbay Smart Phone SE", brand: "Kindred", subtype: "smartphone", subtitle: "Everyday smartphone with clear camera" },
    { title: "Vantage 14\" Laptop", brand: "Nordstream", subtype: "laptop", subtitle: "Everyday laptop for work and study" },
    { title: "Halcyon Tablet 10", brand: "Nordstream", subtype: "tablet", subtitle: "Everyday tablet for browsing and media" },
    { title: "Harborline Over-Ear Headphones", brand: "Alto", subtype: "headphones", subtitle: "Wireless headphones for travel and focus" },
    { title: "Crestline Noise-Cancelling Earbuds", brand: "Alto", subtype: "earbuds", subtitle: "Compact true-wireless earbuds" },
    { title: "Clearview 27\" Monitor", brand: "Nordstream", subtype: "monitor", subtitle: "IPS monitor for desk setups" },
    { title: "Solace Smartwatch SE", brand: "Everline", subtype: "smartwatch", subtitle: "Fitness and notifications on your wrist" },
    { title: "Auralite Bluetooth Speaker", brand: "Everline", subtype: "speaker", subtitle: "Compact speaker for home or travel" },
    { title: "Lensfield Compact Camera", brand: "Kindred", subtype: "camera", subtitle: "Point-and-shoot camera for travel" },
    { title: "ArcadePad Gaming Accessory", brand: "Alto", subtype: "gaming accessory", subtitle: "Wireless controller for console and PC" },
  ]),
  appliances: withBadges("appliances", [
    { title: "Brightwell Dishwasher", brand: "Fernwood", subtype: "dishwasher", subtitle: "Quiet dishwasher for everyday loads" },
    { title: "Frostline Refrigerator", brand: "Hearthcrest", subtype: "refrigerator", subtitle: "French-door fridge for family kitchens" },
    { title: "Wintervale Countertop Microwave", brand: "Hearthcrest", subtype: "microwave", subtitle: "Compact microwave for small kitchens" },
    { title: "Millbrook 6-Slice Toaster Oven", brand: "Fernwood", subtype: "toaster oven", subtitle: "Countertop oven for toasting and baking" },
    { title: "Larkspur Air Fryer", brand: "Hearthcrest", subtype: "air fryer", subtitle: "Compact air fryer for everyday cooking" },
    { title: "Brewlane Coffee Maker", brand: "Fernwood", subtype: "coffee maker", subtitle: "Programmable drip coffee maker" },
    { title: "Grayson Upright Vacuum", brand: "Hearthcrest", subtype: "vacuum", subtitle: "Bagless vacuum for carpets and floors" },
    { title: "Clearair Air Purifier", brand: "Fernwood", subtype: "air purifier", subtitle: "HEPA air purifier for living rooms" },
    { title: "Thornbury Dehumidifier", brand: "Fernwood", subtype: "dehumidifier", subtitle: "Moisture control for basements" },
    { title: "Cascade Washing Machine", brand: "Fernwood", subtype: "washing machine", subtitle: "Front-load laundry appliance" },
  ]),
  kitchen: withBadges("kitchen", [
    { title: "Copperfield Nonstick Cookware Set", brand: "Bramblewood", subtype: "cookware", subtitle: "8-piece everyday cookware set" },
    { title: "Stoneware Dinnerware Set", brand: "Ashgrove", subtype: "dinnerware", subtitle: "Service for four, everyday plates" },
    { title: "Riverglen Kitchen Utensils", brand: "Bramblewood", subtype: "utensils", subtitle: "Heat-safe utensils with crock" },
    { title: "Whirlblend Countertop Blender", brand: "Ashgrove", subtype: "blender", subtitle: "High-speed blender for smoothies" },
    { title: "Millhouse Coffee Machine", brand: "Ashgrove", subtype: "coffee machine", subtitle: "Single-serve coffee machine" },
    { title: "Cobblestone Electric Kettle", brand: "Ashgrove", subtype: "kettle", subtitle: "Fast-boil kettle with auto shutoff" },
    { title: "Willowmere Cutting Board Set", brand: "Bramblewood", subtype: "cutting board", subtitle: "Bamboo cutting boards, set of 3" },
    { title: "Hazelbrook Food Storage Set", brand: "Bramblewood", subtype: "food storage", subtitle: "Stackable airtight containers" },
    { title: "Ovenrest Bakeware Set", brand: "Ashgrove", subtype: "bakeware", subtitle: "Nonstick sheet pans and muffin tin" },
    { title: "Drawerline Kitchen Organizer", brand: "Bramblewood", subtype: "organizer", subtitle: "Expandable drawer organizer" },
  ]),
  footwear: withBadges("footwear", [
    { title: "Pinnacle Running Shoe", brand: "Cadence", subtype: "running shoe", subtitle: "Lightweight shoe for road runs" },
    { title: "Harborline Canvas Sneaker", brand: "Wayfarer", subtype: "sneaker", subtitle: "Everyday casual sneaker" },
    { title: "Ridgeway Hiking Boot", brand: "Cadence", subtype: "hiking boot", subtitle: "Waterproof boot for the outdoors" },
    { title: "Summit Trail Sandal", brand: "Cadence", subtype: "sandal", subtitle: "Adjustable sandal for warm weather" },
    { title: "Meadowlark Everyday Loafer", brand: "Wayfarer", subtype: "loafer", subtitle: "Comfortable everyday loafer" },
    { title: "Northbend Winter Boot", brand: "Wayfarer", subtype: "winter boot", subtitle: "Insulated boot for cold climates" },
    { title: "Fleetfoot Training Shoe", brand: "Cadence", subtype: "training shoe", subtitle: "Cross-training shoe for the gym" },
    { title: "Shoreline Casual Shoe", brand: "Wayfarer", subtype: "casual shoe", subtitle: "Soft everyday casual shoe" },
    { title: "Boardwalk Dress Shoe", brand: "Wayfarer", subtype: "dress shoe", subtitle: "Polished lace-up dress shoe" },
    { title: "Easystep Slip-On Shoe", brand: "Cadence", subtype: "slip-on shoe", subtitle: "No-tie slip-on for travel days" },
  ]),
  beauty: withBadges("beauty", [
    { title: "Rosemere Hair Dryer 1875W", brand: "Verabelle", subtype: "hair dryer", subtitle: "Fast-drying dryer with cool shot" },
    { title: "Silkwood Curling Iron", brand: "Sable & Co.", subtype: "curling iron", subtitle: "Ceramic barrel for soft waves" },
    { title: "Sleekline Hair Straightener", brand: "Verabelle", subtype: "hair straightener", subtitle: "Flat iron for smooth styles" },
    { title: "Ambervale Electric Shaver", brand: "Sable & Co.", subtype: "electric shaver", subtitle: "Rechargeable razor for daily use" },
    { title: "Lumenne Facial Cleansing Brush", brand: "Sable & Co.", subtype: "facial cleansing brush", subtitle: "Gentle daily cleansing device" },
    { title: "Coolmist Skincare Fridge", brand: "Verabelle", subtype: "skincare fridge", subtitle: "Mini fridge for serums and creams" },
    { title: "Petalglow LED Mirror", brand: "Verabelle", subtype: "LED mirror", subtitle: "Lighted vanity mirror" },
    { title: "Softpulse Massage Tool", brand: "Sable & Co.", subtype: "massage tool", subtitle: "Handheld facial massage tool" },
    { title: "Marigold Manicure Kit", brand: "Verabelle", subtype: "manicure kit", subtitle: "Manicure and pedicure kit" },
    { title: "Trimline Grooming Kit", brand: "Sable & Co.", subtype: "grooming kit", subtitle: "Travel grooming essentials set" },
  ]),
  accessories: withBadges("accessories", [
    { title: "Harrowgate Leather Wallet", brand: "Coalridge", subtype: "wallet", subtitle: "Slim bifold wallet" },
    { title: "Kestrel Day Backpack", brand: "Portside", subtype: "backpack", subtitle: "Padded backpack with laptop compartment" },
    { title: "Brindlewood Phone Case", brand: "Coalridge", subtype: "phone case", subtitle: "Protective case with card slot" },
    { title: "Ashcombe Sunglasses", brand: "Coalridge", subtype: "sunglasses", subtitle: "Polarized everyday sunglasses" },
    { title: "Ironbridge Watch Band", brand: "Portside", subtype: "watch band", subtitle: "Adjustable band for smartwatches" },
    { title: "Millpond Fast-Charge Cable", brand: "Portside", subtype: "charging cable", subtitle: "Braided charging cable set" },
    { title: "Ledgerline Travel Organizer", brand: "Portside", subtype: "travel organizer", subtitle: "Pouch for cables and chargers" },
    { title: "Foxglove Crossbody Bag", brand: "Coalridge", subtype: "crossbody bag", subtitle: "Compact everyday crossbody" },
    { title: "Slatepack Laptop Sleeve", brand: "Portside", subtype: "laptop sleeve", subtitle: "Padded 14-inch laptop sleeve" },
    { title: "Orbit Wireless Charger", brand: "Coalridge", subtype: "wireless charger", subtitle: "Qi wireless charging pad" },
  ]),
  automotive: withBadges("automotive", [
    { title: "Redline Dash Cam 1080p", brand: "Ferroline", subtype: "dash cam", subtitle: "Front-view dash camera" },
    { title: "Wayline Phone Mount", brand: "Ferroline", subtype: "phone mount", subtitle: "Magnetic vent phone mount" },
    { title: "Chargepath Battery Charger", brand: "Roadcrest", subtype: "battery charger", subtitle: "12V battery charger and maintainer" },
    { title: "Stonegate All-Weather Floor Mats", brand: "Roadcrest", subtype: "floor mats", subtitle: "Set of 4 all-weather mats" },
    { title: "Cinderpath Tire Inflator", brand: "Ferroline", subtype: "tire inflator", subtitle: "Portable air compressor" },
    { title: "Millbank Car Vacuum", brand: "Roadcrest", subtype: "car vacuum", subtitle: "Compact handheld car vacuum" },
    { title: "ComfortRide Seat Cover", brand: "Ferroline", subtype: "seat cover", subtitle: "Universal front-seat cover set" },
    { title: "Trailhead Jump Starter", brand: "Roadcrest", subtype: "jump starter", subtitle: "Compact jump starter and power bank" },
    { title: "Clearview Windshield Wipers", brand: "Roadcrest", subtype: "windshield wipers", subtitle: "All-season wiper blade pair" },
    { title: "Roadkit Emergency Tool Kit", brand: "Ferroline", subtype: "tool kit", subtitle: "Compact roadside tool kit" },
  ]),
  outdoors: withBadges("outdoors", [
    { title: "Timberline Hiking Backpack 24L", brand: "Northfell", subtype: "backpack", subtitle: "Everyday hiking backpack" },
    { title: "Basecamp 2-Person Tent", brand: "Greylock", subtype: "tent", subtitle: "Lightweight shelter for overnight trips" },
    { title: "Duskfall Camping Lantern", brand: "Northfell", subtype: "camping lantern", subtitle: "Rechargeable LED lantern" },
    { title: "Icebound Soft Cooler", brand: "Greylock", subtype: "cooler", subtitle: "Insulated soft cooler for day trips" },
    { title: "Windward Hiking Bottle", brand: "Northfell", subtype: "hiking bottle", subtitle: "32oz insulated water bottle" },
    { title: "Alpineglow Sleeping Bag", brand: "Northfell", subtype: "sleeping bag", subtitle: "3-season sleeping bag" },
    { title: "Fernway Outdoor Chair", brand: "Greylock", subtype: "outdoor chair", subtitle: "Folding camp chair with cup holder" },
    { title: "Meadow Picnic Blanket", brand: "Northfell", subtype: "picnic blanket", subtitle: "Waterproof picnic blanket" },
    { title: "Trailcarry Travel Bag", brand: "Greylock", subtype: "travel bag", subtitle: "Duffel travel bag with shoe pocket" },
    { title: "Riverstone Portable Stove", brand: "Greylock", subtype: "portable stove", subtitle: "Portable propane camp stove" },
  ]),
  home: withBadges("home", [
    { title: "Aldergrove Weighted Blanket", brand: "Homestead & Co.", subtype: "blanket", subtitle: "12lb weighted blanket" },
    { title: "Brookline Table Lamp", brand: "Linden", subtype: "table lamp", subtitle: "Ceramic base table lamp" },
    { title: "Mossgate Storage Bins", brand: "Homestead & Co.", subtype: "storage bins", subtitle: "Stackable fabric storage bins, set of 3" },
    { title: "Thistledown Throw Pillows", brand: "Linden", subtype: "throw pillows", subtitle: "Decorative pillow covers, set of 2" },
    { title: "Hollowbrook Wall Clock", brand: "Linden", subtype: "wall clock", subtitle: "Minimalist wall clock" },
    { title: "Willowcrest Curtains", brand: "Linden", subtype: "curtains", subtitle: "Blackout curtain panels, pair" },
    { title: "Pemberton Diffuser", brand: "Homestead & Co.", subtype: "diffuser", subtitle: "Essential oil diffuser" },
    { title: "Softstep Area Rug", brand: "Linden", subtype: "rug", subtitle: "Low-pile living room rug" },
    { title: "Nestline Home Organizer", brand: "Homestead & Co.", subtype: "organizer", subtitle: "Desktop and drawer organizer set" },
    { title: "Clearair Home Air Purifier", brand: "Homestead & Co.", subtype: "home air purifier", subtitle: "Room air purifier with filter" },
  ]),
};

export function getCategoryDemoProducts(categorySlug: string, limit = 10): CategoryDemoProduct[] {
  const key = normalizeCategoryKey(categorySlug);
  return (CATEGORY_DEMO_PRODUCTS[key] ?? CATEGORY_DEMO_PRODUCTS[categorySlug] ?? []).slice(
    0,
    limit,
  );
}

/** Distinct subtype labels for category browse chips. */
export function getCategoryDemoSubtypes(categorySlug: string): string[] {
  return getCategoryDemoProducts(categorySlug, 20).map((p) => p.subtype);
}

/** Friendly chip labels for category browse (e.g. smartphone → Phones). */
const SUBTYPE_CHIP_LABELS: Record<string, string> = {
  smartphone: "Phones",
  laptop: "Laptops",
  tablet: "Tablets",
  headphones: "Headphones",
  earbuds: "Earbuds",
  monitor: "Monitors",
  smartwatch: "Smartwatches",
  speaker: "Speakers",
  camera: "Cameras",
  "gaming accessory": "Gaming",
  dishwasher: "Dishwashers",
  refrigerator: "Refrigerators",
  microwave: "Microwaves",
  "toaster oven": "Toaster ovens",
  "air fryer": "Air fryers",
  "coffee maker": "Coffee makers",
  vacuum: "Vacuums",
  "air purifier": "Air purifiers",
  dehumidifier: "Dehumidifiers",
  "washing machine": "Washers",
  cookware: "Cookware",
  dinnerware: "Dinnerware",
  utensils: "Utensils",
  blender: "Blenders",
  "coffee machine": "Coffee machines",
  kettle: "Kettles",
  "cutting board": "Cutting boards",
  "food storage": "Food storage",
  bakeware: "Bakeware",
  organizer: "Organizers",
  "running shoe": "Running",
  sneaker: "Sneakers",
  "hiking boot": "Hiking boots",
  sandal: "Sandals",
  loafer: "Loafers",
  "winter boot": "Winter boots",
  "training shoe": "Training",
  "casual shoe": "Casual",
  "dress shoe": "Dress shoes",
  "slip-on shoe": "Slip-ons",
  "hair dryer": "Hair dryers",
  "curling iron": "Curling irons",
  "hair straightener": "Straighteners",
  "electric shaver": "Shavers",
  "facial cleansing brush": "Facial brushes",
  "skincare fridge": "Skincare fridges",
  "led mirror": "LED mirrors",
  "massage tool": "Massage tools",
  "manicure kit": "Manicure kits",
  "grooming kit": "Grooming kits",
  wallet: "Wallets",
  backpack: "Backpacks",
  "phone case": "Phone cases",
  sunglasses: "Sunglasses",
  "watch band": "Watch bands",
  "charging cable": "Cables",
  "travel organizer": "Organizers",
  "crossbody bag": "Crossbody",
  "laptop sleeve": "Laptop sleeves",
  "wireless charger": "Chargers",
  "dash cam": "Dash cams",
  "phone mount": "Phone mounts",
  "battery charger": "Chargers",
  "floor mats": "Floor mats",
  "tire inflator": "Inflators",
  "car vacuum": "Car vacuums",
  "seat cover": "Seat covers",
  "jump starter": "Jump starters",
  "windshield wipers": "Wipers",
  "tool kit": "Tool kits",
  tent: "Tents",
  "camping lantern": "Lanterns",
  cooler: "Coolers",
  "hiking bottle": "Bottles",
  "sleeping bag": "Sleeping bags",
  "outdoor chair": "Chairs",
  "picnic blanket": "Picnic",
  "travel bag": "Travel bags",
  "portable stove": "Stoves",
  blanket: "Blankets",
  "table lamp": "Lamps",
  "storage bins": "Storage",
  "throw pillows": "Pillows",
  "wall clock": "Clocks",
  curtains: "Curtains",
  diffuser: "Diffusers",
  rug: "Rugs",
  "home air purifier": "Air purifiers",
};

export type CategorySubtypeChip = {
  subtype: string;
  label: string;
  image: string;
};

export function getCategorySubtypeChips(categorySlug: string): CategorySubtypeChip[] {
  return getCategoryDemoProducts(categorySlug, 20).map((p) => {
    const key = p.subtype.toLowerCase();
    return {
      subtype: p.subtype,
      label:
        SUBTYPE_CHIP_LABELS[key] ??
        p.subtype.replace(/\b\w/g, (c) => c.toUpperCase()),
      image: p.image,
    };
  });
}
