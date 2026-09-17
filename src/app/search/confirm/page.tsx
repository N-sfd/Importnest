import { redirect } from "next/navigation";
import { SearchConfirmation } from "@/components/SearchConfirmation";
import { SearchNoMatch } from "@/components/SearchNoMatch";
import { getOrCreateAppUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rethrowIfNextControlFlow } from "@/lib/safe-db";
import { finalizeSearch } from "@/lib/search-data";
import { buildIntent, paramsToRecord, type SearchFlowParams } from "@/lib/search-intent";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<SearchFlowParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  if (!query) {
    redirect("/search");
  }

  const intent = buildIntent(query, params);
  let categoryRecord: { id: string; name: string } | null = null;
  try {
    categoryRecord = params.category
      ? await prisma.category.findUnique({ where: { slug: params.category } })
      : null;
  } catch (err) {
    console.error("[confirm] category lookup unavailable", err);
  }

  if (!params.confirmed) {
    return (
      <SearchConfirmation
        intent={intent}
        currentParams={paramsToRecord(params)}
        categoryLabel={categoryRecord?.name}
      />
    );
  }

  let result: Awaited<ReturnType<typeof finalizeSearch>>;
  try {
    const user = await getOrCreateAppUser();
    result = await finalizeSearch(query, intent, {
      directMatch: null, // clarification only reaches here for queries that never had a direct match
      sessionId: params.sid,
      categoryId: categoryRecord?.id,
      userId: user?.id ?? null,
    });
  } catch (err) {
    rethrowIfNextControlFlow(err);
    console.error("[confirm] finalizeSearch failed; falling back to results", err);
    redirect(`/search/results?${new URLSearchParams(paramsToRecord(params)).toString()}`);
  }

  if (result.kind === "redirect") {
    const qs = result.searchParams.toString();
    redirect(`/compare/${result.productId}${qs ? `?${qs}` : ""}`);
  }

  if (result.kind === "results") {
    redirect(`/search/results?${result.searchParams.toString()}`);
  }

  return (
    <SearchNoMatch
      query={query}
      intent={intent}
      comparableCandidates={result.comparableCandidates}
      currentParams={params}
    />
  );
}
