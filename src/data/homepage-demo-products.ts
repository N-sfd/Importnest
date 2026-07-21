/**
 * Homepage demo browse data only — see AGENTS.md / homepage-demo-data rule.
 *
 * These tiles make Top Products / Best Deals visually rich while the seeded
 * catalog is small. They are NOT live retailer offers:
 * - Do not use for production ranking.
 * - Do not treat demo prices as live listing totals.
 * - Never wire demo ids into compare ranking, alerts, or checkout as real SKUs.
 * Listing-backed homepage cards come from getPopularComparisons / getBestDeals.
 */

import { categoryDisplayTitle, normalizeCategorySlug } from "@/lib/category-visuals";

export type HomepageDemoTopProduct = {
  id: string;
  productName: string;
  brandName: string;
  categorySlug: string;
  imageSrc: string;
  /** Seeded demo score for browse UI only — not a live retailer rating. */
  rating: number | null;
  /** Seeded demo “from” total for browse UI only — not a live listing TKC. */
  fromPrice: number;
  /** Illustrative offer count for browse density — not live approved listings. */
  offerCount: number;
};

export type HomepageDemoDeal = {
  id: string;
  productName: string;
  brandName: string;
  categorySlug: string;
  imageSrc: string;
  currentPrice: number;
  /** Seeded prior total for strikethrough — demo only. */
  previousPrice: number | null;
  /** Derived from seeded current/previous when previous > current. */
  discountPercent: number | null;
  offerCount: number;
};

function categoryLabel(slug: string) {
  return categoryDisplayTitle(slug);
}

/** Distinct product photos for homepage Top Products rail. */
export const HOMEPAGE_DEMO_TOP_PRODUCTS: HomepageDemoTopProduct[] = [
  {
    id: "home-demo-top-headphones",
    productName: "Harborline Over-Ear Headphones",
    brandName: "Alto",
    categorySlug: "electronics",
    imageSrc: "/images/home/top-products/airbuds-pro-3.png",
    rating: 4.5,
    fromPrice: 129.0,
    offerCount: 4,
  },
  {
    id: "home-demo-top-laptop",
    productName: "Vantage 14\" Everyday Laptop",
    brandName: "Nordstream",
    categorySlug: "electronics",
    imageSrc: "/images/products/electronics/laptop.jpg",
    rating: 4.3,
    fromPrice: 749.0,
    offerCount: 5,
  },
  {
    id: "home-demo-top-blender",
    productName: "Whirlblend Countertop Blender",
    brandName: "Ashgrove",
    categorySlug: "kitchen",
    imageSrc: "/images/products/kitchen/blender.jpg",
    rating: 4.4,
    fromPrice: 89.0,
    offerCount: 3,
  },
  {
    id: "home-demo-top-hiking-boot",
    productName: "Ridgepath Hiking Boot",
    brandName: "Trailmere",
    categorySlug: "footwear",
    imageSrc: "/images/products/footwear/hiking-boot.jpg",
    rating: 4.6,
    fromPrice: 148.0,
    offerCount: 4,
  },
  {
    id: "home-demo-top-dashcam",
    productName: "Clearlane Dash Cam",
    brandName: "Motora",
    categorySlug: "automotive",
    imageSrc: "/images/products/automotive/dash-cam.jpg",
    rating: 4.2,
    fromPrice: 119.0,
    offerCount: 3,
  },
  {
    id: "home-demo-top-tent",
    productName: "Campfield 2-Person Tent",
    brandName: "Wildspan",
    categorySlug: "outdoors",
    imageSrc: "/images/products/outdoors/tent.jpg",
    rating: 4.5,
    fromPrice: 179.0,
    offerCount: 3,
  },
  {
    id: "home-demo-top-hair-dryer",
    productName: "Sleekline Ionic Hair Dryer",
    brandName: "Lumora",
    categorySlug: "beauty",
    imageSrc: "/images/products/beauty/hair-dryer.jpg",
    rating: 4.4,
    fromPrice: 64.0,
    offerCount: 4,
  },
  {
    id: "home-demo-top-backpack",
    productName: "Dayspan Commuter Backpack",
    brandName: "Kindred",
    categorySlug: "accessories",
    imageSrc: "/images/products/accessories/backpack.jpg",
    rating: 4.3,
    fromPrice: 72.0,
    offerCount: 5,
  },
];

