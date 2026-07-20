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
};

const PRODUCTS: ProductDef[] = [
  // electronics
  { id: "cp-x-headphones", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Over-Ear Headphones", modelNumber: "NB-H1", rating: 4.6, ratingCount: 428, basePrice: 149, offers: 7, discount: true },
  { id: "cp-x-ultrabook", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus 14 Ultrabook", modelNumber: "NB-U14", rating: 4.5, ratingCount: 213, basePrice: 899, offers: 6 },
  { id: "cp-x-tablet", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Pro Tablet", modelNumber: "NB-T11", rating: 4.4, ratingCount: 165, basePrice: 429, offers: 5, discount: true },
  { id: "cp-x-keyboard", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Mechanical Keyboard", modelNumber: "NB-K87", rating: 4.7, ratingCount: 356, basePrice: 89, offers: 4 },
  { id: "cp-x-earbuds", brandId: "brand-nimbus", categoryId: "cat-electronics", modelName: "Nimbus Wireless Earbuds", modelNumber: "NB-E9", rating: 4.3, ratingCount: 512, basePrice: 79, offers: 6, discount: true },
  // kitchen
  { id: "cp-x-blender", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Countertop Blender", modelNumber: "CL-B5", rating: 4.5, ratingCount: 274, basePrice: 119, offers: 5 },
  { id: "cp-x-kettle", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Electric Kettle", modelNumber: "CL-K2", rating: 4.6, ratingCount: 198, basePrice: 59, offers: 4, discount: true },
  { id: "cp-x-mixer", brandId: "brand-chefline", categoryId: "cat-kitchen", modelName: "ChefLine Stand Mixer", modelNumber: "CL-M8", rating: 4.8, ratingCount: 421, basePrice: 289, offers: 6 },
  // footwear
  { id: "cp-x-sneaker", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Canvas Sneaker", modelNumber: "ST-CS", rating: 4.4, ratingCount: 302, basePrice: 69, offers: 5 },
  { id: "cp-x-chukka", brandId: "brand-stride", categoryId: "cat-footwear", modelName: "Stride Chukka Boot", modelNumber: "ST-CB", rating: 4.5, ratingCount: 141, basePrice: 109, offers: 4, discount: true },
  // home
  { id: "cp-x-lamp", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Table Lamp", modelNumber: "CN-L1", rating: 4.3, ratingCount: 96, basePrice: 45, offers: 3 },
  { id: "cp-x-blanket", brandId: "brand-cozynest", categoryId: "cat-home", modelName: "CozyNest Throw Blanket", modelNumber: "CN-BL", rating: 4.7, ratingCount: 233, basePrice: 39, offers: 4 },
  // accessories
  { id: "cp-x-backpack", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Travel Backpack", modelNumber: "CA-BP", rating: 4.6, ratingCount: 318, basePrice: 89, offers: 5, discount: true },
  { id: "cp-x-sunglasses", brandId: "brand-carryall", categoryId: "cat-accessories", modelName: "CarryAll Polarized Sunglasses", modelNumber: "CA-SG", rating: 4.2, ratingCount: 87, basePrice: 55, offers: 3 },
  // appliances
  { id: "cp-x-microwave", brandId: "brand-apex", categoryId: "cat-appliances", modelName: "Apex Home Microwave Oven", modelNumber: "AH-MW", rating: 4.4, ratingCount: 176, basePrice: 129, offers: 5 },
  { id: "cp-x-airfryer", brandId: "brand-apex", categoryId: "cat-appliances", modelName: "Apex Home Air Fryer", modelNumber: "AH-AF", rating: 4.7, ratingCount: 389, basePrice: 99, offers: 6, discount: true },
  // automotive
  { id: "cp-x-dashcam", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Dash Cam", modelNumber: "RP-DC", rating: 4.3, ratingCount: 142, basePrice: 79, offers: 4 },
  { id: "cp-x-floormats", brandId: "brand-roadpro", categoryId: "cat-automotive", modelName: "RoadPro Floor Mats", modelNumber: "RP-FM", rating: 4.5, ratingCount: 210, basePrice: 49, offers: 3 },
  // outdoors
  { id: "cp-x-cooler", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Cooler", modelNumber: "TP-CL", rating: 4.6, ratingCount: 168, basePrice: 119, offers: 4, discount: true },
  { id: "cp-x-tent", brandId: "brand-trailpeak", categoryId: "cat-outdoors", modelName: "TrailPeak Camping Tent", modelNumber: "TP-TN", rating: 4.5, ratingCount: 254, basePrice: 179, offers: 5 },
];

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

    const short = p.id.replace("cp-x-", "");
    const offers = Math.max(2, Math.min(p.offers, SOURCES.length));
    // spread prices around basePrice so the lowest total is realistic
    const deltas = [-0.06, -0.02, 0.0, 0.03, 0.05, 0.08, 0.11, 0.14];
    for (let i = 0; i < offers; i++) {
      const listingId = `xl-${short}-${i}`;
      const price = Math.round(p.basePrice * (1 + deltas[i]!) * 100) / 100;
      const shipping = i % 3 === 0 ? 0 : Math.round((3.99 + i) * 100) / 100;
      await prisma.listing.create({
        data: {
          id: listingId,
          sourceId: SOURCES[i % SOURCES.length]!,
          canonicalProductId: p.id,
          condition: i === offers - 1 ? "open-box" : "new",
          price,
          shipping,
          fees: 0,
          deliveryLabel: i % 2 === 0 ? "Tomorrow" : "2-4 days",
          url: `https://example.com/offers/${listingId}`,
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
