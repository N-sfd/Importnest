import { prisma } from "@/lib/prisma";
import { minutesSince } from "@/lib/compare-view";
import { getProductDisplayImage } from "@/lib/product-images";
import type { SearchIntent } from "@/lib/search-intent";

export type ResultsSort =
  | "best_overall"
  | "lowest_cost"
  | "fastest"
  | "best_value"
  | "recently_updated"
  | "best_rated";

export type SearchResultsFilters = {
  query?: string;
  categorySlug?: string;
  brandNames?: string[];
  priceMin?: number;
  priceMax?: number;
  condition?: "new" | "open_box" | "refurbished" | "used";
  /** Only products with ≥1 approved offer */
  availableOnly?: boolean;
  /** Only products with a pickup-tagged listing */
  pickupOnly?: boolean;
  sourceId?: string;
  /** Soft preference: when false, require modelName word overlap with query */
  allowComparable?: boolean;
  savedOnly?: boolean;
  savedProductIds?: Set<string>;
  sort?: ResultsSort;
};

export type MatchKind = "exact" | "comparable";

export type ResultHighlight = "best_value" | "lowest_cost" | "fastest";

export type SearchResultProduct = {
  id: string;
  brandName: string;
  productName: string;
  modelNumber: string | null;
  categoryName: string;
  categorySlug: string;
  imageSrc: string;
  lowestTotalCost: number | null;
  offerCount: number;
  freshnessMinutesAgo: number | null;
  hasPickup: boolean;
  conditions: string[];
  /** Real seeded average rating — never fabricated at render time. */
  rating: number | null;
  /** Compact key attributes for the card (≤3) */
  attributes: { key: string; value: string; unit: string | null }[];
  sourceIds: string[];
  isSaved: boolean;
  /** Set when a text query is present */
  matchKind: MatchKind | null;
  highlights: ResultHighlight[];
  /** The specific listing backing lowestTotalCost — used to add this exact offer to cart without inventing data. Null when there are no approved offers. */
  bestListing: {
    listingId: string;
    sourceName: string;
    condition: string;
    price: number;
    shipping: number;
    fees: number;
  } | null;
};

export type SearchResultsFacetOptions = {
  categories: { slug: string; name: string; count: number }[];
  brands: { name: string; count: number }[];
  sources: { id: string; name: string; count: number }[];
  conditions: { value: string; label: string; count: number }[];
};

export type SearchResultsPayload = {
  products: SearchResultProduct[];
  total: number;
  facets: SearchResultsFacetOptions;
  applied: SearchResultsFilters;
};

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  "open-box": "Open-box",
  refurbished: "Refurbished",
  "certified-refurbished": "Refurbished",
  used: "Used",
};

/** Card-facing condition labels — prefer New / Open-box / Refurbished. */
export function conditionBadgeLabels(conditions: string[]): string[] {
  const order = ["new", "open-box", "refurbished", "certified-refurbished", "used"];
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const key of order) {
    if (!conditions.includes(key)) continue;
    const label = CONDITION_LABELS[key] ?? key;
    if (seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
    if (labels.length >= 2) break;
  }
  return labels;
}

function classifyMatchKind(input: {
  query?: string;
  words: string[];
  productName: string;
  brandName: string;
  modelNumber: string | null;
}): MatchKind | null {
  const q = input.query?.trim().toLowerCase();
  if (!q) return null;

  const name = input.productName.toLowerCase();
  const brand = input.brandName.toLowerCase();
  const model = input.modelNumber?.toLowerCase() ?? null;

  if (name === q || (model && model === q)) return "exact";
  if (model && (q.includes(model) || model.includes(q))) return "exact";
  if (q.includes(brand) && (q.includes(name) || (model != null && q.includes(model)))) {
    return "exact";
  }

  const { words } = input;
  if (words.length === 0) return "comparable";

  const inScope = (w: string) =>
    name.includes(w) || brand.includes(w) || (model != null && model.includes(w));
  if (words.every(inScope)) return "exact";

  const nameHits = words.filter((w) => name.includes(w)).length;
  if (nameHits >= Math.max(1, Math.ceil(words.length * 0.75))) return "exact";

  return "comparable";
}

function filterConditionMatches(listingCondition: string, filter: SearchResultsFilters["condition"]) {
  if (!filter) return true;
  if (filter === "open_box") return listingCondition === "open-box";
  if (filter === "refurbished") {
    return listingCondition === "refurbished" || listingCondition === "certified-refurbished";
  }
  return listingCondition === filter;
}

function significantWords(query: string): string[] {
  const stop = new Set([
    "a", "an", "the", "for", "of", "in", "on", "with", "under", "over", "to",
    "i", "need", "want", "looking", "some", "any", "this", "that", "please",
    "best", "good", "quiet",
  ]);
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
}

