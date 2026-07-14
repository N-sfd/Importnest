import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { matchProduct, recordSearchSession } from "@/lib/search-data";

export default async function ClarifyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const query = q?.trim() ?? "";

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

  const categoryRecord = category
    ? await prisma.category.findUnique({ where: { slug: category } })
    : null;

  const matchedProductId = await matchProduct(query);
  await recordSearchSession({
    query,
    categoryId: categoryRecord?.id,
    matchedProductId,
  });

  if (matchedProductId) {
    redirect(`/compare/${matchedProductId}`);
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-navy-900">No matching product yet</h1>
        <p className="mt-1 text-sm text-gray-600">
          We couldn&apos;t match &ldquo;{query}&rdquo; to a product we track. Try a different
          name, the exact model number, or a UPC.
        </p>
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
