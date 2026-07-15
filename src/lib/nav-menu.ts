/** Marketplace-style department menu (Idealo / Amazon / Google Shopping pattern). */

export type NavLink = {
  label: string;
  href: string;
  /** Highlight like Amazon "Today's Deals" */
  featured?: boolean;
};

export type NavDepartment = {
  id: string;
  name: string;
  href: string;
  items: NavLink[];
};

/**
 * Top strip — Home first.
 * Phones / Computers / Audio are NOT separate top-level items; they live under Electronics
 * (Idealo-style: https://www.idealo.co.uk/pcat/30311/electronics.html).
 */
export const topNavLinks: NavLink[] = [
  { label: "Home", href: "/search?category=home" },
  { label: "Electronics", href: "/search?category=electronics" },
  { label: "Appliances", href: "/search?category=appliances" },
  { label: "Kitchen", href: "/search?q=kitchen&category=appliances" },
  { label: "Footwear", href: "/search?category=footwear" },
  { label: "Beauty", href: "/search?category=beauty-devices" },
  { label: "Accessories", href: "/search?category=accessories" },
  { label: "Today's deals", href: "/search?q=deals", featured: true },
  { label: "Compare demo", href: "/compare/cp-apex-ah4200", featured: true },
];

/** Full "All" department flyout — Home first; Electronics nests phones/computers/audio. */
export const navDepartments: NavDepartment[] = [
  {
    id: "home",
    name: "Home & garden",
    href: "/search?category=home",
    items: [
      { label: "Air purifiers", href: "/search?q=air+purifier&category=home" },
      { label: "Smart home", href: "/search?q=smart+home&category=home" },
      { label: "Furniture", href: "/search?q=furniture&category=home" },
      { label: "Lighting", href: "/search?q=lighting&category=home" },
      { label: "Tools & DIY", href: "/search?q=tools&category=home" },
    ],
  },
  {
    id: "electronics",
    name: "Electronics",
    href: "/search?category=electronics",
    items: [
      // Telecommunications (Idealo)
      { label: "Mobile phones", href: "/search?q=phone&category=electronics" },
      { label: "Tablets", href: "/search?q=tablet&category=electronics" },
      { label: "Smart watches", href: "/search?q=smartwatch&category=electronics" },
      // Computing (Idealo)
      { label: "Laptops", href: "/search?q=laptop&category=electronics" },
      { label: "Desktop PCs", href: "/search?q=desktop&category=electronics" },
      { label: "Computer hardware", href: "/search?q=computer+hardware&category=electronics" },
      { label: "Monitors", href: "/search?q=monitor&category=electronics" },
      // Audio & TV (Idealo)
      { label: "Headphones", href: "/search?q=headphones&category=electronics" },
      { label: "Home audio & HiFi", href: "/search?q=speakers&category=electronics" },
      { label: "TVs", href: "/search?q=tv&category=electronics" },
      { label: "Cameras", href: "/search?q=camera&category=electronics" },
      { label: "Gaming", href: "/search?q=gaming&category=electronics" },
    ],
  },
  {
    id: "appliances",
    name: "Appliances",
    href: "/search?category=appliances",
    items: [
      { label: "Dishwashers", href: "/search?q=dishwasher&category=appliances" },
      { label: "Vacuums", href: "/search?q=vacuum&category=appliances" },
      { label: "Washers & dryers", href: "/search?q=washer&category=appliances" },
      { label: "Refrigerators", href: "/search?q=refrigerator&category=appliances" },
      { label: "Kitchen appliances", href: "/search?q=kitchen&category=appliances" },
      { label: "Air conditioners", href: "/search?q=air+conditioner&category=appliances" },
    ],
  },
  {
    id: "footwear",
    name: "Fashion & footwear",
    href: "/search?category=footwear",
    items: [
      { label: "Running shoes", href: "/search?q=running+shoe&category=footwear" },
      { label: "Sneakers", href: "/search?q=sneakers&category=footwear" },
      { label: "Outdoor boots", href: "/search?q=boots&category=footwear" },
      { label: "Kids shoes", href: "/search?q=kids+shoes&category=footwear" },
    ],
  },
  {
    id: "beauty",
    name: "Beauty & personal care",
    href: "/search?category=beauty-devices",
    items: [
      { label: "Hair dryers", href: "/search?q=hair+dryer&category=beauty-devices" },
      { label: "Electric shavers", href: "/search?q=shaver&category=beauty-devices" },
      { label: "Skincare devices", href: "/search?q=skincare&category=beauty-devices" },
    ],
  },
  {
    id: "accessories",
    name: "Accessories",
    href: "/search?category=accessories",
    items: [
      { label: "Phone cases", href: "/search?q=phone+case&category=accessories" },
      { label: "Chargers & cables", href: "/search?q=charger&category=accessories" },
      { label: "Bags & backpacks", href: "/search?q=backpack&category=accessories" },
    ],
  },
];

/** Account / utility rail — Amazon-style secondary actions. */
export const utilityLinks: NavLink[] = [
  { label: "Saved lists", href: "/saved" },
  { label: "Price alerts", href: "/saved" },
  { label: "Best overall demo", href: "/compare/cp-apex-ah4200" },
  { label: "Admin review", href: "/admin/match-review" },
];
