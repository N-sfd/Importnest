import Link from "next/link";
import { BackendSourcesPanel } from "@/components/BackendSourcesPanel";
import { CompareMobileStickyActions } from "@/components/CompareMobileStickyActions";
import { PageShell } from "@/components/PageShell";
import { PriceHistorySection } from "@/components/PriceHistorySection";
import { PriorityTabs } from "@/components/PriorityTabs";
import { ProductSummary } from "@/components/ProductSummary";
import {
  PRIORITY_LABELS,
  buildRecommendationPanel,
  getCompareProduct,
  getCompareRows,
  getProductPriceHistory,
  getProductSourceSummaries,
  minutesSince,
  supportsBestProtection,
  totalKnownCost,
  type CompareFilters,
} from "@/lib/compare-data";
import { formatMatchStatus } from "@/lib/compare-view";
import type { Priority } from "@/lib/types";
import { productImageFor } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getSaveAndAlertState } from "@/lib/saved-data";
import { ProductActions } from "@/components/ProductActions";

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
  const requestedPriority = parsePriority(priority);
  // "Best protection" only ranks by a real signal — fall back to "Best overall"
  // when nothing in this product's compared offers has structured protection data.
  const bestProtectionSupported = await supportsBestProtection(productId);
  const effectivePriority: Priority =
    requestedPriority === "best-protection" && !bestProtectionSupported
      ? "best-overall"
      : (requestedPriority ?? "best-overall");

  // Ranking is computed once, here, server-side — the priority tabs below
  // only navigate between pre-ranked URLs, they never re-sort in the browser.
  const rows = await getCompareRows(
    productId,
    hasFilters ? filters : undefined,
    effectivePriority,
  );
  const panel = buildRecommendationPanel(rows, effectivePriority);
  const priorityOptions = VALID_PRIORITIES.filter(
    (key) => key !== "best-protection" || bestProtectionSupported,
  ).map((key) => ({
    key,
    label: PRIORITY_LABELS[key],
    href: `/compare/${productId}?${new URLSearchParams(
      Object.entries({ priority: key, maxBudget, condition, comparable, fastDelivery }).filter(
        ([, v]) => v,
      ) as [string, string][],
    ).toString()}`,
  }));
  const sources = await getProductSourceSummaries(productId);
  const bestMatch = product.matches[0];
  const freshest = await prisma.listing.findFirst({
    where: { canonicalProductId: productId },
    orderBy: { freshnessCapturedAt: "desc" },
  });
  const freshnessMinutes = freshest ? minutesSince(freshest.freshnessCapturedAt) : null;
  const confidencePct = bestMatch ? Math.round(bestMatch.confidence * 100) : null;
  const matchStatusLabel = formatMatchStatus(bestMatch?.type, confidencePct);
  const lowestKnown =
    rows.length > 0 ? Math.min(...rows.map((r) => totalKnownCost(r.listing))) : null;
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

      <ProductSummary
        imageSrc={productImageFor(productId)}
        brandName={product.brand.name}
        productName={product.modelName}
        modelNumber={product.modelNumber}
        matchStatusLabel={matchStatusLabel}
        offerCount={rows.length}
        lastCheckedMinutesAgo={freshnessMinutes}
        actions={
          !authUser ? (
            <Link
              href={`/login?next=${encodeURIComponent(redirectTo)}`}
              className="text-sm font-medium text-link hover:underline"
            >
              Sign in to save this product or set a price alert
            </Link>
          ) : (
            <ProductActions
              productId={productId}
              redirectTo={redirectTo}
              isSaved={Boolean(saveState?.isSaved)}
              alert={saveState?.alert ?? null}
              suggestedAlert={suggestedAlert}
              currentLowestPrice={lowestKnown}
            />
          )
        }
      />

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
            <PriorityTabs
              productId={productId}
              rows={rows}
              priority={effectivePriority}
              priorityOptions={priorityOptions}
              panel={panel}
            />
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
