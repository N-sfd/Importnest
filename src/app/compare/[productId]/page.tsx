import Image from "next/image";
import { Header } from "@/components/Header";
import { BackendSourcesPanel } from "@/components/BackendSourcesPanel";
import { PriorityTabs } from "@/components/PriorityTabs";
import {
  getCompareProduct,
  getCompareRows,
  getProductSourceSummaries,
  minutesSince,
  type CompareFilters,
} from "@/lib/compare-data";
import type { Priority } from "@/lib/types";
import { productImageFor } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const VALID_PRIORITIES: Priority[] = ["best-overall", "lowest-cost", "fastest-delivery", "best-returns"];
const VALID_CONDITIONS: NonNullable<CompareFilters["condition"]>[] = ["new", "open_box", "refurbished", "used"];

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{
    maxBudget?: string;
    condition?: string;
    priority?: string;
    comparable?: string;
    fastDelivery?: string;
  }>;
}) {
  const { productId } = await params;
  const { maxBudget, condition, priority, comparable, fastDelivery } = await searchParams;
  const product = await getCompareProduct(productId);
  if (!product) notFound();

  const filters: CompareFilters = {};
  const parsedBudget = maxBudget ? Number(maxBudget) : undefined;
  if (parsedBudget != null && !Number.isNaN(parsedBudget)) filters.maxBudget = parsedBudget;
  if (condition && VALID_CONDITIONS.includes(condition as never)) {
    filters.condition = condition as CompareFilters["condition"];
  }
  if (fastDelivery === "1") filters.requireFastDelivery = true;
  const hasFilters = filters.maxBudget != null || filters.condition != null || filters.requireFastDelivery === true;
  const initialPriority = priority && VALID_PRIORITIES.includes(priority as Priority) ? (priority as Priority) : undefined;

  const rows = await getCompareRows(productId, hasFilters ? filters : undefined, initialPriority);
  const sources = await getProductSourceSummaries(productId);
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
          <div className="relative h-14 w-14 overflow-hidden rounded-md bg-navy-100">
            <Image
              src={productImageFor(productId)}
              alt={product.modelName}
              fill
              className="object-cover"
              sizes="56px"
              priority
            />
          </div>
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

        {comparable === "1" && (
          <p className="mt-4 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Comparable alternative — not an exact match for your search.
          </p>
        )}

        {hasFilters && rows.length === 0 ? (
          <p className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
            No listings match your budget, condition, or delivery preferences for this product.{" "}
            <a href={`/compare/${productId}`} className="font-medium text-navy-900 underline">
              Clear filters
            </a>{" "}
            to see all offers.
          </p>
        ) : (
          <div className="mt-6">
            <PriorityTabs productId={productId} rows={rows} initialPriority={initialPriority} />
          </div>
        )}

        <BackendSourcesPanel sources={sources} />
      </section>
    </main>
  );
}
