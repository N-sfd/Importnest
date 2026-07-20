import Link from "next/link";
import { ProductCard, type ProductCardBadge } from "@/components/ProductCard";
import {
  conditionBadgeLabels,
  type ResultHighlight,
  type SearchResultProduct,
  type SearchResultsFacetOptions,
} from "@/lib/search-results";

export type ResultsPageParams = {
  q?: string;
  category?: string;
  brand?: string;
  priceMin?: string;
  priceMax?: string;
  condition?: string;
  available?: string;
  pickup?: string;
  source?: string;
  comparable?: string;
  saved?: string;
  sort?: string;
  budgetMax?: string;
  deliveryBy?: string;
  priority?: string;
  alt?: string;
  brands?: string;
};

const HIGHLIGHT_LABELS: Record<ResultHighlight, string> = {
  best_value: "Best value",
  lowest_cost: "Lowest cost",
  fastest: "Fastest available",
};

function searchResultBadge(product: SearchResultProduct): ProductCardBadge | null {
  if (product.highlights.includes("lowest_cost")) return "Best deal";
  if (product.highlights.includes("best_value")) return "Featured";
  if (product.matchKind === "exact") return "Featured";
  if (product.offerCount >= 3) return "Popular";
  return null;
}

function searchResultSubtitle(product: SearchResultProduct): string | null {
  if (product.attributes.length > 0) {
    return product.attributes
      .map((a) => `${a.key} ${a.value}${a.unit ? ` ${a.unit}` : ""}`)
      .join(" · ");
  }
  if (product.modelNumber) return `Model ${product.modelNumber}`;
  return product.categoryName || null;
}


export function countActiveResultFilters(params: ResultsPageParams): number {
  let n = 0;
  if (params.category) n += 1;
  if (params.brand || (params.brands && params.brands !== "any")) n += 1;
  if (params.priceMin) n += 1;
  if (params.priceMax || params.budgetMax) n += 1;
  if (params.condition) n += 1;
  if (params.available === "0") n += 1;
  if (params.pickup === "1") n += 1;
  if (params.source) n += 1;
  if (params.comparable === "0" || params.alt === "exact") n += 1;
  if (params.saved === "1") n += 1;
  return n;
}

