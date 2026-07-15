import { redirect } from "next/navigation";
import { SearchConfirmation } from "@/components/SearchConfirmation";
import { SearchNoMatch } from "@/components/SearchNoMatch";
import { getOrCreateAppUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { finalizeSearch } from "@/lib/search-data";
import { buildIntent, paramsToRecord, type SearchFlowParams } from "@/lib/search-intent";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<SearchFlowParams>;
}) {
  const start = performance.now();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  if (!query) {
    redirect("/search");
  }

  const intent = buildIntent(query, params);
  const categoryRecord = params.category
    ? await prisma.category.findUnique({ where: { slug: params.category } })
    : null;

  if (!params.confirmed) {
    return (
      <SearchConfirmation
        intent={intent}
        currentParams={paramsToRecord(params)}
        categoryLabel={categoryRecord?.name}
      />
    );
  }

  const user = await getOrCreateAppUser();
  const result = await finalizeSearch(query, intent, {
    directMatch: null, // clarification only reaches here for queries that never had a direct match
    sessionId: params.sid,
    categoryId: categoryRecord?.id,
    userId: user?.id ?? null,
  });

  console.info(`[perf] search.confirmToCompare ${(performance.now() - start).toFixed(1)}ms`);
  if (result.kind === "redirect") {
    const qs = result.searchParams.toString();
    redirect(`/compare/${result.productId}${qs ? `?${qs}` : ""}`);
  }

  if (result.kind === "results") {
    redirect(`/search/results?${result.searchParams.toString()}`);
  }

  return <SearchNoMatch query={query} intent={intent} comparableCandidates={result.comparableCandidates} />;
}
