/**
 * IMPORTANT:
 * This file is homepage demo data only.
 * Do not use it as live retailer data.
 * Do not use these prices for production ranking.
 * Real comparison pages must use stored listings, approved source data, and PriceHistory records.
 *
 * Suggested image folders:
 * - public/images/home/top-products/
 * - public/images/home/deals/
 * - public/images/home/categories/
 * - public/images/home/automotive/
 * - public/images/home/headphones/
 * - public/images/home/outdoors/
 *
 * Headphones / AirBuds assets:
 * - /images/home/headphones/airbuds-pro-3.png
 * - /images/home/headphones/overear.png
 * - /images/home/headphones/earbuds-case.png
 * - /images/home/top-products/airbuds-pro-3.png
 *
 * Automotive assets:
 * - /images/home/automotive/car-usb-charger.png
 * - /images/home/automotive/car-phone-mount.png
 * - /images/home/automotive/car-jump-starter.png
 */

export type DemoProduct = {
  id: string;
  title: string;
  brand: string;
  category: string;
  subtitle: string;
  image: string;
  badge?: "Bestseller" | "Popular" | "Top rated" | "Best value" | "Deal";
  avgScore?: number;
  reviewCount?: number;
  fromPrice?: number;
  previousPrice?: number;
  discountPercent?: number;
  offerCount?: number;
  sourceCount?: number;
  lastCheckedLabel?: string;
  condition?: "New" | "Open-box" | "Refurbished" | "Used";
  href?: string;
};

export const topProducts: DemoProduct[] = [
  {
    id: "tp-airbuds-pro-3",
    title: "AirBuds Pro 3 Wireless Earbuds",
    brand: "SoundNest",
    category: "Headphones",
    subtitle: "Noise cancelling Bluetooth earbuds",
    image: "/images/home/top-products/airbuds-pro-3.png",
    badge: "Bestseller",
    avgScore: 92,
    reviewCount: 10,
    fromPrice: 157.99,
    offerCount: 5,
    sourceCount: 3,
    lastCheckedLabel: "Checked 12 minutes ago",
    condition: "New",
    href: "/compare/demo-airbuds-pro-3",
  },
  {
    id: "tp-ipad-style-tablet",
    title: "AeroTab 11 Tablet 128GB WiFi",
    brand: "AeroTech",
    category: "Tablets",
    subtitle: "Lightweight tablet for study and work",
    image: "/images/home/top-products/aerotab-11.png",
    badge: "Popular",
    avgScore: 89,
    reviewCount: 8,
    fromPrice: 341.99,
    offerCount: 4,
    sourceCount: 2,
    lastCheckedLabel: "Checked 25 minutes ago",
    condition: "New",
    href: "/compare/demo-aerotab-11",
  },
  {
    id: "tp-galaxy-style-phone",
    title: "NovaMax S26 Ultra 256GB",
    brand: "NovaMobile",
    category: "5G Mobile Phones",
    subtitle: "Large-screen 5G phone with pro camera",
    image: "/images/home/top-products/novamax-s26-ultra.png",
    badge: "Top rated",
    avgScore: 87,
    reviewCount: 6,
    fromPrice: 683.99,
    offerCount: 6,
    sourceCount: 4,
    lastCheckedLabel: "Checked 18 minutes ago",
    condition: "New",
    href: "/compare/demo-novamax-s26-ultra",
  },
  {
    id: "tp-dishwasher-quietwash",
    title: "QuietWash 500 Dishwasher",
    brand: "Apex Home",
    category: "Appliances",
    subtitle: "Quiet dishwasher with stainless interior",
    image: "/images/home/top-products/quietwash-500.png",
    badge: "Best value",
    avgScore: 91,
    reviewCount: 12,
    fromPrice: 879.99,
    offerCount: 4,
    sourceCount: 3,
    lastCheckedLabel: "Checked 1 hour ago",
    condition: "New",
    href: "/compare/cp-apex-ah4200",
  },
];

