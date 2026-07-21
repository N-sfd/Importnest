import { PageShell } from "@/components/PageShell";
import { CategoryBrowseHeader } from "@/components/CategoryBrowseHeader";
import { CategoryDemoGrid } from "@/components/CategoryDemoGrid";
import { DealProductCard } from "@/components/DealProductCard";
import { MobileFiltersSheet } from "@/components/MobileFiltersSheet";
import { NoSearchResultsPanel } from "@/components/NoSearchResultsPanel";
import { PopularComparisonsSection } from "@/components/PopularComparisonCard";
import { RelatedCategoryChips } from "@/components/RelatedCategoryChips";
import {
  SearchFiltersForm,
  SearchFiltersSidebar,
  SearchResultProductCard,
  countActiveResultFilters,
  type ResultsPageParams,
} from "@/components/SearchResultsLayout";
import { SearchResultsToolbar } from "@/components/SearchResultsToolbar";
import { getAuthUser } from "@/lib/auth";
import { getBestDeals } from "@/lib/best-deals";
import { categoryDisplayTitle, normalizeCategorySlug } from "@/lib/category-visuals";
import { prisma } from "@/lib/prisma";
import { getPopularComparisons } from "@/lib/popular-comparisons";
import {
  getSearchResults,
  partitionByMatchKind,
  type ResultsSort,
  type SearchResultsFilters,
} from "@/lib/search-results";

function parseSort(raw: string | undefined): ResultsSort {
  const allowed: ResultsSort[] = [
    "best_overall",
    "lowest_cost",
    "fastest",
    "best_value",
    "recently_updated",
  ];
  if (raw && allowed.includes(raw as ResultsSort)) return raw as ResultsSort;
  return "best_overall";
}

function parseNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function mapCondition(
  raw: string | undefined,
): SearchResultsFilters["condition"] | undefined {
  if (!raw || raw === "any") return undefined;
  if (raw === "new" || raw === "open_box" || raw === "refurbished" || raw === "used") return raw;
  return undefined;
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<ResultsPageParams>;
}) {
  const params = await searchParams;
  const authUser = await getAuthUser();

  const savedIds = new Set<string>();
  if (authUser) {
    const saved = await prisma.savedProduct.findMany({
      where: { userId: authUser.id },
      select: { canonicalProductId: true },
    });
    for (const row of saved) savedIds.add(row.canonicalProductId);
  }

  const sort = parseSort(params.sort);
  const categorySlug = params.category?.trim() ? normalizeCategorySlug(params.category.trim()) : null;
  const filters: SearchResultsFilters = {
    query: params.q?.trim() || undefined,
    categorySlug: categorySlug || undefined,
    brandNames: params.brand
      ? [params.brand]
      : params.brands && params.brands !== "any"
        ? params.brands.split(",").map((b) => b.trim()).filter(Boolean)
        : undefined,
    priceMin: parseNumber(params.priceMin),
    priceMax: parseNumber(params.priceMax) ?? parseNumber(params.budgetMax),
    condition: mapCondition(params.condition),
    availableOnly: params.available !== "0",
    pickupOnly: params.pickup === "1",
    sourceId: params.source || undefined,
    allowComparable: params.comparable !== "0" && params.alt !== "exact",
    savedOnly: params.saved === "1",
    savedProductIds: savedIds,
    sort,
  };

  const [results, categoryDeals, categoryPopular] = await Promise.all([
    getSearchResults(filters),
    categorySlug ? getBestDeals(8, savedIds, categorySlug) : Promise.resolve([]),
    categorySlug ? getPopularComparisons(8, savedIds, categorySlug) : Promise.resolve([]),
  ]);

  const redirectTo = `/search/results?${new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v) as [string, string][],
    ),
  ).toString()}`;
  const activeFilters = countActiveResultFilters(params);
  const { exact, comparable } = partitionByMatchKind(results.products);
  const showSeparateMatchSections = Boolean(params.q) && exact.length > 0 && comparable.length > 0;
  const hasLiveProducts = results.products.length > 0;
  const categoryTitle = categorySlug ? categoryDisplayTitle(categorySlug) : null;
  const signedIn = Boolean(authUser);

  function renderProductGrid() {
    if (!hasLiveProducts) {
      return categorySlug ? (
        <NoSearchResultsPanel params={params} hideCategoryVisual />
      ) : (
        <NoSearchResultsPanel params={params} />
      );
    }

    if (showSeparateMatchSections) {
      return (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {exact.map((p) => (
              <li key={p.id} className="min-w-0">
                <SearchResultProductCard
                  product={p}
                  signedIn={signedIn}
                  redirectTo={redirectTo}
                />
              </li>
            ))}
          </ul>
          <h2 className="pt-2 text-sm font-bold uppercase tracking-wide text-muted">
            Comparable alternatives
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comparable.map((p) => (
              <li key={p.id} className="min-w-0">
                <SearchResultProductCard
                  product={p}
                  signedIn={signedIn}
                  redirectTo={redirectTo}
                />
              </li>
            ))}
          </ul>
        </>
      );
    }

    return (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.products.map((p) => (
          <li key={p.id} className="min-w-0">
            <SearchResultProductCard
              product={p}
              signedIn={signedIn}
              redirectTo={redirectTo}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <SearchFiltersSidebar params={params} facets={results.facets} />

        <div className="min-w-0 flex-1 space-y-6">
          <MobileFiltersSheet activeCount={activeFilters}>
            <SearchFiltersForm
              params={params}
              facets={results.facets}
              className="space-y-5"
            />
          </MobileFiltersSheet>

          {categorySlug ? <CategoryBrowseHeader categorySlug={categorySlug} /> : null}

          <SearchResultsToolbar
            params={params}
            total={results.total}
            sort={sort}
            hideCategoryVisual={Boolean(categorySlug)}
          />

          {/* Featured products (live matching results) */}
          <section
            aria-labelledby={categorySlug ? "featured-products-heading" : undefined}
            className="space-y-3"
          >
            {categorySlug ? (
              <div>
                <h2
                  id="featured-products-heading"
                  className="text-lg font-bold tracking-tight text-navy-900 sm:text-xl"
                >
                  Featured products
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Live offers in {categoryTitle} from approved sources.
                </p>
              </div>
            ) : null}
            {renderProductGrid()}
          </section>

          {/* Best deals in this category */}
          {categorySlug && categoryDeals.length > 0 ? (
            <section aria-labelledby="category-deals-heading" className="space-y-3">
              <div>
                <h2
                  id="category-deals-heading"
                  className="text-lg font-bold tracking-tight text-navy-900 sm:text-xl"
                >
                  Best deals in {categoryTitle}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Price drops and multi-offer totals from real listing history.
                </p>
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryDeals.map((item) => (
                  <li key={item.productId} className="min-w-0">
                    <DealProductCard
                      item={item}
                      imageSrc={item.imageSrc}
                      signedIn={signedIn}
                      redirectTo={redirectTo}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Popular comparisons */}
          {categorySlug && categoryPopular.length > 0 ? (
            <PopularComparisonsSection
              items={categoryPopular}
              signedIn={signedIn}
              title="Popular comparisons"
              subtitle={`Most-compared ${categoryTitle} products with live approved offers.`}
            />
          ) : null}

          {/* More to explore — same category only */}
          {categorySlug ? (
            <CategoryDemoGrid
              categorySlug={categorySlug}
              prominence="secondary"
              showSubtypeChips={false}
            />
          ) : null}

          {categorySlug ? (
            <RelatedCategoryChips categorySlug={categorySlug} query={params.q} />
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
