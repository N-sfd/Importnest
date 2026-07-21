import Link from "next/link";
import {
  PrimaryAction,
  SecondaryAction,
  StatusPanel,
} from "@/components/StatusPanel";
import { CategoryVisualCard } from "@/components/CategoryVisualCard";
import { PopularComparisonsSection } from "@/components/PopularComparisonCard";
import type { ResultsPageParams } from "@/components/SearchResultsLayout";
import { categoryDisplayTitle } from "@/lib/category-visuals";
import type { PopularComparison } from "@/lib/popular-comparisons";
import { browseCategoryHref } from "@/lib/search-intent";

/** Filter keys a shopper can clear one-at-a-time from the no-results panel. */
const REMOVABLE: { key: keyof ResultsPageParams; label: string }[] = [
  { key: "brand", label: "brand filter" },
  { key: "brands", label: "brand preference" },
  { key: "condition", label: "condition filter" },
  { key: "priceMax", label: "max price" },
  { key: "budgetMax", label: "budget" },
  { key: "priceMin", label: "min price" },
  { key: "source", label: "retailer filter" },
  { key: "pickup", label: "pickup filter" },
  { key: "freeShipping", label: "free shipping filter" },
  { key: "ratingMin", label: "rating filter" },
  { key: "color", label: "color filter" },
  { key: "saved", label: "saved-only filter" },
  { key: "available", label: "availability filter" },
  { key: "attr_fitment", label: "fitment filter" },
  { key: "attr_install", label: "installation filter" },
  { key: "attr_ship_weight", label: "shipping weight filter" },
  { key: "attr_material", label: "material filter" },
  { key: "attr_finish", label: "finish filter" },
  { key: "attr_power", label: "power source filter" },
  { key: "attr_hair", label: "hair type filter" },
  { key: "attr_skin", label: "skin type filter" },
  { key: "attr_cert", label: "certification filter" },
  { key: "attr_water", label: "weather / IPX filter" },
  { key: "attr_weight", label: "weight filter" },
  { key: "attr_activity", label: "activity filter" },
  { key: "attr_color", label: "color filter" },
  { key: "vehicleYear", label: "vehicle filter" },
];

const RELATED_CATEGORY_CHIPS = [
  { slug: "electronics", label: "Electronics" },
  { slug: "appliances", label: "Appliances" },
  { slug: "kitchen", label: "Kitchen" },
  { slug: "footwear", label: "Footwear" },
  { slug: "beauty", label: "Beauty" },
  { slug: "accessories", label: "Accessories" },
  { slug: "home", label: "Home" },
  { slug: "outdoors", label: "Outdoors" },
];

function hrefWithout(params: ResultsPageParams, key: string) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== key) next.set(k, v);
  }
  if (key === "available") next.delete("available");
  if (key === "pickup") next.delete("pickup");
  if (key === "saved") next.delete("saved");
  if (key === "vehicleYear") {
    next.delete("vehicleYear");
    next.delete("vehicleMake");
    next.delete("vehicleModel");
  }
  const qs = next.toString();
  return qs ? `/search/results?${qs}` : "/search/results";
}

function withComparable(params: ResultsPageParams) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== "comparable" && k !== "alt") next.set(k, v);
  }
  next.set("comparable", "1");
  return `/search/results?${next.toString()}`;
}

function resetFiltersHref(params: ResultsPageParams) {
  const next = new URLSearchParams();
  if (params.q) next.set("q", params.q);
  if (params.category) next.set("category", params.category);
  const qs = next.toString();
  return qs ? `/search/results?${qs}` : "/search/results";
}

