import { Header } from "@/components/Header";
import { PriorityTabs } from "@/components/PriorityTabs";
import { getCompareProduct, getCompareRows, minutesSince } from "@/lib/compare-data";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getCompareProduct(productId);
  if (!product) notFound();

  const rows = await getCompareRows(productId);
  const bestMatch = product.matches[0];
  const freshest = await prisma.listing.findFirst({
    where: { canonicalProductId: productId },
    orderBy: { freshnessCapturedAt: "desc" },
  });
  const freshnessMinutes = freshest ? minutesSince(freshest.freshnessCapturedAt) : null;
  const confidencePct = bestMatch ? Math.round(bestMatch.confidence * 100) : null;

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-md bg-navy-100" />
          <div>
            <h1 className="text-xl font-bold text-navy-900">{product.modelName}</h1>
            <p className="text-sm text-gray-500">
              {confidencePct != null
                ? `Exact product match: ${confidencePct}% confidence`
                : "Product match pending review"}
              {freshnessMinutes != null ? ` · Last refreshed ${freshnessMinutes} minutes ago` : ""}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <PriorityTabs productId={productId} rows={rows} />
        </div>
      </section>
    </main>
  );
}