function withDiscount(
  deal: Omit<HomepageDemoDeal, "discountPercent">,
): HomepageDemoDeal {
  const discountPercent =
    deal.previousPrice != null && deal.previousPrice > deal.currentPrice + 0.009
      ? Math.round(((deal.previousPrice - deal.currentPrice) / deal.previousPrice) * 100)
      : null;
  return { ...deal, discountPercent };
}

/** Distinct product photos for homepage Best Deals rail. */
export const HOMEPAGE_DEMO_DEALS: HomepageDemoDeal[] = [
  withDiscount({
    id: "home-demo-deal-earbuds",
    productName: "Crestline Noise-Cancelling Earbuds",
    brandName: "Alto",
    categorySlug: "electronics",
    imageSrc: "/images/home/headphones/earbuds-case.png",
    currentPrice: 79.0,
    previousPrice: 99.0,
    offerCount: 4,
  }),
  withDiscount({
    id: "home-demo-deal-air-fryer",
    productName: "Larkspur Compact Air Fryer",
    brandName: "Hearthcrest",
    categorySlug: "appliances",
    imageSrc: "/images/products/appliances/air-fryer.jpg",
    currentPrice: 69.0,
    previousPrice: 89.0,
    offerCount: 3,
  }),
  withDiscount({
    id: "home-demo-deal-coffee",
    productName: "Millhouse Single-Serve Coffee Machine",
    brandName: "Ashgrove",
    categorySlug: "kitchen",
    imageSrc: "/images/products/kitchen/coffee-machine.jpg",
    currentPrice: 54.0,
    previousPrice: 72.0,
    offerCount: 4,
  }),
  withDiscount({
    id: "home-demo-deal-sandal",
    productName: "Shoreline Everyday Sandal",
    brandName: "Trailmere",
    categorySlug: "footwear",
    imageSrc: "/images/products/footwear/sandal.jpg",
    currentPrice: 38.0,
    previousPrice: 48.0,
    offerCount: 3,
  }),
  withDiscount({
    id: "home-demo-deal-jump",
    productName: "Motora Portable Jump Starter",
    brandName: "Motora",
    categorySlug: "automotive",
    imageSrc: "/images/home/automotive/car-jump-starter.png",
    currentPrice: 89.0,
    previousPrice: 119.0,
    offerCount: 3,
  }),
  withDiscount({
    id: "home-demo-deal-cooler",
    productName: "Frostspan Soft Cooler",
    brandName: "Wildspan",
    categorySlug: "outdoors",
    imageSrc: "/images/products/outdoors/cooler.jpg",
    currentPrice: 64.0,
    previousPrice: 84.0,
    offerCount: 2,
  }),
  withDiscount({
    id: "home-demo-deal-straightener",
    productName: "Sleekline Hair Straightener",
    brandName: "Lumora",
    categorySlug: "beauty",
    imageSrc: "/images/products/beauty/hair-straightener.jpg",
    currentPrice: 42.0,
    previousPrice: 59.0,
    offerCount: 3,
  }),
  withDiscount({
    id: "home-demo-deal-lamp",
    productName: "Northglow Table Lamp",
    brandName: "Hearthcrest",
    categorySlug: "home",
    imageSrc: "/images/products/home/table-lamp.jpg",
    currentPrice: 36.0,
    previousPrice: 49.0,
    offerCount: 4,
  }),
];

export function homepageDemoBrowseHref(categorySlug: string, query?: string) {
  const params = new URLSearchParams({ category: normalizeCategorySlug(categorySlug) ?? categorySlug });
  if (query?.trim()) params.set("q", query.trim());
  return `/search?${params.toString()}`;
}

export function homepageDemoCategoryLabel(categorySlug: string) {
  return categoryLabel(categorySlug);
}
