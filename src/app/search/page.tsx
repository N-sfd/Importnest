import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { SearchNoMatch } from "@/components/SearchNoMatch";
import { getOrCreateAppUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classifyAndResolve, finalizeSearch } from "@/lib/search-data";
import { buildIntent, paramsToRecord, type SearchFlowParams } from "@/lib/search-intent";

export default async function SearchEntryPage({
  searchParams,
}: {
  searchParams: Promise<SearchFlowParams>;
}) {
  const start = performance.now();
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
  const { classification, directMatch } = await classifyAndResolve(query);
  const skipClarification = classification.classification === "exact_product";

  if (skipClarification) {
    const categoryRecord = params.category
      ? await prisma.category.findUnique({ where: { slug: params.category } })
      : null;
    const user = await getOrCreateAppUser();

    const intent = buildIntent(query, params);
    const result = await finalizeSearch(query, intent, {
      directMatch,
      categoryId: categoryRecord?.id,
      userId: user?.id ?? null,
    });

    console.info(`[perf] search.redirect(fast-path) ${(performance.now() - start).toFixed(1)}ms`);
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

  // Ambiguous query — hand off to the clarification flow.
  const qs = new URLSearchParams(paramsToRecord(params));
  console.info(`[perf] search.redirect(to-clarify) ${(performance.now() - start).toFixed(1)}ms`);
  redirect(`/search/clarify?${qs.toString()}`);
}
