import Link from "next/link";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import type { SearchIntent } from "@/lib/search-intent";

export async function SearchNoMatch({
  query,
  intent,
  comparableCandidates,
}: {
  query: string;
  intent?: Partial<SearchIntent>;
  comparableCandidates: string[];
}) {
  const products =
    comparableCandidates.length > 1
      ? await prisma.canonicalProduct.findMany({
          where: { id: { in: comparableCandidates } },
          include: { brand: true },
        })
      : [];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {products.length > 1 ? (
          <>
            <h1 className="text-2xl font-bold text-navy-900">A few comparable options</h1>
            <p className="mt-1 text-sm text-gray-600">
              We couldn&apos;t find an exact match for &ldquo;{query}&rdquo;, but these are
              comparable alternatives.
            </p>
            <div className="mt-6 space-y-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/compare/${p.id}?comparable=1`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-navy-800"
                >
                  <div>
                    <p className="font-semibold text-navy-900">{p.modelName}</p>
                    <p className="text-sm text-gray-500">{p.brand.name}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                    Comparable alternative
                  </span>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-navy-900">No matching product yet</h1>
            <p className="mt-1 text-sm text-gray-600">
              We couldn&apos;t match &ldquo;{query}&rdquo; to a product we track. Try a different
              name, the exact model number, or a UPC.
            </p>
          </>
        )}
        {intent && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              What we captured
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {intent.budgetMax != null && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-navy-900 ring-1 ring-gray-200">
                  Under ${intent.budgetMax}
                </span>
              )}
              {intent.condition && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-navy-900 ring-1 ring-gray-200">
                  Condition: {intent.condition.replace(/_/g, " ")}
                </span>
              )}
              {intent.allowComparableAlternatives != null && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-navy-900 ring-1 ring-gray-200">
                  {intent.allowComparableAlternatives ? "Comparable alternatives OK" : "Exact model only"}
                </span>
              )}
              {intent.deliveryBy && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-navy-900 ring-1 ring-gray-200">
                  Needed by: {intent.deliveryBy}
                </span>
              )}
            </div>
          </div>
        )}
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Try another search
        </Link>
      </section>
    </main>
  );
}