function FilterFormFields({
  params,
  facets,
}: {
  params: ResultsPageParams;
  facets: SearchResultsFacetOptions;
}) {
  return (
    <>
      {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
      {params.deliveryBy ? (
        <input type="hidden" name="deliveryBy" value={params.deliveryBy} />
      ) : null}
      {params.priority ? <input type="hidden" name="priority" value={params.priority} /> : null}
      {params.brands && !params.brand ? (
        <input type="hidden" name="brands" value={params.brands} />
      ) : null}
      {params.budgetMax && !params.priceMax ? (
        <input type="hidden" name="budgetMax" value={params.budgetMax} />
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">Category</legend>
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
        >
          <option value="">All categories</option>
          {facets.categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">Brand</legend>
        <select
          name="brand"
          defaultValue={params.brand ?? params.brands ?? ""}
          className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
        >
          <option value="">All brands</option>
          {facets.brands.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name} ({b.count})
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">Price range</legend>
        <div className="flex gap-2">
          <input
            type="number"
            name="priceMin"
            min={0}
            step="1"
            placeholder="Min"
            aria-label="Minimum price"
            defaultValue={params.priceMin ?? ""}
            className="w-full rounded-lg border border-border px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
          />
          <input
            type="number"
            name="priceMax"
            min={0}
            step="1"
            placeholder="Max"
            aria-label="Maximum price"
            defaultValue={params.priceMax ?? params.budgetMax ?? ""}
            className="w-full rounded-lg border border-border px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">Condition</legend>
        <select
          name="condition"
          defaultValue={params.condition ?? ""}
          className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
        >
          <option value="">Any condition</option>
          <option value="new">New</option>
          <option value="open_box">Open box</option>
          <option value="refurbished">Refurbished</option>
          <option value="used">Used</option>
        </select>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">
          Availability
        </legend>
        <select
          name="available"
          defaultValue={params.available === "0" ? "0" : "1"}
          className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
        >
          <option value="1">Has offers</option>
          <option value="0">Include without offers</option>
        </select>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">Pickup</legend>
        <select
          name="pickup"
          defaultValue={params.pickup === "1" ? "1" : "0"}
          className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
        >
          <option value="0">Any fulfillment</option>
          <option value="1">Pickup available</option>
        </select>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">
          Retailer / source
        </legend>
        <select
          name="source"
          defaultValue={params.source ?? ""}
          className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
        >
          <option value="">All sources</option>
          {facets.sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">
          Comparable alternatives
        </legend>
        <select
          name="comparable"
          defaultValue={params.comparable === "0" || params.alt === "exact" ? "0" : "1"}
          className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
        >
          <option value="1">Include comparable matches</option>
          <option value="0">Stricter name matches</option>
        </select>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">Saved only</legend>
        <select
          name="saved"
          defaultValue={params.saved === "1" ? "1" : "0"}
          className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
        >
          <option value="0">All products</option>
          <option value="1">Saved products only</option>
        </select>
      </fieldset>

      {params.sort ? <input type="hidden" name="sort" value={params.sort} /> : null}

      <button type="submit" className="btn-cta min-h-11 w-full px-3 py-2.5 text-sm">
        Apply filters
      </button>
      <Link
        href={params.q ? `/search/results?q=${encodeURIComponent(params.q)}` : "/search/results"}
        className="block text-center text-xs font-semibold text-link hover:underline"
      >
        Clear filters
      </Link>
    </>
  );
}

export function SearchFiltersForm({
  params,
  facets,
  className,
}: {
  params: ResultsPageParams;
  facets: SearchResultsFacetOptions;
  className?: string;
}) {
  return (
    <form action="/search/results" method="get" className={className}>
      <FilterFormFields params={params} facets={facets} />
    </form>
  );
}

export function SearchFiltersSidebar({
  params,
  facets,
}: {
  params: ResultsPageParams;
  facets: SearchResultsFacetOptions;
}) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <SearchFiltersForm
        params={params}
        facets={facets}
        className="panel sticky top-16 space-y-5 p-4 lg:top-16"
      />
    </aside>
  );
}

export function SearchResultProductCard({
  product,
  signedIn,
  redirectTo,
}: {
  product: SearchResultProduct;
  signedIn: boolean;
  redirectTo: string;
}) {
  const conditions = conditionBadgeLabels(product.conditions);
  const extraBadges: string[] = [];
  if (product.matchKind === "exact") extraBadges.push("Exact match");
  if (product.matchKind === "comparable") extraBadges.push("Comparable alternative");
  for (const h of product.highlights.slice(0, 2)) {
    const label = HIGHLIGHT_LABELS[h];
    if (label && !extraBadges.includes(label)) extraBadges.push(label);
  }
  for (const c of conditions.slice(0, 2)) {
    if (!extraBadges.includes(c)) extraBadges.push(c);
  }

  return (
    <ProductCard
      productId={product.id}
      href={`/compare/${product.id}`}
      imageSrc={product.imageSrc}
      brandName={product.brandName}
      productName={product.productName}
      subtitle={searchResultSubtitle(product)}
      badge={searchResultBadge(product)}
      rating={product.rating}
      fromPrice={product.lowestTotalCost}
      offerCount={product.offerCount}
      sourceCount={product.sourceIds.length}
      freshnessMinutesAgo={product.freshnessMinutesAgo}
      bestListing={product.bestListing}
      isSaved={product.isSaved}
      signedIn={signedIn}
      redirectTo={redirectTo}
      extraBadges={extraBadges}
    />
  );
}
