import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { SearchNoMatch } from "@/components/SearchNoMatch";
import { getOrCreateAppUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rethrowIfNextControlFlow } from "@/lib/safe-db";
import { classifyAndResolve, finalizeSearch } from "@/lib/search-data";
import { buildIntent, paramsToRecord, type SearchFlowParams } from "@/lib/search-intent";

export const dynamic = "force-dynamic";

export default async function SearchEntryPage({
  searchParams,
}: {
  searchParams: Promise<SearchFlowParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  if (!query) {
    if (params.category) {
      const qs = new URLSearchParams({ category: params.category });
      redirect(`/search/results?${qs.toString()}`);
    }

    return (
      <PageShell>
        <div className="panel px-6 py-12 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            What are you shopping for?
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Enter a product name, model number, or UPC to compare offers from approved retailers.
          </p>
          <Link href="/" className="btn-cta mt-6 inline-block px-5 py-2.5 text-sm">
            Back to home search
          </Link>
        </div>
      </PageShell>
    );
  }

  // Only a query the classifier is confident is a specific product (exact
  // name/model, brand+model, or a validated UPC/EAN/GTIN/ISBN/ASIN) skips
  // clarification. A generic category word like "dishwasher" must not — even
  // if it happens to be a substring of some catalog product's name.
  let classification;
  let directMatch: string | null = null;
  try {
    ({ classification, directMatch } = await classifyAndResolve(query));
  } catch (err) {
    rethrowIfNextControlFlow(err);
    console.error("[search] classifyAndResolve failed; falling back to results", err);
    redirect(`/search/results?${new URLSearchParams(paramsToRecord(params)).toString()}`);
  }

  if (classification.classification !== "exact_product") {
    redirect(`/search/clarify?${new URLSearchParams(paramsToRecord(params)).toString()}`);
  }

  const intent = buildIntent(query, params);
  let result: Awaited<ReturnType<typeof finalizeSearch>>;
  try {
    const categoryRecord = params.category
      ? await prisma.category.findUnique({ where: { slug: params.category } })
      : null;
    const user = await getOrCreateAppUser();
    result = await finalizeSearch(query, intent, {
      directMatch,
      categoryId: categoryRecord?.id,
      userId: user?.id ?? null,
    });
  } catch (err) {
    rethrowIfNextControlFlow(err);
    console.error("[search] exact-product path failed; falling back to results", err);
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
