import { PageShell } from "@/components/PageShell";
import { CategoryDemoGrid } from "@/components/CategoryDemoGrid";
import { MobileFiltersSheet } from "@/components/MobileFiltersSheet";
import { NoSearchResultsPanel } from "@/components/NoSearchResultsPanel";
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
import { prisma } from "@/lib/prisma";
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
  const filters: SearchResultsFilters = {
    query: params.q?.trim() || undefined,
    categorySlug: params.category || undefined,
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

  const results = await getSearchResults(filters);
  const redirectTo = `/search/results?${new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v) as [string, string][],
    ),
  ).toString()}`;
  const activeFilters = countActiveResultFilters(params);
  const { exact, comparable } = partitionByMatchKind(results.products);
  const showSeparateMatchSections = Boolean(params.q) && exact.length > 0 && comparable.length > 0;
  const categorySlug = params.category?.trim() || null;
  const hasLiveProducts = results.products.length > 0;

  return (
    <PageShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <SearchFiltersSidebar params={params} facets={results.facets} />

        <div className="min-w-0 flex-1 space-y-4">
          <MobileFiltersSheet activeCount={activeFilters}>
            <SearchFiltersForm
              params={params}
              facets={results.facets}
              className="space-y-5"
            />
          </MobileFiltersSheet>

          {/* Category visual header lives in the toolbar when category is set */}
          <SearchResultsToolbar params={params} total={results.total} sort={sort} />

          {/* 1) Matching live products first */}
          {hasLiveProducts ? (
            showSeparateMatchSections ? (
              <>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {exact.map((p) => (
                    <li key={p.id} className="min-w-0">
                      <SearchResultProductCard
                        product={p}
                        signedIn={Boolean(authUser)}
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
                        signedIn={Boolean(authUser)}
                        redirectTo={redirectTo}
                      />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.products.map((p) => (
                  <li key={p.id} className="min-w-0">
                    <SearchResultProductCard
                      product={p}
                      signedIn={Boolean(authUser)}
                      redirectTo={redirectTo}
                    />
                  </li>
                ))}
              </ul>
            )
          ) : categorySlug ? (
            <NoSearchResultsPanel params={params} hideCategoryVisual />
          ) : (
            <NoSearchResultsPanel params={params} />
          )}

          {/* 2) More to explore — same category only */}
          {categorySlug ? (
            <CategoryDemoGrid
              categorySlug={categorySlug}
              prominence={hasLiveProducts ? "secondary" : "primary"}
            />
          ) : null}

          {/* 3) Related category chips */}
          {categorySlug ? (
            <RelatedCategoryChips categorySlug={categorySlug} query={params.q} />
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