export function NoSearchResultsPanel({
  params,
  hideCategoryVisual = false,
  recommendations = [],
  signedIn = false,
  priceBounds = null,
}: {
  params: ResultsPageParams;
  hideCategoryVisual?: boolean;
  recommendations?: PopularComparison[];
  signedIn?: boolean;
  redirectTo?: string;
  priceBounds?: { min: number; max: number } | null;
}) {
  const removable = REMOVABLE.find(({ key }) => {
    const v = params[key];
    if (!v) return false;
    if (key === "pickup" || key === "saved") return v === "1";
    if (key === "available") return v === "0";
    if (key === "brands") return v !== "any";
    return true;
  });

  const exactOnly = params.comparable === "0" || params.alt === "exact";
  const categoryHref = browseCategoryHref(params.category);
  const categoryOnly = Boolean(params.category) && !params.q;
  const categoryTitle = params.category ? categoryDisplayTitle(params.category) : null;
  const editHref = params.q
    ? `/search/clarify?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v) as [string, string][],
        ),
      ).toString()}`
    : "/";

  const relatedChips = RELATED_CATEGORY_CHIPS.filter((c) => {
    if (!params.category) return true;
    const current = params.category === "beauty-devices" ? "beauty" : params.category;
    return c.slug !== current;
  }).slice(0, 6);

  const hasFacetFilters = REMOVABLE.some(({ key }) => {
    const v = params[key];
    if (!v) return false;
    if (key === "pickup" || key === "saved" || key === "freeShipping") return v === "1";
    if (key === "available") return v === "0";
    if (key === "brands") return v !== "any";
    return true;
  });

  const recommendTitle = categoryTitle
    ? `Popular in ${categoryTitle}`
    : "You might also like";

  const strictMax = Number(params.priceMax || params.budgetMax);
  const relaxMax =
    priceBounds &&
    Number.isFinite(strictMax) &&
    strictMax > 0 &&
    priceBounds.max > strictMax
      ? Math.ceil(priceBounds.max)
      : null;

  function hrefWithRelaxedMax(max: number) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (!v || k === "priceMax" || k === "budgetMax") continue;
      next.set(k, v);
    }
    next.set("priceMax", String(max));
    return `/search/results?${next.toString()}`;
  }
  return (
    <div className="space-y-4">
      {params.category && !hideCategoryVisual ? (
        <CategoryVisualCard category={params.category} query={params.q} compact />
      ) : null}

      {categoryOnly ? (
        <div className="rounded-2xl border border-border bg-panel p-5 shadow-[var(--shadow-panel)]">
          <h2 className="text-lg font-bold tracking-tight text-navy-900">
            No exact matches for your filter choices
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            No live listings matched {categoryTitle} with your current filters. Reset filters or
            explore related departments below.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {hasFacetFilters ? (
              <PrimaryAction href={resetFiltersHref(params)}>Reset filters</PrimaryAction>
            ) : null}
            {relaxMax != null ? (
              <SecondaryAction href={hrefWithRelaxedMax(relaxMax)}>
                No results under ${strictMax}. Show up to ${relaxMax}
              </SecondaryAction>
            ) : null}
            {removable ? (
              <SecondaryAction href={hrefWithout(params, removable.key)}>
                Remove {removable.label}
              </SecondaryAction>
            ) : null}
          </div>
        </div>
      ) : (
        <StatusPanel
          title="No exact matches for your filter choices"
          description={
            params.q
              ? `Nothing matched “${params.q}” with your current filters. Try resetting filters or broadening your search.`
              : "Nothing matched your current filters. Try resetting filters or browsing a department."
          }
          actions={
            <>
              {hasFacetFilters ? (
                <PrimaryAction href={resetFiltersHref(params)}>Reset filters</PrimaryAction>
              ) : (
                <PrimaryAction href={editHref}>Edit search</PrimaryAction>
              )}
              {relaxMax != null ? (
                <SecondaryAction href={hrefWithRelaxedMax(relaxMax)}>
                  No results under ${strictMax}. Show up to ${relaxMax}
                </SecondaryAction>
              ) : null}
              {removable ? (
                <SecondaryAction href={hrefWithout(params, removable.key)}>
                  Remove {removable.label}
                </SecondaryAction>
              ) : null}
              {exactOnly ? (
                <SecondaryAction href={withComparable(params)}>
                  Allow comparable alternatives
                </SecondaryAction>
              ) : null}
              <SecondaryAction href={categoryHref}>Browse category</SecondaryAction>
            </>
          }
        />
      )}

      {!hideCategoryVisual ? (
        <section aria-labelledby="explore-departments-heading">
          <h3
            id="explore-departments-heading"
            className="text-xs font-bold uppercase tracking-wide text-muted"
          >
            Explore other departments
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {relatedChips.map((chip) => (
              <Link
                key={chip.slug}
                href={`/search/results?category=${chip.slug}`}
                className="rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-semibold text-navy-900 transition hover:border-navy-800 hover:bg-navy-100"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {recommendations.length > 0 ? (
        <PopularComparisonsSection
          items={recommendations}
          signedIn={signedIn}
          title={recommendTitle}
          subtitle="Live totals from approved sources — never invented rankings"
        />
      ) : null}
    </div>
  );
}
