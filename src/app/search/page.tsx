import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { SearchNoMatch } from "@/components/SearchNoMatch";
import { prisma } from "@/lib/prisma";
import { finalizeSearch, matchProduct } from "@/lib/search-data";
import { buildIntent, isExplicitIdentifierQuery, paramsToRecord, type SearchFlowParams } from "@/lib/search-intent";

export default async function SearchEntryPage({
  searchParams,
}: {
  searchParams: Promise<SearchFlowParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  if (!query) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-bold text-navy-900">What are you shopping for?</h1>
          <p className="mt-1 text-sm text-gray-600">
            Enter a product name, model number, or UPC to compare offers.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Back to search
          </Link>
        </section>
      </main>
    );
  }

  // Exact model/UPC/URL searches go straight to a result — no clarification detour.
  const directMatch = await matchProduct(query);
  const skipClarification = isExplicitIdentifierQuery(query) || directMatch !== null;

  if (skipClarification) {
    const categoryRecord = params.category
      ? await prisma.category.findUnique({ where: { slug: params.category } })
      : null;

    const result = await finalizeSearch(query, buildIntent(query, params), {
      directMatch,
      categoryId: categoryRecord?.id,
    });

    if (result.kind === "redirect") {
      const qs = result.searchParams.toString();
      redirect(`/compare/${result.productId}${qs ? `?${qs}` : ""}`);
    }

    return <SearchNoMatch query={query} comparableCandidates={result.comparableCandidates} />;
  }

  // Ambiguous query — hand off to the clarification flow.
  const qs = new URLSearchParams(paramsToRecord(params));
  redirect(`/search/clarify?${qs.toString()}`);
}
