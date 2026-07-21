/**
 * Category-specific facet keys and card intent — only shown when real
 * ProductAttribute rows exist for those keys in the result set.
 */

export type CategoryFacetDef = {
  /** ProductAttribute.key (case-insensitive match) */
  key: string;
  /** URL query param, e.g. attr_power → Power source */
  param: string;
  label: string;
  /** Render as color swatches when values look like colors */
  swatch?: boolean;
};

export type CategoryFacetProfile = {
  slug: string;
  facets: CategoryFacetDef[];
  /** Prefer list view for spec-heavy categories */
  preferListView?: boolean;
};

const PROFILES: CategoryFacetProfile[] = [
  {
    slug: "automotive",
    preferListView: true,
    facets: [
      { key: "Vehicle fitment", param: "attr_fitment", label: "Vehicle fitment" },
      { key: "Installation required", param: "attr_install", label: "Installation required" },
      { key: "Shipping weight", param: "attr_ship_weight", label: "Shipping weight" },
    ],
  },
  {
    slug: "beauty-devices",
    facets: [
      { key: "Material", param: "attr_material", label: "Material / finish" },
      { key: "Finish", param: "attr_finish", label: "Finish" },
      { key: "Power source", param: "attr_power", label: "Power source" },
      { key: "Hair type", param: "attr_hair", label: "Hair type" },
      { key: "Skin type", param: "attr_skin", label: "Skin type" },
      { key: "Certification", param: "attr_cert", label: "Certification" },
    ],
  },
  {
    slug: "beauty",
    facets: [
      { key: "Material", param: "attr_material", label: "Material / finish" },
      { key: "Power source", param: "attr_power", label: "Power source" },
      { key: "Hair type", param: "attr_hair", label: "Hair type" },
      { key: "Skin type", param: "attr_skin", label: "Skin type" },
      { key: "Certification", param: "attr_cert", label: "Certification" },
    ],
  },
  {
    slug: "outdoors",
    preferListView: true,
    facets: [
      { key: "Water resistance", param: "attr_water", label: "Weather / IPX rating" },
      { key: "Weight", param: "attr_weight", label: "Weight / portability" },
      { key: "Activity type", param: "attr_activity", label: "Activity type" },
    ],
  },
  {
    slug: "accessories",
    facets: [
      { key: "Color", param: "attr_color", label: "Color", swatch: true },
      { key: "Material", param: "attr_material", label: "Material / finish" },
      { key: "Finish", param: "attr_finish", label: "Finish", swatch: true },
      { key: "Power source", param: "attr_power", label: "Power source" },
    ],
  },
  {
    slug: "electronics",
    facets: [
      { key: "Screen size", param: "attr_screen", label: "Screen size" },
      { key: "Color", param: "attr_color", label: "Color", swatch: true },
    ],
  },
  {
    slug: "appliances",
    facets: [
      { key: "Capacity", param: "attr_capacity", label: "Capacity" },
      { key: "Color", param: "attr_color", label: "Color", swatch: true },
      { key: "Finish", param: "attr_finish", label: "Finish", swatch: true },
      { key: "Energy rating", param: "attr_energy", label: "Energy rating" },
    ],
  },
];

export function categoryFacetProfile(slug: string | null | undefined): CategoryFacetProfile | null {
  if (!slug) return null;
  const key = slug === "beauty" ? "beauty-devices" : slug;
  return PROFILES.find((p) => p.slug === key || p.slug === slug) ?? null;
}

export function allCategoryFacetParams(): string[] {
  const set = new Set<string>();
  for (const p of PROFILES) {
    for (const f of p.facets) set.add(f.param);
  }
  return [...set];
}

/** Parse attr_* query params into attribute filters keyed by ProductAttribute.key. */
export function attributeFiltersFromParams(
  params: Record<string, string | undefined>,
  categorySlug?: string | null,
): Record<string, string> {
  const profile = categoryFacetProfile(categorySlug);
  const out: Record<string, string> = {};
  if (!profile) return out;
  for (const facet of profile.facets) {
    const raw = params[facet.param]?.trim();
    if (raw) out[facet.key] = raw;
  }
  return out;
}
