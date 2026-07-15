import Image from "next/image";
import Link from "next/link";
import { BackendSourcesPanel } from "@/components/BackendSourcesPanel";
import { CompareMobileStickyActions } from "@/components/CompareMobileStickyActions";
import { Freshness } from "@/components/Freshness";
import { PageShell } from "@/components/PageShell";
import { PriceHistorySection } from "@/components/PriceHistorySection";
import { PriorityTabs } from "@/components/PriorityTabs";
import {
  getCompareProduct,
  getCompareRows,
  getProductPriceHistory,
  getProductSourceSummaries,
  minutesSince,
  totalKnownCost,
  type CompareFilters,
} from "@/lib/compare-data";
import type { Priority } from "@/lib/types";
import { productImageFor } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import {
  removeAlertAction,
  saveProductAction,
  setPriceAlertAction,
  toggleAlertActiveAction,
  unsaveProductAction,
} from "@/lib/saved-actions";
import { getSaveAndAlertState } from "@/lib/saved-data";

const VALID_PRIORITIES: Priority[] = [
  "best-overall",
  "lowest-cost",
  "fastest-delivery",
  "best-condition",
  "best-protection",
];

function parsePriority(raw: string | undefined): Priority | undefined {
  if (!raw) return undefined;
  if (raw === "best-returns") return "best-protection";
  if (VALID_PRIORITIES.includes(raw as Priority)) return raw as Priority;
  return undefined;
}

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

  const redirectTo = `/compare/${productId}${
    priority || maxBudget || condition || comparable || fastDelivery
      ? `?${new URLSearchParams(
          Object.entries({
            priority,
            maxBudget,
            condition,
            comparable,
            fastDelivery,
          }).filter(([, v]) => v) as [string, string][],
        ).toString()}`
      : ""
  }`;
  const authUser = await getAuthUser();
  const saveState = authUser ? await getSaveAndAlertState(authUser.id, productId) : null;

  const filters: CompareFilters = {};
  const parsedBudget = maxBudget ? Number(maxBudget) : undefined;
  if (parsedBudget != null && !Number.isNaN(parsedBudget)) filters.maxBudget = parsedBudget;
  if (condition && VALID_CONDITIONS.includes(condition as never)) {
    filters.condition = condition as CompareFilters["condition"];
  }
  if (fastDelivery === "1") filters.requireFastDelivery = true;
  const hasFilters =
    filters.maxBudget != null || filters.condition != null || filters.requireFastDelivery === true;
  const initialPriority = parsePriority(priority);

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
  const matchTypeLabel =
    bestMatch?.type === "comparable"
      ? "Comparable product"
      : bestMatch?.type === "exact"
        ? "Exact match"
        : null;
  const lowestKnown =
    rows.length > 0 ? Math.min(...rows.map((r) => totalKnownCost(r.listing))) : null;
  const sourceCount = new Set(rows.map((r) => r.listing.sourceId)).size;
  const suggestedAlert =
    lowestKnown != null ? Math.max(1, Math.floor(lowestKnown * 0.95)).toFixed(2) : "";
  const priceHistory = await getProductPriceHistory(productId, lowestKnown);

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
            {product.modelNumber ? (
              <p className="mt-1 text-sm text-muted">Model: {product.modelNumber}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-navy-100 px-3 py-1 text-xs font-semibold text-navy-900">
                {matchTypeLabel && confidencePct != null
                  ? `${matchTypeLabel} · ${confidencePct}%`
                  : confidencePct != null
                    ? `Exact match · ${confidencePct}%`
                    : "Match pending review"}
              </span>
              <span className="rounded-full bg-surface px-3 py-1 ring-1 ring-border">
                <Freshness minutesAgo={freshnessMinutes} />
              </span>
            </div>
            {product.configuration ? (
              <p className="mt-3 text-sm text-muted">Configuration: {product.configuration}</p>
            ) : null}
            <p className="mt-4 text-sm text-foreground/80">
              {rows.length} {rows.length === 1 ? "offer" : "offers"} from {sourceCount}{" "}
              {sourceCount === 1 ? "source" : "sources"}
              {lowestKnown != null ? (
                <>
                  {" "}
                  · From{" "}
                  <span className="font-bold tabular-nums text-price">
                    ${lowestKnown.toFixed(2)}
                  </span>
                </>
              ) : null}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              {!authUser ? (
                <Link
                  href={`/login?next=${encodeURIComponent(redirectTo)}`}
                  className="text-sm font-medium text-link hover:underline"
                >
                  Sign in to save this product or set a price alert
                </Link>
              ) : (
                <>
                  <form
                    action={
                      saveState?.isSaved
                        ? unsaveProductAction.bind(null, productId, redirectTo)
                        : saveProductAction.bind(null, productId, redirectTo)
                    }
                  >
                    <button
                      type="submit"
                      className={
                        saveState?.isSaved
                          ? "min-h-11 rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium text-gray-700 hover:border-navy-800"
                          : "btn-cta min-h-11 px-4 py-2 text-sm"
                      }
                    >
                      {saveState?.isSaved ? "Saved ✓" : "Save this product"}
                    </button>
                  </form>

                  {saveState?.alert ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                      <span>
                        Alert: notify below{" "}
                        <span className="font-semibold text-foreground">
                          ${saveState.alert.threshold}
                        </span>
                        {lowestKnown != null ? (
                          <>
                            {" "}
                            · current{" "}
                            <span className="font-semibold text-foreground">
                              ${lowestKnown.toFixed(2)}
                            </span>
                          </>
                        ) : null}
                        {!saveState.alert.isActive ? " (paused)" : null}
                      </span>
                      <form
                        action={toggleAlertActiveAction.bind(
                          null,
                          productId,
                          "price-drop",
                          redirectTo,
                        )}
                      >
                        <button
                          type="submit"
                          className="min-h-11 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-navy-800"
                        >
                          {saveState.alert.isActive ? "Pause" : "Resume"}
                        </button>
                      </form>
                      <form
                        action={removeAlertAction.bind(null, productId, "price-drop", redirectTo)}
                      >
                        <button
                          type="submit"
                          className="min-h-11 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-navy-800"
                        >
                          Remove alert
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form
                      action={setPriceAlertAction.bind(null, productId, redirectTo)}
                      className="flex items-center gap-2"
                    >
                      <label htmlFor="threshold" className="text-sm text-muted">
                        Notify below $
                      </label>
                      <input
                        id="threshold"
                        name="threshold"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        defaultValue={suggestedAlert}
                        placeholder="0.00"
                        className="min-h-11 w-24 rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button
                        type="submit"
                        className="min-h-11 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-navy-800"
                      >
                        Set price alert
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {comparable === "1" ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          Comparable product — not an exact match for your search.
        </p>
      ) : null}

      <PriceHistorySection summary={priceHistory} />

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

      <CompareMobileStickyActions
        productId={productId}
        signedIn={Boolean(authUser)}
        isSaved={Boolean(saveState?.isSaved)}
        hasAlert={Boolean(saveState?.alert)}
        redirectTo={redirectTo}
        viewOfferHref={rows[0]?.listing.url ? `/go/${rows[0].listing.id}` : null}
        suggestedAlert={suggestedAlert}
      />
    </PageShell>
  );
}
