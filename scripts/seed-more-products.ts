/**
 * Additive, idempotent demo catalog expansion.
 *
 * Adds extra canonical products (+ approved listings, matches, and some price
 * history) so the homepage rails show genuine variety instead of repeating the
 * original four seed products. Safe to re-run: it only removes/recreates rows in
 * its own namespace (`cp-x-*`, `xl-*`) and never touches the base seed data.
 *
 * Run with:  npx tsx scripts/seed-more-products.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000);
}
function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60_000);
}

type BrandDef = { id: string; name: string; slug: string };
const BRANDS: BrandDef[] = [
  { id: "brand-apex", name: "Apex Home", slug: "apex-home" },
  { id: "brand-stride", name: "Stride", slug: "stride" },
  { id: "brand-aura", name: "Aura Pure", slug: "aura-pure" },
  { id: "brand-nimbus", name: "Nimbus", slug: "nimbus" },
  { id: "brand-chefline", name: "ChefLine", slug: "chefline" },
  { id: "brand-cozynest", name: "CozyNest", slug: "cozynest" },
  { id: "brand-carryall", name: "CarryAll", slug: "carryall" },
  { id: "brand-roadpro", name: "RoadPro", slug: "roadpro" },
  { id: "brand-trailpeak", name: "TrailPeak", slug: "trailpeak" },
  { id: "brand-verabelle", name: "Verabelle", slug: "verabelle" },
  { id: "brand-sableco", name: "Sable & Co.", slug: "sable-co" },
];

type CatDef = { id: string; name: string; slug: string };
const CATEGORIES: CatDef[] = [
  { id: "cat-appliances", name: "Appliances", slug: "appliances" },
  { id: "cat-electronics", name: "Electronics", slug: "electronics" },
  { id: "cat-footwear", name: "Footwear", slug: "footwear" },
  { id: "cat-home", name: "Home", slug: "home" },
  { id: "cat-accessories", name: "Accessories", slug: "accessories" },
  { id: "cat-kitchen", name: "Kitchen", slug: "kitchen" },
  { id: "cat-automotive", name: "Automotive", slug: "automotive" },
  { id: "cat-outdoors", name: "Outdoors", slug: "outdoors" },
  { id: "cat-beauty-devices", name: "Beauty Devices", slug: "beauty-devices" },
];

type ProductDef = {
  id: string;
  brandId: string;
  categoryId: string;
  /** Title keyword must match a subtype in product-images.ts so a distinct photo resolves. */
  modelName: string;
  modelNumber: string;
  rating: number;
  ratingCount: number;
  basePrice: number;
  /** number of approved listings to create (2..8) */
  offers: number;
  /** true → add price history so it shows a real % drop under Best Deals */
  discount?: boolean;
  attributes?: { key: string; value: string; unit?: string }[];
};

