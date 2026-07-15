import { PageShell } from "@/components/PageShell";
import { MobileFiltersSheet } from "@/components/MobileFiltersSheet";
import { NoSearchResultsPanel } from "@/components/NoSearchResultsPanel";
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

          <SearchResultsToolbar params={params} total={results.total} sort={sort} />

          {results.products.length === 0 ? (
            <NoSearchResultsPanel params={params} />
          ) : (
            <ul className="space-y-3">
              {results.products.map((p) => (
                <li key={p.id}>
                  <SearchResultProductCard
                    product={p}
                    signedIn={Boolean(authUser)}
                    redirectTo={redirectTo}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  );
}
