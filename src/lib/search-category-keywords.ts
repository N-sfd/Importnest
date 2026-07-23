/**
 * Keyword → department mapping for the clarify page's category suggestions.
 * Deliberately a plain lookup table (same "regex over NLU" philosophy as
 * search-intent.ts) — the catalog and vocabulary are small enough that a
 * curated list beats a stemmer or fuzzy matcher, and it stays auditable.
 *
 * A keyword maps to more than one slug only when the term is genuinely
 * ambiguous across real departments (e.g. "diffuser" could be a home
 * essential-oil diffuser or a beauty hair diffuser) — never as a hedge.
 */

export type CategorySuggestion = {
  /** Category key as used by category-visuals.ts (categoryDisplayTitle, categoryImageSrc, etc.). */
  slug: string;
  /** Subcategory chip labels shown under this department for the matched term. */
  chips: string[];
};

const KEYWORD_CATEGORIES: Record<string, CategorySuggestion[]> = {
  bowl: [{ slug: "kitchen", chips: ["Dinnerware", "Cookware", "Food storage", "Serving bowls"] }],
  bowls: [{ slug: "kitchen", chips: ["Dinnerware", "Cookware", "Food storage", "Serving bowls"] }],
  plate: [{ slug: "kitchen", chips: ["Dinnerware", "Serving sets"] }],
  plates: [{ slug: "kitchen", chips: ["Dinnerware", "Serving sets"] }],
  dinnerware: [{ slug: "kitchen", chips: ["Dinnerware", "Serving sets"] }],
  mug: [{ slug: "kitchen", chips: ["Drinkware", "Coffee & tea"] }],
  mugs: [{ slug: "kitchen", chips: ["Drinkware", "Coffee & tea"] }],
  cup: [{ slug: "kitchen", chips: ["Drinkware", "Coffee & tea"] }],
  cups: [{ slug: "kitchen", chips: ["Drinkware", "Coffee & tea"] }],
  glassware: [{ slug: "kitchen", chips: ["Drinkware"] }],
  pan: [{ slug: "kitchen", chips: ["Cookware", "Bakeware"] }],
  pans: [{ slug: "kitchen", chips: ["Cookware", "Bakeware"] }],
  skillet: [{ slug: "kitchen", chips: ["Cookware"] }],
  pot: [{ slug: "kitchen", chips: ["Cookware"] }],
  pots: [{ slug: "kitchen", chips: ["Cookware"] }],
  cookware: [{ slug: "kitchen", chips: ["Cookware", "Bakeware"] }],
  bakeware: [{ slug: "kitchen", chips: ["Bakeware"] }],
  knife: [{ slug: "kitchen", chips: ["Knives", "Cutlery"] }],
  knives: [{ slug: "kitchen", chips: ["Knives", "Cutlery"] }],
  cutlery: [{ slug: "kitchen", chips: ["Knives", "Cutlery"] }],
  utensil: [{ slug: "kitchen", chips: ["Utensils", "Cutlery"] }],
  utensils: [{ slug: "kitchen", chips: ["Utensils", "Cutlery"] }],
  charger: [
    { slug: "electronics", chips: ["Chargers", "Cables"] },
    { slug: "accessories", chips: ["Chargers", "Cases"] },
  ],
  chargers: [
    { slug: "electronics", chips: ["Chargers", "Cables"] },
    { slug: "accessories", chips: ["Chargers", "Cases"] },
  ],
  headphones: [{ slug: "electronics", chips: ["Audio", "Headphones"] }],
  earbuds: [{ slug: "electronics", chips: ["Audio", "Headphones"] }],
  speaker: [{ slug: "electronics", chips: ["Audio", "Speakers"] }],
  speakers: [{ slug: "electronics", chips: ["Audio", "Speakers"] }],
  shoe: [{ slug: "footwear", chips: ["Sneakers", "Boots", "Sandals"] }],
  shoes: [{ slug: "footwear", chips: ["Sneakers", "Boots", "Sandals"] }],
  sneaker: [{ slug: "footwear", chips: ["Sneakers"] }],
  sneakers: [{ slug: "footwear", chips: ["Sneakers"] }],
  boots: [{ slug: "footwear", chips: ["Boots"] }],
  sandals: [{ slug: "footwear", chips: ["Sandals"] }],
  dishwasher: [{ slug: "appliances", chips: ["Dishwashers"] }],
  dishwashers: [{ slug: "appliances", chips: ["Dishwashers"] }],
  refrigerator: [{ slug: "appliances", chips: ["Refrigerators"] }],
  fridge: [{ slug: "appliances", chips: ["Refrigerators"] }],
  microwave: [{ slug: "appliances", chips: ["Microwaves"] }],
  vacuum: [{ slug: "appliances", chips: ["Vacuums"] }],
  // Both a home essential-oil diffuser and a beauty hair diffuser are
  // plausible readings — surface both departments rather than guessing.
  diffuser: [
    { slug: "home", chips: ["Essential oil diffusers"] },
    { slug: "beauty", chips: ["Hair diffusers"] },
  ],
  diffusers: [
    { slug: "home", chips: ["Essential oil diffusers"] },
    { slug: "beauty", chips: ["Hair diffusers"] },
  ],
  mirror: [
    { slug: "beauty", chips: ["Vanity mirrors"] },
    { slug: "home", chips: ["Wall mirrors"] },
  ],
  mirrors: [
    { slug: "beauty", chips: ["Vanity mirrors"] },
    { slug: "home", chips: ["Wall mirrors"] },
  ],
  lighting: [{ slug: "home", chips: ["Lighting"] }],
  lamp: [{ slug: "home", chips: ["Lighting"] }],
  storage: [{ slug: "home", chips: ["Storage"] }],
  bag: [{ slug: "accessories", chips: ["Bags"] }],
  bags: [{ slug: "accessories", chips: ["Bags"] }],
  wallet: [{ slug: "accessories", chips: ["Wallets"] }],
  case: [{ slug: "accessories", chips: ["Cases"] }],
  cases: [{ slug: "accessories", chips: ["Cases"] }],
};

/**
 * Query-aware department suggestions for the clarify page — merges every
 * matched keyword's departments, deduping by slug and combining their chips.
 * Order reflects first appearance in the query so the most literally-matched
 * department leads. Returns [] when nothing in the query is a recognized
 * shopping term — callers fall back to the generic department list.
 */
export function suggestedCategoriesForQuery(query: string): CategorySuggestion[] {
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const bySlug = new Map<string, CategorySuggestion>();
  for (const word of words) {
    const matches = KEYWORD_CATEGORIES[word];
    if (!matches) continue;
    for (const match of matches) {
      const existing = bySlug.get(match.slug);
      if (existing) {
        for (const chip of match.chips) {
          if (!existing.chips.includes(chip)) existing.chips.push(chip);
        }
      } else {
        bySlug.set(match.slug, { slug: match.slug, chips: [...match.chips] });
      }
    }
  }
  return [...bySlug.values()];
}
