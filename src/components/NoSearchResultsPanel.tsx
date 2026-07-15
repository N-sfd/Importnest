import {
  PrimaryAction,
  SecondaryAction,
  StatusPanel,
} from "@/components/StatusPanel";
import type { ResultsPageParams } from "@/components/SearchResultsLayout";
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

function hrefWithout(params: ResultsPageParams, key: string) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== key) next.set(k, v);
  }
  // Clearing available=0 should restore default "has offers"
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
  const editHref = params.q
    ? `/search/clarify?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v) as [string, string][],
        ),
      ).toString()}`
    : "/";

  return (
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
  );
}
