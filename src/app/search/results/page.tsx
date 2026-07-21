import { PageShell } from "@/components/PageShell";
import { CategoryBrowseHeader } from "@/components/CategoryBrowseHeader";
import { CategoryDemoGrid } from "@/components/CategoryDemoGrid";
import { CategoryImageGrid } from "@/components/CategoryImageCard";
import { DealProductCard } from "@/components/DealProductCard";
import { MobileResultsChrome } from "@/components/MobileResultsChrome";
import { NoSearchResultsPanel } from "@/components/NoSearchResultsPanel";
import { PopularComparisonsSection } from "@/components/PopularComparisonCard";
import { RelatedCategoryChips } from "@/components/RelatedCategoryChips";
import { SearchBreadcrumbs } from "@/components/SearchBreadcrumbs";
import {
  SearchFiltersForm,
  SearchFiltersSidebar,
  SearchResultProductCard,
  countActiveResultFilters,
  type ResultsPageParams,
} from "@/components/SearchResultsLayout";
import { SearchResultsToolbar } from "@/components/SearchResultsToolbar";
import { TopProductsSection } from "@/components/TopProductsSection";
import { getAuthUser } from "@/lib/auth";
import { getBestDeals } from "@/lib/best-deals";
import { attributeFiltersFromParams, categoryFacetProfile } from "@/lib/category-facets";
import {
  categoryDescriptionFor,
  categoryDisplayTitle,
  normalizeCategorySlug,
  SHOP_CATEGORY_SLUGS,
} from "@/lib/category-visuals";
import { categoryImageFor } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { getPopularComparisons } from "@/lib/popular-comparisons";
import {
  getSearchResults,
  partitionByMatchKind,
  type ResultsSort,
  type SearchResultsFilters,
} from "@/lib/search-results";

/** Idealo-inspired shop-by-category chips for the "All products" browse view. */
const ALL_BROWSE_CATEGORIES = SHOP_CATEGORY_SLUGS.map((key) => {
  const slug = normalizeCategorySlug(key) ?? key;
  return {
    name: categoryDisplayTitle(key),
    desc: categoryDescriptionFor(key),
    href: `/search/results?category=${encodeURIComponent(slug)}`,
    image: categoryImageFor(key),
  };
});

