import Link from "next/link";
import {
  PrimaryAction,
  SecondaryAction,
  StatusPanel,
} from "@/components/StatusPanel";
import { CategoryVisualCard } from "@/components/CategoryVisualCard";
import type { ResultsPageParams } from "@/components/SearchResultsLayout";
import { categoryDisplayTitle } from "@/lib/category-visuals";
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
  { key: "saved", label: "saved-only filter" },
  { key: "available", label: "availability filter" },
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

export function NoSearchResultsPanel({ params }: { params: ResultsPageParams }) {
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

  const relatedChips = RELATED_CATEGORY_CHIPS.filter(
    (c) => c.slug !== params.category && c.slug !== "beauty-devices",
  ).slice(0, 6);

  return (
    <div className="space-y-4">
      {params.category ? (
        <CategoryVisualCard category={params.category} compact />
      ) : null}

      {categoryOnly ? (
        <div className="rounded-2xl border border-border bg-panel p-5 shadow-[var(--shadow-panel)]">
          <h2 className="text-lg font-bold tracking-tight text-navy-900">
            Browse {categoryTitle}
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            No live listings matched this category with your current filters. Explore popular
            products below, or try a different department.
          </p>
          {removable ? (
            <div className="mt-4">
              <SecondaryAction href={hrefWithout(params, removable.key)}>
                Remove {removable.label}
              </SecondaryAction>
            </div>
          ) : null}
        </div>
      ) : (
        <StatusPanel
          title="No matching product found"
          description={
            params.q
              ? `Nothing matched “${params.q}” with your current filters and preferences.`
              : "Nothing matched your current filters. Try broadening your criteria."
          }
          actions={
            <>
              <PrimaryAction href={editHref}>Edit search</PrimaryAction>
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
    </div>
  );
}