type ListingRow = {
  id: string;
  canonicalProductId: string | null;
  sourceId: string;
  condition: string;
  price: number;
  shipping: number;
  fees: number;
  deliveryLabel: string | null;
  freshnessCapturedAt: Date;
  source: { name: string };
};

type ProductAgg = {
  offerCount: number;
  lowestTotalCost: number;
  freshestAt: Date;
  hasPickup: boolean;
  conditions: Set<string>;
  sourceIds: Set<string>;
  bestListing: NonNullable<SearchResultProduct["bestListing"]>;
};

function buildAggs(listings: ListingRow[]): Map<string, ProductAgg> {
  const byProduct = new Map<string, ProductAgg>();
  for (const l of listings) {
    const id = l.canonicalProductId;
    if (!id) continue;
    const total = l.price + l.shipping + l.fees;
    const pickup = /pickup/i.test(l.deliveryLabel ?? "");
    const bestListing: ProductAgg["bestListing"] = {
      listingId: l.id,
      sourceName: l.source.name,
      condition: l.condition,
      price: l.price,
      shipping: l.shipping,
      fees: l.fees,
    };
    const existing = byProduct.get(id);
    if (!existing) {
      byProduct.set(id, {
        offerCount: 1,
        lowestTotalCost: total,
        freshestAt: l.freshnessCapturedAt,
        hasPickup: pickup,
        conditions: new Set([l.condition]),
        sourceIds: new Set([l.sourceId]),
        bestListing,
      });
      continue;
    }
    existing.offerCount += 1;
    if (total < existing.lowestTotalCost) {
      existing.lowestTotalCost = total;
      existing.bestListing = bestListing;
    }
    if (l.freshnessCapturedAt > existing.freshestAt) existing.freshestAt = l.freshnessCapturedAt;
    existing.hasPickup = existing.hasPickup || pickup;
    existing.conditions.add(l.condition);
    existing.sourceIds.add(l.sourceId);
  }
  return byProduct;
}

function scoreBestOverall(p: SearchResultProduct): number {
  // Prefer more offers, lower price, fresher data — no fabricated ratings.
  const priceScore = p.lowestTotalCost == null ? 0 : 1 / (1 + p.lowestTotalCost / 100);
  const offerScore = Math.min(p.offerCount, 8) / 8;
  const freshScore =
    p.freshnessMinutesAgo == null ? 0 : Math.max(0, 1 - p.freshnessMinutesAgo / (60 * 24 * 7));
  return offerScore * 0.45 + priceScore * 0.35 + freshScore * 0.2;
}

function scoreBestValue(p: SearchResultProduct): number {
  if (p.lowestTotalCost == null || p.offerCount === 0) return -1;
  // More competing offers at a given price → stronger "value" signal from real data only.
  return p.offerCount / (1 + p.lowestTotalCost / 200);
}

/**
 * Multi-product search/browse for the Idealo-style results page.
 * Only uses DB-backed fields — never invents ratings or delivery dates.
 */