function parseSort(raw: string | undefined): ResultsSort {
  const allowed: ResultsSort[] = [
    "best_overall",
    "lowest_cost",
    "fastest",
    "best_value",
    "recently_updated",
    "best_rated",
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
  const normalized = raw === "open-box" ? "open_box" : raw;
  if (
    normalized === "new" ||
    normalized === "open_box" ||
    normalized === "refurbished" ||
    normalized === "used"
  ) {
    return normalized;
  }
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
  // "all", empty, and missing all mean "no category filter" — never a
  // literal "all" slug sent to the database (which would just return zero rows).
  const categorySlug = normalizeCategorySlug(params.category) ?? null;
  const preferList = categoryFacetProfile(categorySlug)?.preferListView === true;
  const view =
    params.view === "list"
      ? "list"
      : params.view === "grid"
        ? "grid"
        : preferList
          ? "list"
          : "grid";
  const vehicleContext = {
    year: params.vehicleYear?.trim() || undefined,
    make: params.vehicleMake?.trim() || undefined,
    model: params.vehicleModel?.trim() || undefined,
  };
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
    freeShippingOnly: params.freeShipping === "1",
    ratingMin: parseNumber(params.ratingMin),
    color: params.color?.trim() || undefined,
    attributeFilters: attributeFiltersFromParams(params, categorySlug),
    sourceId: params.source || undefined,
    allowComparable: params.comparable !== "0" && params.alt !== "exact",
    savedOnly: params.saved === "1",
    savedProductIds: savedIds,
    sort,
  };

  // "All products": no category, no query. Featured products then spans every
  // approved category, and the browse rails (Top products / Best deals /
  // Popular comparisons) show the same cross-category mix the homepage does
  // instead of just staying empty because no single category was chosen.
  const isAllBrowse = !categorySlug && !filters.query;

  const [results, categoryDeals, categoryPopularRaw] = await Promise.all([
    getSearchResults(filters),
    categorySlug
      ? getBestDeals(8, savedIds, categorySlug)
      : isAllBrowse
        ? getBestDeals(8, savedIds)
        : Promise.resolve([]),
    categorySlug
      ? getPopularComparisons(8, savedIds, categorySlug)
      : isAllBrowse
        ? getPopularComparisons(24, savedIds)
        : Promise.resolve([]),
  ]);

  // For All products, the first slice of the cross-category pool becomes its
  // own "Top products" rail; the rest still backs Popular comparisons below.
  const topProducts = isAllBrowse ? categoryPopularRaw.slice(0, 8) : [];
  const categoryPopular = isAllBrowse ? categoryPopularRaw.slice(8, 16) : categoryPopularRaw;

  const lowResults = results.products.length > 0 && results.products.length < 3;
  const needsFallback = !results.products.length || lowResults;
  const trendingFallback = needsFallback
    ? await getPopularComparisons(4, savedIds, categorySlug || undefined)
    : [];

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

  // Prefer Best deals / Popular comparisons cards that aren't already showing
  // in Featured products (or Top products, for All) directly above, so the
  // same thumbnails don't repeat section after section. On a plain category
  // browse Featured can legitimately list the whole catalog though — if
  // deduping would empty the section out entirely, fall back to the original
  // (still real, still distinct) picks rather than hiding a section the page
  // is supposed to show.
  const featuredIds = new Set(results.products.map((p) => p.id));
  const topProductIds = new Set(topProducts.map((p) => p.productId));
  const excludeFromDeals = new Set([...featuredIds, ...topProductIds]);
  const dealsAfterDedup = categoryDeals.filter((d) => !excludeFromDeals.has(d.productId));
  const dedupedCategoryDeals = dealsAfterDedup.length > 0 ? dealsAfterDedup : categoryDeals;
  const dealIds = new Set(dedupedCategoryDeals.map((d) => d.productId));
  const popularAfterDedup = categoryPopular.filter(
    (p) => !excludeFromDeals.has(p.productId) && !dealIds.has(p.productId),
  );
  const dedupedCategoryPopular = popularAfterDedup.length > 0 ? popularAfterDedup : categoryPopular;
  const gridClass =
    view === "list"
      ? "grid grid-cols-1 gap-3"
      : "results-product-grid grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4";

  function renderProductGrid() {
    if (!hasLiveProducts) {
      return (
        <NoSearchResultsPanel
          params={params}
          hideCategoryVisual={Boolean(categorySlug)}
          recommendations={trendingFallback}
          signedIn={signedIn}
          priceBounds={results.facets.priceBounds}
        />
      );
    }

    if (showSeparateMatchSections) {
      return (
        <>
          <ul className={gridClass}>
            {exact.map((p) => (
              <li key={p.id} className="min-w-0">
                <SearchResultProductCard
                  product={p}
                  signedIn={signedIn}
                  redirectTo={redirectTo}
                  layout={view}
                  vehicle={vehicleContext}
                />
              </li>
            ))}
          </ul>
          <h2 className="pt-2 text-sm font-bold uppercase tracking-wide text-muted">
            Comparable alternatives
          </h2>
          <ul className={gridClass}>
            {comparable.map((p) => (
              <li key={p.id} className="min-w-0">
                <SearchResultProductCard
                  product={p}
                  signedIn={signedIn}
                  redirectTo={redirectTo}
                  layout={view}
                  vehicle={vehicleContext}
                />
              </li>
            ))}
          </ul>
        </>
      );
    }

    return (
      <>
        <ul className={gridClass}>
          {results.products.map((p) => (
            <li key={p.id} className="min-w-0">
              <SearchResultProductCard
                product={p}
                signedIn={signedIn}
                redirectTo={redirectTo}
                layout={view}
                vehicle={vehicleContext}
              />
            </li>
          ))}
        </ul>
        {lowResults ? (
          <section className="space-y-3 pt-4" aria-labelledby="few-results-heading">
            <div>
              <h2
                id="few-results-heading"
                className="text-lg font-bold tracking-tight text-navy-900"
              >
                You might also like
              </h2>
              <p className="mt-1 text-sm text-muted">
                Popular comparisons from approved sources — broaden your search anytime.
              </p>
            </div>
            {trendingFallback.length > 0 ? (
              <PopularComparisonsSection
                items={trendingFallback}
                signedIn={signedIn}
                title=""
                subtitle=""
              />
            ) : null}
          </section>
        ) : null}
      </>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-4 pb-20 lg:flex-row lg:items-start lg:gap-6 lg:pb-0">
        <SearchFiltersSidebar
          params={params}
          facets={results.facets}
          resultCount={results.total}
        />

        <div className="min-w-0 flex-1 space-y-6">
          <MobileResultsChrome
            activeCount={activeFilters}
            resultCount={results.total}
            params={params}
            sort={sort}
          >
            <SearchFiltersForm
              params={params}
              facets={results.facets}
              resultCount={results.total}
              stickyApply
              className="space-y-5"
            />
          </MobileResultsChrome>

          {categorySlug ? <CategoryBrowseHeader categorySlug={categorySlug} /> : null}

          {isAllBrowse ? (
            <header className="category-browse-header">
              <h1 className="category-browse-title">All products</h1>
              <p className="category-browse-description">
                Browse products across approved categories and compare available offers.
              </p>
            </header>
          ) : null}

          <SearchBreadcrumbs category={categorySlug} query={params.q} />

          <SearchResultsToolbar
            params={params}
            total={results.total}
            sort={sort}
            hideCategoryVisual={Boolean(categorySlug) || isAllBrowse}
          />

          {isAllBrowse ? (
            <section aria-labelledby="all-categories-heading" className="space-y-3">
              <h2
                id="all-categories-heading"
                className="text-lg font-bold tracking-tight text-navy-900 sm:text-xl"
              >
                Shop by category
              </h2>
              <CategoryImageGrid items={ALL_BROWSE_CATEGORIES} />
            </section>
          ) : null}

          <section
            aria-labelledby={categorySlug || isAllBrowse ? "featured-products-heading" : undefined}
            className="space-y-3"
          >
            {categorySlug || isAllBrowse ? (
              <div>
                <h2
                  id="featured-products-heading"
                  className="text-lg font-bold tracking-tight text-navy-900 sm:text-xl"
                >
                  Featured products
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {categorySlug
                    ? `Live offers in ${categoryTitle} from approved sources.`
                    : "Live offers across approved categories."}
                </p>
              </div>
            ) : null}
            {renderProductGrid()}
          </section>

          {isAllBrowse && topProducts.length > 0 ? (
            <TopProductsSection items={topProducts} signedIn={signedIn} />
          ) : null}

          {(categorySlug || isAllBrowse) && dedupedCategoryDeals.length > 0 ? (
            <section aria-labelledby="category-deals-heading" className="space-y-3">
              <div>
                <h2
                  id="category-deals-heading"
                  className="text-lg font-bold tracking-tight text-navy-900 sm:text-xl"
                >
                  {categorySlug ? `Best deals in ${categoryTitle}` : "Best deals"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Price drops and multi-offer totals from real listing history.
                </p>
              </div>
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {dedupedCategoryDeals.map((item) => (
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

          {(categorySlug || isAllBrowse) && dedupedCategoryPopular.length > 0 ? (
            <PopularComparisonsSection
              items={dedupedCategoryPopular}
              signedIn={signedIn}
              title="Popular comparisons"
              subtitle={
                categorySlug
                  ? `Most-compared ${categoryTitle} products with live approved offers.`
                  : "Most-compared products across categories with live approved offers."
              }
            />
          ) : null}

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