export const outdoorsProducts: DemoProduct[] = [
  {
    id: "outdoor-college-backpack",
    title: "TrailNest Everyday Backpack",
    brand: "TrailNest",
    category: "Leisure & Outdoors",
    subtitle: "Lightweight backpack for college, travel, and daily use",
    image: "/images/home/outdoors/trailnest-backpack.png",
    badge: "Popular",
    avgScore: 89,
    reviewCount: 11,
    fromPrice: 64.99,
    offerCount: 4,
    sourceCount: 3,
    lastCheckedLabel: "Checked 22 minutes ago",
    condition: "New",
    href: "/compare/demo-trailnest-backpack",
  },
  {
    id: "outdoor-camping-lantern",
    title: "CampBright Rechargeable Lantern",
    brand: "CampBright",
    category: "Leisure & Outdoors",
    subtitle: "USB-C rechargeable lantern for camping and emergencies",
    image: "/images/home/outdoors/campbright-lantern.png",
    badge: "Best value",
    fromPrice: 29.99,
    previousPrice: 39.99,
    discountPercent: 25,
    offerCount: 5,
    sourceCount: 3,
    lastCheckedLabel: "Checked 1 hour ago",
    condition: "New",
    href: "/compare/demo-campbright-lantern",
  },
  {
    id: "outdoor-travel-cooler",
    title: "CoolTrail 24L Travel Cooler",
    brand: "CoolTrail",
    category: "Leisure & Outdoors",
    subtitle: "Portable cooler for picnics, road trips, and outdoor events",
    image: "/images/home/outdoors/cooltrail-cooler.png",
    badge: "Top rated",
    avgScore: 91,
    reviewCount: 8,
    fromPrice: 49.99,
    offerCount: 3,
    sourceCount: 2,
    lastCheckedLabel: "Checked 2 hours ago",
    condition: "New",
    href: "/compare/demo-cooltrail-cooler",
  },
];

export const headphonesProducts: DemoProduct[] = [
  {
    id: "hp-airbuds-pro-3",
    title: "AirBuds Pro 3 Wireless Earbuds",
    brand: "SoundNest",
    category: "Headphones",
    subtitle: "Noise cancelling Bluetooth earbuds with charging case",
    image: "/images/home/headphones/airbuds-pro-3.png",
    badge: "Bestseller",
    avgScore: 92,
    reviewCount: 10,
    fromPrice: 157.99,
    offerCount: 5,
    sourceCount: 3,
    lastCheckedLabel: "Checked 12 minutes ago",
    condition: "New",
    href: "/compare/demo-airbuds-pro-3",
  },
  {
    id: "hp-overear-studio",
    title: "SoundNest Studio Over-Ear Headphones",
    brand: "SoundNest",
    category: "Headphones",
    subtitle: "Wireless over-ear headphones for travel and focus",
    image: "/images/home/headphones/overear.png",
    badge: "Popular",
    avgScore: 88,
    reviewCount: 9,
    fromPrice: 129.99,
    offerCount: 4,
    sourceCount: 3,
    lastCheckedLabel: "Checked 40 minutes ago",
    condition: "New",
    href: "/compare/demo-soundnest-overear",
  },
  {
    id: "hp-earbuds-case",
    title: "PulseBuds Compact Wireless Earbuds",
    brand: "PulseAudio",
    category: "Headphones",
    subtitle: "Everyday earbuds with a compact charging case",
    image: "/images/home/headphones/earbuds-case.png",
    badge: "Best value",
    fromPrice: 49.99,
    previousPrice: 69.99,
    discountPercent: 29,
    offerCount: 6,
    sourceCount: 4,
    lastCheckedLabel: "Checked 1 hour ago",
    condition: "New",
    href: "/compare/demo-pulsebuds",
  },
];

export const automotiveProducts: DemoProduct[] = [
  {
    id: "auto-usb-charger",
    title: "DriveCharge Dual USB-C Car Charger",
    brand: "DriveCharge",
    category: "Automotive",
    subtitle: "Fast dual-port USB-C charger for the car",
    image: "/images/home/automotive/car-usb-charger.png",
    badge: "Popular",
    avgScore: 90,
    reviewCount: 14,
    fromPrice: 24.99,
    offerCount: 5,
    sourceCount: 3,
    lastCheckedLabel: "Checked 15 minutes ago",
    condition: "New",
    href: "/compare/demo-drivecharge-usb-c",
  },
  {
    id: "auto-phone-mount",
    title: "GripMount Magnetic Car Phone Mount",
    brand: "GripMount",
    category: "Automotive",
    subtitle: "Dash and vent phone mount for navigation",
    image: "/images/home/automotive/car-phone-mount.png",
    badge: "Best value",
    fromPrice: 19.99,
    previousPrice: 29.99,
    discountPercent: 33,
    offerCount: 4,
    sourceCount: 3,
    lastCheckedLabel: "Checked 35 minutes ago",
    condition: "New",
    href: "/compare/demo-gripmount",
  },
  {
    id: "auto-jump-starter",
    title: "RoadReady Portable Jump Starter",
    brand: "RoadReady",
    category: "Automotive",
    subtitle: "Compact jump starter power bank for emergencies",
    image: "/images/home/automotive/car-jump-starter.png",
    badge: "Top rated",
    avgScore: 91,
    reviewCount: 7,
    fromPrice: 79.99,
    offerCount: 3,
    sourceCount: 2,
    lastCheckedLabel: "Checked 2 hours ago",
    condition: "New",
    href: "/compare/demo-roadready-jump",
  },
];