const PRODUCTS: ProductDef[] = [
  // electronics — titles map to distinct subtype photos in product-images.ts
  { id: "cp-x-headphones", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Over-Ear Headphones", modelNumber: "NB-H1", rating: 4.6, ratingCount: 428, basePrice: 149, offers: 7, discount: true },
  { id: "cp-x-ultrabook", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus 14 Ultrabook", modelNumber: "NB-U14", rating: 4.5, ratingCount: 213, basePrice: 899, offers: 6 },
  { id: "cp-x-tablet", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Pro Tablet", modelNumber: "NB-T11", rating: 4.4, ratingCount: 165, basePrice: 429, offers: 5, discount: true },
  { id: "cp-x-keyboard", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Mechanical Keyboard", modelNumber: "NB-K87", rating: 4.7, ratingCount: 356, basePrice: 89, offers: 4 },
  { id: "cp-x-earbuds", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Wireless Earbuds", modelNumber: "NB-E9", rating: 4.3, ratingCount: 512, basePrice: 79, offers: 6, discount: true },
  { id: "cp-x-phone", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Smart Phone SE", modelNumber: "NB-P1", rating: 4.5, ratingCount: 390, basePrice: 499, offers: 5 },
  { id: "cp-x-monitor", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Clearview Monitor", modelNumber: "NB-M27", rating: 4.6, ratingCount: 188, basePrice: 249, offers: 4 },
  { id: "cp-x-smartwatch", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Solace Smartwatch", modelNumber: "NB-SW", rating: 4.4, ratingCount: 276, basePrice: 179, offers: 5, discount: true },
  { id: "cp-x-speaker", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Auralite Bluetooth Speaker", modelNumber: "NB-SP", rating: 4.3, ratingCount: 154, basePrice: 69, offers: 4 },
  { id: "cp-x-camera", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Lensfield Compact Camera", modelNumber: "NB-CAM", rating: 4.5, ratingCount: 121, basePrice: 329, offers: 4 },
  { id: "cp-x-gamepad", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus ArcadePad Gaming Controller", modelNumber: "NB-GP", rating: 4.6, ratingCount: 340, basePrice: 59, offers: 5 },
  // kitchen — titles map to distinct subtype photos in product-images.ts
  { id: "cp-x-blender", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Countertop Blender", modelNumber: "CL-B5", rating: 4.5, ratingCount: 274, basePrice: 119, offers: 5 },
  { id: "cp-x-kettle", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Electric Kettle", modelNumber: "CL-K2", rating: 4.6, ratingCount: 198, basePrice: 59, offers: 4, discount: true },
  { id: "cp-x-mixer", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Stand Mixer", modelNumber: "CL-M8", rating: 4.8, ratingCount: 421, basePrice: 289, offers: 6 },
  { id: "cp-x-cookware", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Nonstick Cookware Set", modelNumber: "CL-CW1", rating: 4.5, ratingCount: 187, basePrice: 149, offers: 4 },
  { id: "cp-x-dinnerware", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Stoneware Dinnerware Set", modelNumber: "CL-DW1", rating: 4.4, ratingCount: 132, basePrice: 79, offers: 3 },
  { id: "cp-x-utensils", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Kitchen Utensil Set", modelNumber: "CL-UT1", rating: 4.3, ratingCount: 96, basePrice: 29, offers: 3 },
  { id: "cp-x-coffeemachine", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Single-Serve Coffee Machine", modelNumber: "CL-CM1", rating: 4.5, ratingCount: 245, basePrice: 89, offers: 4, discount: true },
  { id: "cp-x-cuttingboard", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Bamboo Cutting Board Set", modelNumber: "CL-CB1", rating: 4.6, ratingCount: 158, basePrice: 34, offers: 3 },
  { id: "cp-x-foodstorage", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Airtight Food Storage Set", modelNumber: "CL-FS1", rating: 4.4, ratingCount: 121, basePrice: 39, offers: 3 },
  { id: "cp-x-bakeware", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Nonstick Bakeware Set", modelNumber: "CL-BW1", rating: 4.5, ratingCount: 109, basePrice: 44, offers: 3 },
  { id: "cp-x-korganizer", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Drawer Organizer", modelNumber: "CL-OR1", rating: 4.2, ratingCount: 64, basePrice: 24, offers: 2 },
  // footwear
  { id: "cp-x-sneaker", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Canvas Sneaker", modelNumber: "ST-CS", rating: 4.4, ratingCount: 302, basePrice: 69, offers: 5 },
  { id: "cp-x-chukka", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Chukka Boot", modelNumber: "ST-CB", rating: 4.5, ratingCount: 141, basePrice: 109, offers: 4, discount: true },
  { id: "cp-x-runningshoe", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Velocity Running Shoe", modelNumber: "ST-RS1", rating: 4.6, ratingCount: 356, basePrice: 99, offers: 5, discount: true },
  { id: "cp-x-hikingboot", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Ridgeline Hiking Boot", modelNumber: "ST-HB1", rating: 4.5, ratingCount: 187, basePrice: 139, offers: 4 },
  { id: "cp-x-sandal", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Summer Sandal", modelNumber: "ST-SD1", rating: 4.3, ratingCount: 112, basePrice: 39, offers: 3 },
  { id: "cp-x-loafer", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Classic Loafer", modelNumber: "ST-LF1", rating: 4.4, ratingCount: 98, basePrice: 79, offers: 3 },
  { id: "cp-x-winterboot", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Arctic Winter Boot", modelNumber: "ST-WB1", rating: 4.5, ratingCount: 143, basePrice: 129, offers: 3, discount: true },
  { id: "cp-x-trainingshoe", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride CrossTrain Training Shoe", modelNumber: "ST-TS1", rating: 4.4, ratingCount: 176, basePrice: 89, offers: 4 },
  { id: "cp-x-casualshoe", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Everyday Casual Shoe", modelNumber: "ST-CSH1", rating: 4.3, ratingCount: 121, basePrice: 59, offers: 3 },
  { id: "cp-x-dressshoe", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Oxford Dress Shoe", modelNumber: "ST-DS1", rating: 4.5, ratingCount: 104, basePrice: 119, offers: 3 },
  { id: "cp-x-sliponshoe", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Easy Slip-On Shoe", modelNumber: "ST-SO1", rating: 4.3, ratingCount: 89, basePrice: 65, offers: 3 },
  // home
  { id: "cp-x-lamp", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Table Lamp", modelNumber: "CN-L1", rating: 4.3, ratingCount: 96, basePrice: 45, offers: 3 },
  { id: "cp-x-blanket", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Throw Blanket", modelNumber: "CN-BL", rating: 4.7, ratingCount: 233, basePrice: 39, offers: 4 },
  { id: "cp-x-storagebins", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Fabric Storage Bins", modelNumber: "CN-SB1", rating: 4.3, ratingCount: 87, basePrice: 34, offers: 3 },
  { id: "cp-x-throwpillow", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Decorative Throw Pillow Set", modelNumber: "CN-TP1", rating: 4.4, ratingCount: 112, basePrice: 29, offers: 3 },
  { id: "cp-x-wallclock", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Minimalist Wall Clock", modelNumber: "CN-WC1", rating: 4.5, ratingCount: 76, basePrice: 32, offers: 3, discount: true },
  { id: "cp-x-curtains", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Blackout Curtain Panels", modelNumber: "CN-CT1", rating: 4.4, ratingCount: 134, basePrice: 44, offers: 3 },
  { id: "cp-x-diffuser", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Essential Oil Diffuser", modelNumber: "CN-DF1", rating: 4.3, ratingCount: 98, basePrice: 27, offers: 3 },
  { id: "cp-x-rug", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Living Room Area Rug", modelNumber: "CN-RG1", rating: 4.4, ratingCount: 145, basePrice: 89, offers: 3 },
  { id: "cp-x-horganizer", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Desktop Organizer", modelNumber: "CN-OR1", rating: 4.2, ratingCount: 58, basePrice: 22, offers: 2 },
  // accessories
  { id: "cp-x-backpack", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Travel Backpack", modelNumber: "CA-BP", rating: 4.6, ratingCount: 318, basePrice: 89, offers: 5, discount: true },
  { id: "cp-x-sunglasses", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Polarized Sunglasses", modelNumber: "CA-SG", rating: 4.2, ratingCount: 87, basePrice: 55, offers: 3 },
  { id: "cp-x-wallet", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Leather Bifold Wallet", modelNumber: "CA-WL1", rating: 4.5, ratingCount: 203, basePrice: 39, offers: 4, discount: true },
  { id: "cp-x-phonecase", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Protective Phone Case", modelNumber: "CA-PC1", rating: 4.3, ratingCount: 176, basePrice: 24, offers: 3 },
  { id: "cp-x-watchband", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Adjustable Watch Band", modelNumber: "CA-WB1", rating: 4.2, ratingCount: 92, basePrice: 19, offers: 3 },
  { id: "cp-x-chargingcable", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Braided Charging Cable", modelNumber: "CA-CC1", rating: 4.4, ratingCount: 214, basePrice: 15, offers: 3 },
  { id: "cp-x-travelorganizer", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Travel Cable Organizer", modelNumber: "CA-TO1", rating: 4.3, ratingCount: 88, basePrice: 22, offers: 3 },
  { id: "cp-x-crossbody", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Crossbody Bag", modelNumber: "CA-XB1", rating: 4.5, ratingCount: 156, basePrice: 49, offers: 3 },
  { id: "cp-x-laptopsleeve", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Padded Laptop Sleeve", modelNumber: "CA-LS1", rating: 4.4, ratingCount: 101, basePrice: 29, offers: 3 },
  { id: "cp-x-wirelesscharger", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Qi Wireless Charger", modelNumber: "CA-WC2", rating: 4.3, ratingCount: 133, basePrice: 27, offers: 3, discount: true },
  // appliances
  { id: "cp-x-microwave", brandId: "brand-apex", categoryId: "cat-appliances", modelName: "Apex Home Microwave Oven", modelNumber: "AH-MW", rating: 4.4, ratingCount: 176, basePrice: 129, offers: 5 },
  { id: "cp-x-airfryer", brandId: "brand-apex", categoryId: "cat-appliances", modelName: "Apex Home Air Fryer", modelNumber: "AH-AF", rating: 4.7, ratingCount: 389, basePrice: 99, offers: 6, discount: true },
  // automotive — distinct subtype photos (never reuse phone-mount for everything)
  { id: "cp-x-dashcam", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Dash Cam 1080p", modelNumber: "RP-DC", rating: 4.3, ratingCount: 142, basePrice: 79, offers: 4 },
  { id: "cp-x-phonemount", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Phone Mount", modelNumber: "RP-PM", rating: 4.2, ratingCount: 98, basePrice: 29, offers: 3 },
  { id: "cp-x-batcharger", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Battery Charger", modelNumber: "RP-BC", rating: 4.4, ratingCount: 167, basePrice: 59, offers: 4 },
  { id: "cp-x-floormats", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Floor Mats", modelNumber: "RP-FM", rating: 4.5, ratingCount: 210, basePrice: 49, offers: 3 },
  { id: "cp-x-inflator", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Tire Inflator", modelNumber: "RP-TI", rating: 4.3, ratingCount: 134, basePrice: 45, offers: 3 },
  { id: "cp-x-carvac", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Car Vacuum", modelNumber: "RP-CV", rating: 4.4, ratingCount: 156, basePrice: 55, offers: 4 },
  { id: "cp-x-seatcover", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Seat Cover", modelNumber: "RP-SC", rating: 4.2, ratingCount: 88, basePrice: 39, offers: 3 },
  { id: "cp-x-jump", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Jump Starter", modelNumber: "RP-JS", rating: 4.6, ratingCount: 201, basePrice: 89, offers: 4, discount: true },
  { id: "cp-x-wipers", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Windshield Wipers", modelNumber: "RP-WW", rating: 4.5, ratingCount: 240, basePrice: 24, offers: 3 },
  { id: "cp-x-toolkit", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Emergency Tool Kit", modelNumber: "RP-TK", rating: 4.4, ratingCount: 112, basePrice: 49, offers: 3 },
  // outdoors
  { id: "cp-x-cooler", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Cooler", modelNumber: "TP-CL", rating: 4.6, ratingCount: 168, basePrice: 119, offers: 4, discount: true },
  { id: "cp-x-tent", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Camping Tent", modelNumber: "TP-TN", rating: 4.5, ratingCount: 254, basePrice: 179, offers: 5 },
  { id: "cp-x-lantern", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Rechargeable Camping Lantern", modelNumber: "TP-LT1", rating: 4.5, ratingCount: 132, basePrice: 34, offers: 3 },
  { id: "cp-x-waterbottle", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Insulated Water Bottle", modelNumber: "TP-WB1", rating: 4.6, ratingCount: 289, basePrice: 29, offers: 4, discount: true },
  { id: "cp-x-sleepingbag", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak 3-Season Sleeping Bag", modelNumber: "TP-SB1", rating: 4.5, ratingCount: 176, basePrice: 89, offers: 3 },
  { id: "cp-x-outdoorchair", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Folding Outdoor Chair", modelNumber: "TP-OC1", rating: 4.4, ratingCount: 121, basePrice: 45, offers: 3 },
  { id: "cp-x-picnicblanket", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Waterproof Picnic Blanket", modelNumber: "TP-PB1", rating: 4.3, ratingCount: 98, basePrice: 32, offers: 3 },
  { id: "cp-x-travelbag", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Weekend Travel Bag", modelNumber: "TP-TB1", rating: 4.4, ratingCount: 143, basePrice: 69, offers: 3 },
  { id: "cp-x-portablestove", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Portable Camp Stove", modelNumber: "TP-PS1", rating: 4.5, ratingCount: 156, basePrice: 54, offers: 3, discount: true },
  { id: "cp-x-hikingbackpack", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak 40L Trail Daypack", modelNumber: "TP-HB1", rating: 4.6, ratingCount: 201, basePrice: 129, offers: 4 },
  // beauty devices
  { id: "cp-x-hairdryer", brandId: "brand-verabelle", categoryId: "cat-beauty-devices", modelName: "Verabelle Ionic Hair Dryer", modelNumber: "VB-HD1", rating: 4.5, ratingCount: 267, basePrice: 64, offers: 4, discount: true },
  { id: "cp-x-curlingiron", brandId: "brand-sableco", categoryId: "cat-beauty-devices", modelName: "Sable & Co. Ceramic Curling Iron", modelNumber: "SC-CI1", rating: 4.4, ratingCount: 154, basePrice: 42, offers: 3 },
  { id: "cp-x-hairstraightener", brandId: "brand-verabelle", categoryId: "cat-beauty-devices", modelName: "Verabelle Smooth Hair Straightener", modelNumber: "VB-HS1", rating: 4.5, ratingCount: 198, basePrice: 48, offers: 4 },
  { id: "cp-x-electricshaver", brandId: "brand-sableco", categoryId: "cat-beauty-devices", modelName: "Sable & Co. Rechargeable Electric Shaver", modelNumber: "SC-ES1", rating: 4.3, ratingCount: 176, basePrice: 59, offers: 3, discount: true },
  { id: "cp-x-facialbrush", brandId: "brand-sableco", categoryId: "cat-beauty-devices", modelName: "Sable & Co. Facial Cleansing Brush", modelNumber: "SC-FB1", rating: 4.4, ratingCount: 121, basePrice: 35, offers: 3 },
  { id: "cp-x-skincarefridge", brandId: "brand-verabelle", categoryId: "cat-beauty-devices", modelName: "Verabelle Mini Skincare Fridge", modelNumber: "VB-SF1", rating: 4.2, ratingCount: 88, basePrice: 45, offers: 3 },
  { id: "cp-x-ledmirror", brandId: "brand-verabelle", categoryId: "cat-beauty-devices", modelName: "Verabelle LED Vanity Mirror", modelNumber: "VB-LM1", rating: 4.5, ratingCount: 143, basePrice: 54, offers: 3 },
  { id: "cp-x-massagetool", brandId: "brand-sableco", categoryId: "cat-beauty-devices", modelName: "Sable & Co. Handheld Massage Tool", modelNumber: "SC-MT1", rating: 4.3, ratingCount: 102, basePrice: 38, offers: 3 },
  { id: "cp-x-manicurekit", brandId: "brand-verabelle", categoryId: "cat-beauty-devices", modelName: "Verabelle Manicure & Pedicure Kit", modelNumber: "VB-MK1", rating: 4.4, ratingCount: 116, basePrice: 32, offers: 3 },
  { id: "cp-x-groomingkit", brandId: "brand-sableco", categoryId: "cat-beauty-devices", modelName: "Sable & Co. Travel Grooming Kit", modelNumber: "SC-GK1", rating: 4.3, ratingCount: 94, basePrice: 29, offers: 3, discount: true },
];

/** Seeded catalog attributes — demo specs only; never used as invented live retailer claims. */
function catalogAttributesFor(p: ProductDef): { key: string; value: string; unit?: string }[] {
  if (p.attributes?.length) return p.attributes;
  const id = p.id;
  switch (p.categoryId) {
    case "cat-automotive":
      return [
        {
          key: "Vehicle fitment",
          value:
            id.includes("wipers") || id.includes("floormats") || id.includes("seatcover")
              ? "2018-2024 Honda Civic"
              : id.includes("dashcam") || id.includes("phonemount")
                ? "Universal mount — most vehicles"
                : "2016-2023 Toyota Camry",
        },
        {
          key: "Installation required",
          value: id.includes("dashcam") || id.includes("seatcover") || id.includes("toolkit") ? "Yes" : "No",
        },
        {
          key: "Shipping weight",
          value: id.includes("jump") || id.includes("toolkit") ? "4.2" : "1.8",
          unit: "lb",
        },
      ];
    case "cat-beauty-devices":
      return [
        {
          key: "Power source",
          value: id.includes("shaver") || id.includes("facial") || id.includes("massage")
            ? "Rechargeable"
            : id.includes("fridge")
              ? "Corded"
              : "Corded",
        },
        {
          key: "Material",
          value: id.includes("curling") || id.includes("straight") ? "Ceramic" : "ABS + alloy",
        },
        {
          key: id.includes("shaver") || id.includes("facial") || id.includes("skin") ? "Skin type" : "Hair type",
          value: id.includes("shaver") || id.includes("facial") || id.includes("skin")
            ? "All skin types"
            : "All hair types",
        },
        ...(id.includes("facial") || id.includes("skin")
          ? [{ key: "Certification", value: "FDA cleared" }]
          : []),
      ];
    case "cat-outdoors":
      return [
        {
          key: "Water resistance",
          value: id.includes("tent") || id.includes("picnic") || id.includes("bottle")
            ? "IPX7"
            : id.includes("lantern")
              ? "IPX4"
              : "Water-resistant shell",
        },
        {
          key: "Weight",
          value: id.includes("tent") ? "8.4" : id.includes("backpack") ? "2.6" : "1.1",
          unit: "lb",
        },
        {
          key: "Activity type",
          value: id.includes("hiking") || id.includes("backpack")
            ? "Hiking"
            : id.includes("bike") || id.includes("cycle")
              ? "Cycling"
              : "Camping",
        },
      ];
    case "cat-accessories":
      return [
        {
          key: "Color",
          value: id.includes("sunglasses")
            ? "Black"
            : id.includes("wallet")
              ? "Brown"
              : id.includes("phonecase")
                ? "Navy"
                : id.includes("watchband")
                  ? "Silver"
                  : "Matte black",
        },
        {
          key: "Material",
          value: id.includes("wallet") || id.includes("crossbody") ? "Leather" : "Nylon / polymer",
        },
        ...(id.includes("charger") || id.includes("cable") || id.includes("wireless")
          ? [{ key: "Power source", value: "Corded" }]
          : []),
      ];
    case "cat-electronics":
      return [
        ...(id.includes("monitor") || id.includes("tablet") || id.includes("ultrabook")
          ? [{ key: "Screen size", value: id.includes("monitor") ? "27" : "14", unit: "in" }]
          : []),
        { key: "Color", value: "Space gray" },
      ];
    case "cat-appliances":
      return [
        { key: "Capacity", value: id.includes("microwave") ? "1.1" : "5", unit: id.includes("microwave") ? "cu ft" : "qt" },
        { key: "Color", value: "Stainless" },
        { key: "Finish", value: "Brushed steel" },
      ];
    default:
      return [];
  }
}
const SOURCES = [
  "src-amazon",
  "src-idealo",
  "src-google-shopping",
  "src-official",
  "src-retailer-direct",
  "src-local-electronics",
  "src-authorized-outlet",
  "src-discount-home",
];

async function cleanup() {
  await prisma.priceHistory.deleteMany({ where: { listingId: { startsWith: "xl-" } } });
  await prisma.productMatch.deleteMany({ where: { listingId: { startsWith: "xl-" } } });
  await prisma.listing.deleteMany({ where: { id: { startsWith: "xl-" } } });
  await prisma.productAttribute.deleteMany({ where: { canonicalProductId: { startsWith: "cp-x-" } } });
  await prisma.productIdentifier.deleteMany({ where: { canonicalProductId: { startsWith: "cp-x-" } } });
  await prisma.canonicalProduct.deleteMany({ where: { id: { startsWith: "cp-x-" } } });
}

async function main() {
  await cleanup();

  for (const b of BRANDS) {
    await prisma.brand.upsert({
      where: { id: b.id },
      update: {},
      create: { id: b.id, name: b.name, slug: b.slug, isAuthorized: true },
    });
  }
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, name: c.name, slug: c.slug },
    });
  }

  let listingTotal = 0;
  for (const p of PRODUCTS) {
    await prisma.canonicalProduct.create({
      data: {
        id: p.id,
        brandId: p.brandId,
        categoryId: p.categoryId,
        modelName: p.modelName,
        modelNumber: p.modelNumber,
        averageRating: p.rating,
        ratingCount: p.ratingCount,
      },
    });

    const attrs = catalogAttributesFor(p);
    for (const [i, a] of attrs.entries()) {
      await prisma.productAttribute.create({
        data: {
          id: `xattr-${p.id.replace("cp-x-", "")}-${i}`,
          canonicalProductId: p.id,
          key: a.key,
          value: a.value,
          unit: a.unit ?? null,
        },
      });
    }
    const short = p.id.replace("cp-x-", "");
    const offers = Math.max(2, Math.min(p.offers, SOURCES.length));
    // spread prices around basePrice so the lowest total is realistic
    const deltas = [-0.06, -0.02, 0.0, 0.03, 0.05, 0.08, 0.11, 0.14];
    for (let i = 0; i < offers; i++) {
      const listingId = `xl-${short}-${i}`;
      const price = Math.round(p.basePrice * (1 + deltas[i]!) * 100) / 100;
      const shipping = i % 3 === 0 ? 0 : Math.round((3.99 + i) * 100) / 100;
      // Last offer is always open-box + pickup so filtered search
      // (condition=open_box&pickup=1) still returns real Add-to-Cart listings.
      const isOpenBoxPickup = i === offers - 1;
      await prisma.listing.create({
        data: {
          id: listingId,
          sourceId: SOURCES[i % SOURCES.length]!,
          canonicalProductId: p.id,
          condition: isOpenBoxPickup ? "open-box" : "new",
          price,
          shipping: isOpenBoxPickup ? 0 : shipping,
          fees: 0,
          deliveryLabel: isOpenBoxPickup
            ? "Pickup today"
            : i % 2 === 0
              ? "Tomorrow"
              : "2-4 days",
          // No real retailer integration exists in this demo — leave url
          // unset rather than fabricate a link, so "Continue to retailer" /
          // "View retailer offer" correctly stay hidden (listing.url ? ... : null).
          url: null,
          freshnessCapturedAt: minutesAgo(3 + i * 2),
        },
      });
      await prisma.productMatch.create({
        data: {
          id: `xmatch-${listingId}`,
          canonicalProductId: p.id,
          listingId,
          type: "exact",
          confidence: 0.95,
          status: "approved",
        },
      });
      listingTotal++;
    }

    if (p.discount) {
      // Two days of history on the cheapest listing: earlier day higher → real % drop.
      const cheapest = `xl-${short}-0`;
      const current = Math.round(p.basePrice * (1 + deltas[0]!) * 100) / 100;
      const previous = Math.round(current * 1.18 * 100) / 100;
      await prisma.priceHistory.create({
        data: { id: `xph-${short}-prev`, listingId: cheapest, price: previous, shipping: 0, capturedAt: daysAgo(2) },
      });
      await prisma.priceHistory.create({
        data: { id: `xph-${short}-now`, listingId: cheapest, price: current, shipping: 0, capturedAt: daysAgo(0) },
      });
    }
  }

  console.log(`Added ${PRODUCTS.length} products and ${listingTotal} approved listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
