"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryVisualCard } from "@/components/CategoryVisualCard";
import type { ResultsPageParams } from "@/components/SearchResultsLayout";
import { categoryDisplayTitle, normalizeCategorySlug } from "@/lib/category-visuals";
import { RESULTS_SORT_OPTIONS, type ResultsSort } from "@/lib/search-results";

function prefsChips(params: ResultsPageParams): { label: string; clearKey: string }[] {
  const chips: { label: string; clearKey: string }[] = [];
  if (params.q?.trim())
    chips.push({ label: `Query: “${params.q.trim()}”`, clearKey: "q" });
  const chipCategorySlug = normalizeCategorySlug(params.category);
  if (chipCategorySlug)
    chips.push({
      label: `Category: ${categoryDisplayTitle(chipCategorySlug)}`,
      clearKey: "category",
    });
  if (params.brand) chips.push({ label: `Brand: ${params.brand}`, clearKey: "brand" });
  else if (params.brands && params.brands !== "any")
    chips.push({ label: `Brands: ${params.brands}`, clearKey: "brands" });
  const max = params.priceMax || params.budgetMax;
  if (max) chips.push({ label: `Under $${max}`, clearKey: params.priceMax ? "priceMax" : "budgetMax" });
  if (params.priceMin) chips.push({ label: `From $${params.priceMin}`, clearKey: "priceMin" });
  if (params.condition)
    chips.push({
      label: `Condition: ${params.condition.replace(/_/g, " ")}`,
      clearKey: "condition",
    });
  if (params.color) chips.push({ label: params.color, clearKey: "color" });
  if (params.ratingMin) chips.push({ label: `${params.ratingMin}★ & up`, clearKey: "ratingMin" });
  if (params.freeShipping === "1") chips.push({ label: "Free shipping", clearKey: "freeShipping" });
  if (params.pickup === "1") chips.push({ label: "Pickup available", clearKey: "pickup" });
  if (params.available === "0") chips.push({ label: "Including unavailable", clearKey: "available" });
  if (params.source) chips.push({ label: "Selected retailer", clearKey: "source" });
  if (params.comparable === "0" || params.alt === "exact")
    chips.push({ label: "Exact-leaning matches", clearKey: "comparable" });
  if (params.saved === "1") chips.push({ label: "Saved only", clearKey: "saved" });
  if (params.deliveryBy)
    chips.push({ label: `Delivery: ${params.deliveryBy}`, clearKey: "deliveryBy" });
  if (params.priority) chips.push({ label: `Priority: ${params.priority}`, clearKey: "priority" });

  const attrChips: [keyof ResultsPageParams, string][] = [
    ["attr_fitment", "Fitment"],
    ["attr_install", "Install"],
    ["attr_ship_weight", "Ship weight"],
    ["attr_material", "Material"],
    ["attr_finish", "Finish"],
    ["attr_power", "Power"],
    ["attr_hair", "Hair"],
    ["attr_skin", "Skin"],
    ["attr_cert", "Cert"],
    ["attr_water", "Water / IPX"],
    ["attr_weight", "Weight"],
    ["attr_activity", "Activity"],
    ["attr_color", "Color"],
    ["attr_screen", "Screen"],
    ["attr_capacity", "Capacity"],
    ["attr_energy", "Energy"],
  ];
  for (const [key, label] of attrChips) {
    const v = params[key];
    if (v) chips.push({ label: `${label}: ${v}`, clearKey: key });
  }
  if (params.vehicleYear || params.vehicleMake || params.vehicleModel) {
    chips.push({
      label: `Vehicle: ${[params.vehicleYear, params.vehicleMake, params.vehicleModel].filter(Boolean).join(" ")}`,
      clearKey: "vehicleYear",
    });
  }
  return chips;
}

/** Keep only browse context (q / category / view / sort) — drop applied facets. */
function clearFiltersHref(params: ResultsPageParams) {
  const next = new URLSearchParams();
  if (params.q) next.set("q", params.q);
  if (params.category) next.set("category", params.category);
  if (params.view) next.set("view", params.view);
  if (params.sort) next.set("sort", params.sort);
  const qs = next.toString();
  return qs ? `/search/results?${qs}` : "/search/results";
}

