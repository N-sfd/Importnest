import Image from "next/image";
import Link from "next/link";
import { BackendSourcesPanel } from "@/components/BackendSourcesPanel";
import { PageShell } from "@/components/PageShell";
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

const VALID_PRIORITIES: Priority[] = [
  "best-overall",
  "lowest-cost",
  "fastest-delivery",
  "best-returns",
];
const VALID_CONDITIONS: NonNullable<CompareFilters["condition"]>[] = [
  "new",
  "open_box",
  "refurbished",
  "used",
];

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
  const hasFilters =
    filters.maxBudget != null || filters.condition != null || filters.requireFastDelivery === true;
  const initialPriority =
    priority && VALID_PRIORITIES.includes(priority as Priority)
      ? (priority as Priority)
      : undefined;

  const rows = await getCompareRows(
    productId,
    hasFilters ? filters : undefined,
    initialPriority,
  );
  const sources = await getProductSourceSummaries(productId);
  const bestMatch = product.matches[0];
  const freshest = await prisma.listing.findFirst({
    where: { canonicalProductId: productId },
    orderBy: { freshnessCapturedAt: "desc" },
  });
  const freshnessMinutes = freshest ? minutesSince(freshest.freshnessCapturedAt) : null;
  const confidencePct = bestMatch ? Math.round(bestMatch.confidence * 100) : null;

  return (
    <PageShell>
      <nav className="mb-3 text-xs text-muted">
        <Link href="/" className="text-link hover:underline">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <Link
          href={`/search?category=${product.category.slug}`}
          className="text-link hover:underline"
        >
          {product.category.name}
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-foreground">{product.modelName}</span>
      </nav>

      <section className="panel fade-up p-4 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-white">
            <Image
              src={productImageFor(productId)}
              alt={product.modelName}
              fill
              className="object-contain p-3"
              sizes="(max-width:640px) 100vw, 280px"
              priority
            />
          </div>
          <div>
            <p className="text-sm font-medium text-link">{product.brand.name}</p>
            <h1 className="mt-1 text-xl font-bold leading-snug tracking-tight text-foreground sm:text-2xl">
              {product.modelName}
            </h1>
            {product.modelNumber && (
              <p className="mt-1 text-sm text-muted">Model: {product.modelNumber}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-navy-100 px-3 py-1 text-xs font-semibold text-navy-900">
                {confidencePct != null
                  ? `Exact match · ${confidencePct}%`
                  : "Match pending review"}
              </span>
              {freshnessMinutes != null && (
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted ring-1 ring-border">
                  Refreshed {freshnessMinutes}m ago
                </span>
              )}
            </div>
            {product.configuration && (
              <p className="mt-3 text-sm text-muted">Configuration: {product.configuration}</p>
            )}
            <p className="mt-4 text-sm text-foreground/80">
              {rows.length} buying {rows.length === 1 ? "option" : "options"} across approved
              retailers.
            </p>
          </div>
        </div>
      </section>

      {comparable === "1" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          Comparable alternative — not an exact match for your search.
        </p>
      )}

      <section className="panel mt-4 p-4 sm:p-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Buying options</h2>
        {hasFilters && rows.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface px-4 py-10 text-center">
            <p className="text-sm text-muted">
              No listings match your budget, condition, or delivery preferences.
            </p>
            <Link href={`/compare/${productId}`} className="btn-cta mt-4 inline-block px-5 py-2.5 text-sm">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="mt-4">
            <PriorityTabs productId={productId} rows={rows} initialPriority={initialPriority} />
          </div>
        )}
      </section>

      <BackendSourcesPanel sources={sources} />
    </PageShell>
  );
}
