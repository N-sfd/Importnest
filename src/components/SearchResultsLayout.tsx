import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { formatConditionLabel } from "@/lib/compare-view";
import {
  conditionBadgeLabels,
  type ResultHighlight,
  type SearchResultProduct,
  type SearchResultsFacetOptions,
} from "@/lib/search-results";
import { productThumbClass } from "@/lib/images";
import { saveProductAction, unsaveProductAction } from "@/lib/saved-actions";

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

function freshnessText(minutes: number | null) {
  if (minutes == null) return "No recent sync";
  if (minutes <= 0) return "Updated just now";
  if (minutes === 1) return "Updated 1 min ago";
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? "Updated 1 hr ago" : `Updated ${hours} hr ago`;
}

const HIGHLIGHT_LABELS: Record<ResultHighlight, string> = {
  best_value: "Best value",
  lowest_cost: "Lowest cost",
  fastest: "Fastest available",
};

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

function ResultBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "exact" | "comparable" | "highlight" | "condition";
}) {
  const className =
    tone === "exact"
      ? "bg-navy-900 text-white"
      : tone === "comparable"
        ? "border border-dashed border-accent/40 bg-surface text-navy-800"
        : tone === "highlight"
          ? "bg-cta/30 text-navy-900"
          : "border border-border bg-white text-navy-800";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-tight ${className}`}
    >
      {children}
    </span>
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
  const offerLabel = product.offerCount === 1 ? "1 offer" : `${product.offerCount} offers`;
  const conditions = conditionBadgeLabels(product.conditions);
  const isExact = product.matchKind === "exact";
  const isComparable = product.matchKind === "comparable";

  const sourceCount = product.sourceIds.length;
  const cardClass = isComparable ? "bg-surface/50" : "bg-panel";

  return (
    <article
      className={`panel offer-card flex flex-col gap-3 p-4 sm:flex-row sm:items-stretch ${cardClass}`}
    >
      <Link
        href={`/compare/${product.id}`}
        className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-white sm:mx-0"
      >
        <Image
          src={product.imageSrc}
          alt=""
          fill
          className={productThumbClass(product.imageSrc)}
          sizes="112px"
        />
      </Link>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {isExact ? <ResultBadge tone="exact">Exact match</ResultBadge> : null}
          {isComparable ? <ResultBadge tone="comparable">Comparable alternative</ResultBadge> : null}
          {product.rating != null ? (
            <ResultBadge tone="highlight">★ {product.rating.toFixed(1)}</ResultBadge>
          ) : null}
          {product.highlights.slice(0, 2).map((h) => (
            <ResultBadge key={h} tone="highlight">
              {HIGHLIGHT_LABELS[h]}
            </ResultBadge>
          ))}
          {conditions.slice(0, 2).map((c) => (
            <ResultBadge key={c} tone="condition">
              {c}
            </ResultBadge>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {product.brandName}
            {product.modelNumber ? (
              <span className="font-medium normal-case tracking-normal text-muted">
                {" "}
                · {product.modelNumber}
              </span>
            ) : null}
          </p>
          <Link
            href={`/compare/${product.id}`}
            className="mt-0.5 block text-base font-bold leading-snug text-navy-900 hover:text-link"
          >
            {product.productName}
          </Link>
        </div>

        {product.attributes.length > 0 ? (
          <p className="truncate text-xs text-muted">
            {product.attributes
              .map((a) => `${a.key} ${a.value}${a.unit ? ` ${a.unit}` : ""}`)
              .join(" · ")}
          </p>
        ) : null}

        <p className="text-xs text-muted">
          {product.offerCount > 0 ? (
            <span className="font-medium text-navy-800">
              {offerLabel}
              {sourceCount > 0
                ? ` from ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}`
                : ""}
            </span>
          ) : (
            <span className="font-medium text-navy-800">No offers</span>
          )}
          <span className="mx-1.5 text-border">·</span>
          {freshnessText(product.freshnessMinutesAgo)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-stretch justify-between gap-2 sm:w-36 sm:items-end">
        <div className="sm:text-right">
          {product.lowestTotalCost != null ? (
            <>
              <p className="text-[11px] font-medium text-muted">From</p>
              <p className="text-lg font-bold tabular-nums text-price">
                ${product.lowestTotalCost.toFixed(2)}
              </p>
            </>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:w-full">
          {signedIn ? (
            <form
              action={
                product.isSaved
                  ? unsaveProductAction.bind(null, product.id, redirectTo)
                  : saveProductAction.bind(null, product.id, redirectTo)
              }
            >
              <button
                type="submit"
                className={`w-full rounded-full border px-3 py-2 text-sm font-semibold ${
                  product.isSaved
                    ? "border-border bg-panel text-gray-700"
                    : "border-border text-navy-900 hover:border-navy-800"
                }`}
              >
                {product.isSaved ? "Saved ✓" : "Save"}
              </button>
            </form>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(redirectTo)}`}
              className="w-full rounded-full border border-border px-3 py-2 text-center text-sm font-semibold text-navy-900 hover:border-navy-800"
            >
              Save
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Link
              href={`/compare/${product.id}`}
              className="btn-cta flex-1 px-3 py-2 text-center text-sm"
            >
              View offers
            </Link>
            {product.bestListing ? (
              <AddToCartButton
                compact
                listingId={product.bestListing.listingId}
                productId={product.id}
                title={product.productName}
                brand={product.brandName}
                imageUrl={product.imageSrc}
                retailerName={product.bestListing.sourceName}
                condition={formatConditionLabel(product.bestListing.condition)}
                itemPrice={product.bestListing.price}
                shipping={product.bestListing.shipping}
                fees={product.bestListing.fees}
                totalKnownCost={
                  product.bestListing.price + product.bestListing.shipping + product.bestListing.fees
                }
              />
            ) : null}
            <AddToCompareButton productId={product.id} productName={product.productName} />
          </div>
        </div>
      </div>
    </article>
  );
}