function filterChipCount(params: ResultsPageParams) {
  return prefsChips(params).filter((c) => c.clearKey !== "q" && c.clearKey !== "category").length;
}

function paramsToSearch(params: ResultsPageParams, omit?: string) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== omit) next.set(k, v);
  }
  return next;
}

export function SearchResultsToolbar({
  params,
  total,
  sort,
  hideCategoryVisual = false,
}: {
  params: ResultsPageParams;
  total: number;
  sort: ResultsSort;
  hideCategoryVisual?: boolean;
}) {
  const router = useRouter();
  const chips = prefsChips(params);
  const categorySlug = normalizeCategorySlug(params.category);
  const categoryTitle = categorySlug ? categoryDisplayTitle(categorySlug) : null;
  const view = params.view === "list" ? "list" : "grid";
  const queryLabel = params.q?.trim() || null;

  function hrefWithout(key: string) {
    const next = paramsToSearch(params, key);
    if (key === "vehicleYear") {
      next.delete("vehicleMake");
      next.delete("vehicleModel");
    }
    return `/search/results?${next.toString()}`;
  }

  function hrefWith(updates: Partial<ResultsPageParams>) {
    const next = paramsToSearch(params);
    for (const [k, v] of Object.entries(updates)) {
      if (!v) next.delete(k);
      else next.set(k, v);
    }
    return `/search/results?${next.toString()}`;
  }

  function onSortChange(value: string) {
    const next = paramsToSearch(params, "sort");
    next.set("sort", value);
    router.push(`/search/results?${next.toString()}`);
  }

  const showingLabel = queryLabel
    ? `Showing ${total} result${total === 1 ? "" : "s"} for “${queryLabel}”`
    : categoryTitle
      ? `Showing ${total} result${total === 1 ? "" : "s"} for ${categoryTitle}`
      : `Showing ${total} result${total === 1 ? "" : "s"}`;
  const facetChipCount = filterChipCount(params);
  const trail = [categoryTitle, queryLabel].filter(Boolean).join(" › ");

  return (
    <div className="space-y-3">
      {categorySlug && !hideCategoryVisual ? (
        <CategoryVisualCard category={categorySlug} query={params.q} compact />
      ) : null}

      {trail ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{trail}</p>
      ) : null}

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <ul className="flex flex-wrap gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.clearKey + c.label}>
                <Link
                  href={hrefWithout(c.clearKey)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-navy-800 hover:border-navy-800"
                  aria-label={`Remove ${c.label}`}
                >
                  {c.label}
                  <span aria-hidden="true" className="text-muted">
                    ✕
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {facetChipCount > 0 ? (
            <Link
              href={clearFiltersHref(params)}
              className="text-xs font-bold text-link hover:underline"
            >
              Clear all
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="results-toolbar-bar results-toolbar-sticky">
        <p className="min-w-0 text-sm font-semibold text-navy-900" aria-live="polite">
          {showingLabel}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="results-view-switch" role="group" aria-label="Result layout">
            <Link
              href={hrefWith({ view: "grid" })}
              aria-current={view === "grid" ? "page" : undefined}
              className={`results-view-btn ${view === "grid" ? "is-active" : ""}`}
              title="Grid view"
            >
              <span className="sr-only">Grid view</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </Link>
            <Link
              href={hrefWith({ view: "list" })}
              aria-current={view === "list" ? "page" : undefined}
              className={`results-view-btn ${view === "list" ? "is-active" : ""}`}
              title="List view"
            >
              <span className="sr-only">List view</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="3" y="4" width="18" height="3" rx="1" />
                <rect x="3" y="10.5" width="18" height="3" rx="1" />
                <rect x="3" y="17" width="18" height="3" rx="1" />
              </svg>
            </Link>
          </div>
          <label htmlFor="results-sort" className="sr-only">
            Sort results
          </label>
          <select
            id="results-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-full border border-border bg-white px-3 py-2 text-sm font-semibold text-navy-900 outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-900/20"
          >
            {RESULTS_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