export async function getSearchResults(
  filters: SearchResultsFilters,
): Promise<SearchResultsPayload> {
  const words = filters.query ? significantWords(filters.query) : [];

  const products = await prisma.canonicalProduct.findMany({
    where: {
      AND: [
        filters.categorySlug
          ? { category: { slug: filters.categorySlug } }
          : {},
        filters.brandNames?.length
          ? { brand: { name: { in: filters.brandNames, mode: "insensitive" } } }
          : {},
        words.length
          ? {
              OR: words.flatMap((w) => [
                { modelName: { contains: w, mode: "insensitive" as const } },
                { modelNumber: { contains: w, mode: "insensitive" as const } },
                { brand: { name: { contains: w, mode: "insensitive" as const } } },
                { category: { name: { contains: w, mode: "insensitive" as const } } },
              ]),
            }
          : {},
      ],
    },
    include: {
      brand: true,
      category: true,
      attributes: { take: 3, orderBy: { key: "asc" } },
    },
  });

  const listings = await prisma.listing.findMany({
    where: {
      canonicalProductId: { in: products.map((p) => p.id) },
      matches: { some: { status: "approved" } },
      ...(filters.sourceId ? { sourceId: filters.sourceId } : {}),
    },
    select: {
      id: true,
      canonicalProductId: true,
      sourceId: true,
      condition: true,
      price: true,
      shipping: true,
      fees: true,
      deliveryLabel: true,
      freshnessCapturedAt: true,
      source: { select: { name: true } },
    },
  });

  const aggs = buildAggs(listings);
  const saved = filters.savedProductIds ?? new Set<string>();

  let rows: SearchResultProduct[] = products.map((p) => {
    const agg = aggs.get(p.id);
    return {
      id: p.id,
      brandName: p.brand.name,
      productName: p.modelName,
      modelNumber: p.modelNumber,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      imageSrc: getProductDisplayImage({
        id: p.id,
        categorySlug: p.category.slug,
        title: p.modelName,
      }),
      lowestTotalCost: agg?.lowestTotalCost ?? null,
      offerCount: agg?.offerCount ?? 0,
      freshnessMinutesAgo: agg ? minutesSince(agg.freshestAt) : null,
      hasPickup: agg?.hasPickup ?? false,
      conditions: agg ? [...agg.conditions] : [],
      rating: p.averageRating,
      attributes: p.attributes.map((a) => ({
        key: a.key,
        value: a.value,
        unit: a.unit,
      })),
      sourceIds: agg ? [...agg.sourceIds] : [],
      bestListing: agg?.bestListing ?? null,
      isSaved: saved.has(p.id),
      matchKind: classifyMatchKind({
        query: filters.query,
        words,
        productName: p.modelName,
        brandName: p.brand.name,
        modelNumber: p.modelNumber,
      }),
      highlights: [],
    };
  });

  // Facets from pre-filter universe (current query/category scope), then apply product filters
  const facetBase = rows;

  if (filters.availableOnly) {
    rows = rows.filter((p) => p.offerCount > 0);
  }
  if (filters.pickupOnly) {
    rows = rows.filter((p) => p.hasPickup);
  }
  if (filters.priceMin != null) {
    rows = rows.filter((p) => p.lowestTotalCost != null && p.lowestTotalCost >= filters.priceMin!);
  }
  if (filters.priceMax != null) {
    rows = rows.filter((p) => p.lowestTotalCost != null && p.lowestTotalCost <= filters.priceMax!);
  }
  if (filters.condition) {
    rows = rows.filter((p) =>
      p.conditions.some((c) => filterConditionMatches(c, filters.condition)),
    );
  }
  if (filters.savedOnly) {
    rows = rows.filter((p) => p.isSaved);
  }
  if (filters.allowComparable === false && words.length) {
    // Stricter: model name must contain at least half of query words
    const need = Math.max(1, Math.ceil(words.length / 2));
    rows = rows.filter((p) => {
      const name = p.productName.toLowerCase();
      return words.filter((w) => name.includes(w)).length >= need;
    });
  }

  // Rank badges from real offers only — at most one product per highlight.
  const priced = rows.filter((p) => p.lowestTotalCost != null && p.offerCount > 0);
  let lowestCostId: string | null = null;
  let bestValueId: string | null = null;
  let fastestId: string | null = null;
  if (priced.length) {
    lowestCostId = [...priced].sort(
      (a, b) => (a.lowestTotalCost ?? 0) - (b.lowestTotalCost ?? 0),
    )[0]?.id ?? null;
    bestValueId = [...priced].sort((a, b) => scoreBestValue(b) - scoreBestValue(a))[0]?.id ?? null;
    fastestId =
      [...priced].sort(
        (a, b) =>
          Number(b.hasPickup) - Number(a.hasPickup) ||
          (a.lowestTotalCost ?? 1e12) - (b.lowestTotalCost ?? 1e12),
      )[0]?.id ?? null;
  }
  rows = rows.map((p) => {
    const highlights: ResultHighlight[] = [];
    if (p.id === bestValueId) highlights.push("best_value");
    if (p.id === lowestCostId) highlights.push("lowest_cost");
    if (p.id === fastestId && p.hasPickup) highlights.push("fastest");
    return { ...p, highlights };
  });

  const sort = filters.sort ?? "best_overall";
  rows = [...rows].sort((a, b) => {
    // Exact matches first when searching, then the chosen sort.
    if (filters.query) {
      const am = a.matchKind === "exact" ? 0 : 1;
      const bm = b.matchKind === "exact" ? 0 : 1;
      if (am !== bm) return am - bm;
    }
    switch (sort) {
      case "lowest_cost": {
        if (a.lowestTotalCost == null && b.lowestTotalCost == null) return 0;
        if (a.lowestTotalCost == null) return 1;
        if (b.lowestTotalCost == null) return -1;
        return a.lowestTotalCost - b.lowestTotalCost;
      }
      case "fastest":
        return Number(b.hasPickup) - Number(a.hasPickup) || (a.lowestTotalCost ?? 1e12) - (b.lowestTotalCost ?? 1e12);
      case "best_value":
        return scoreBestValue(b) - scoreBestValue(a);
      case "recently_updated": {
        const af = a.freshnessMinutesAgo ?? 1e9;
        const bf = b.freshnessMinutesAgo ?? 1e9;
        return af - bf;
      }
      case "best_rated": {
        if (a.rating == null && b.rating == null) return 0;
        if (a.rating == null) return 1;
        if (b.rating == null) return -1;
        return b.rating - a.rating;
      }
      case "best_overall":
      default:
        return scoreBestOverall(b) - scoreBestOverall(a);
    }
  });

  // Facet counts from products matching query/category before facet click-narrowing
  // (simpler & honest: count within currently returned filtered set after availability gate)
  const facetRows = facetBase.filter((p) => !filters.availableOnly || p.offerCount > 0);

  const categoryCount = new Map<string, { name: string; count: number }>();
  const brandCount = new Map<string, number>();
  const conditionCount = new Map<string, number>();
  const sourceProductCount = new Map<string, number>();

  for (const p of facetRows) {
    const cat = categoryCount.get(p.categorySlug) ?? { name: p.categoryName, count: 0 };
    cat.count += 1;
    categoryCount.set(p.categorySlug, cat);
    brandCount.set(p.brandName, (brandCount.get(p.brandName) ?? 0) + 1);
    for (const c of p.conditions) {
      conditionCount.set(c, (conditionCount.get(c) ?? 0) + 1);
    }
    for (const s of p.sourceIds) {
      sourceProductCount.set(s, (sourceProductCount.get(s) ?? 0) + 1);
    }
  }

  const sources = await prisma.source.findMany({
    where: { id: { in: [...sourceProductCount.keys()] } },
    select: { id: true, name: true },
  });
  const sourceName = new Map(sources.map((s) => [s.id, s.name]));

  const facets: SearchResultsFacetOptions = {
    categories: [...categoryCount.entries()]
      .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count),
    brands: [...brandCount.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    sources: [...sourceProductCount.entries()]
      .map(([id, count]) => ({ id, name: sourceName.get(id) ?? id, count }))
      .sort((a, b) => b.count - a.count),
    conditions: [...conditionCount.entries()]
      .map(([value, count]) => ({
        value,
        label: CONDITION_LABELS[value] ?? value.replace(/-/g, " "),
        count,
      }))
      .sort((a, b) => b.count - a.count),
  };

  return {
    products: rows,
    total: rows.length,
    facets,
    applied: filters,
  };
}

