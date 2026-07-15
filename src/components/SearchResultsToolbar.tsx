"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RESULTS_SORT_OPTIONS, type ResultsSort } from "@/lib/search-results";
import type { ResultsPageParams } from "@/components/SearchResultsLayout";

function prefsChips(params: ResultsPageParams): { label: string; clearKey: string }[] {
  const chips: { label: string; clearKey: string }[] = [];
  if (params.category) chips.push({ label: `Category: ${params.category}`, clearKey: "category" });
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
  if (params.pickup === "1") chips.push({ label: "Pickup available", clearKey: "pickup" });
  if (params.available === "0") chips.push({ label: "Including unavailable", clearKey: "available" });
  if (params.source) chips.push({ label: "Selected retailer", clearKey: "source" });
  if (params.comparable === "0" || params.alt === "exact")
    chips.push({ label: "Exact-leaning matches", clearKey: "comparable" });
  if (params.saved === "1") chips.push({ label: "Saved only", clearKey: "saved" });
  if (params.deliveryBy)
    chips.push({ label: `Delivery: ${params.deliveryBy}`, clearKey: "deliveryBy" });
  if (params.priority) chips.push({ label: `Priority: ${params.priority}`, clearKey: "priority" });
  return chips;
}

export function SearchResultsToolbar({
  params,
  total,
  sort,
}: {
  params: ResultsPageParams;
  total: number;
  sort: ResultsSort;
}) {
  const router = useRouter();
  const chips = prefsChips(params);

  function hrefWithout(key: string) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== key) next.set(k, v);
    }
    return `/search/results?${next.toString()}`;
  }

  const editHref = params.q
    ? `/search/clarify?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v) as [string, string][],
        ),
      ).toString()}`
    : "/";

  function onSortChange(value: string) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "sort") next.set(k, v);
    }
    next.set("sort", value);
    router.push(`/search/results?${next.toString()}`);
  }

  return (
    <div className="space-y-4 border-b border-border pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Search</p>
          <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-navy-900 sm:text-2xl">
            {params.q?.trim() ||
              (params.category ? `Category: ${params.category}` : "All products")}
          </h1>
          <p className="mt-1 text-sm text-muted" aria-live="polite">
            {total} matching product{total === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={editHref}
            className="rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-navy-900 hover:border-navy-800"
          >
            Edit criteria
          </Link>
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

      {chips.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Captured preferences
          </p>
          <ul className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c.clearKey}>
                <Link
                  href={hrefWithout(c.clearKey)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-navy-800 hover:border-navy-800"
                  aria-label={`Remove preference ${c.label}`}
                >
                  {c.label}
                  <span aria-hidden="true" className="text-muted">
                    ×
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