/**
 * Splits a results list into exact matches and comparable alternatives —
 * `getSearchResults` already sorts exact matches first, but callers that
 * want to render them as two clearly separate groups (never interleaved
 * under one undifferentiated heading) need the split itself.
 */
export function partitionByMatchKind(products: SearchResultProduct[]): {
  exact: SearchResultProduct[];
  comparable: SearchResultProduct[];
} {
  const exact: SearchResultProduct[] = [];
  const comparable: SearchResultProduct[] = [];
  for (const p of products) {
    if (p.matchKind === "comparable") comparable.push(p);
    else exact.push(p);
  }
  return { exact, comparable };
}

export function intentToResultsFilters(
  intent: Partial<SearchIntent>,
  extras: Partial<SearchResultsFilters> = {},
): SearchResultsFilters {
  return {
    query: intent.query,
    categorySlug: extras.categorySlug ?? intent.category,
    brandNames: extras.brandNames ?? intent.preferredBrands,
    priceMax: extras.priceMax ?? intent.budgetMax,
    priceMin: extras.priceMin,
    condition:
      intent.condition && intent.condition !== "any"
        ? intent.condition
        : extras.condition,
    availableOnly: extras.availableOnly ?? true,
    pickupOnly: extras.pickupOnly,
    sourceId: extras.sourceId,
    allowComparable: extras.allowComparable ?? intent.allowComparableAlternatives !== false,
    savedOnly: extras.savedOnly,
    savedProductIds: extras.savedProductIds,
    sort: extras.sort ?? mapIntentSort(intent.sortPriority),
  };
}

function mapIntentSort(priority: SearchIntent["sortPriority"]): ResultsSort {
  switch (priority) {
    case "lowest_cost":
      return "lowest_cost";
    case "fastest_delivery":
      return "fastest";
    case "best_warranty":
      return "best_value";
    case "best_overall":
    default:
      return "best_overall";
  }
}

export const RESULTS_SORT_OPTIONS: { value: ResultsSort; label: string }[] = [
  { value: "best_overall", label: "Best overall" },
  { value: "lowest_cost", label: "Lowest total cost" },
  { value: "fastest", label: "Fastest available" },
  { value: "best_value", label: "Best value" },
  { value: "best_rated", label: "Best rated" },
  { value: "recently_updated", label: "Recently updated" },
];
