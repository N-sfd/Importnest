import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { BackendSourcesPanel } from "@/components/BackendSourcesPanel";
import { ComparisonMethodologyPanel } from "@/components/ComparisonMethodologyPanel";
import { TrackProductView } from "@/components/TrackProductView";
import { CompareMobileStickyActions } from "@/components/CompareMobileStickyActions";
import { PageShell } from "@/components/PageShell";
import { PopularComparisonCard } from "@/components/PopularComparisonCard";
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
import { formatConditionLabel, formatMatchStatus } from "@/lib/compare-view";
import { isPublicApprovedSource } from "@/lib/approved-sources";
import { getRelatedProducts } from "@/lib/related-products";
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
  let savedIds = new Set<string>();
  if (authUser) {
    const saved = await prisma.savedProduct.findMany({
      where: { userId: authUser.id },
      select: { canonicalProductId: true },
      take: 50,
    });
    savedIds = new Set(saved.map((s) => s.canonicalProductId));
  }
  const relatedProducts = await getRelatedProducts(productId, product.categoryId, 4, savedIds);

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
  const visibleSources = sources.filter((s) => isPublicApprovedSource(s.sourceId));
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

  // Top-ranked listing snapshot for the identity-strip Add to cart button —
  // omitted entirely (no button) when there are no approved offers at all.
  const topListing = rows[0]?.listing;
  const productImage = productImageFor(productId, product.category.slug, product.modelName);
  const summaryCartItem = topListing
    ? {
        listingId: topListing.id,
        productId,
        title: product.modelName,
        brand: product.brand.name,
        imageUrl: productImage,
        retailerName: topListing.sourceName,
        condition: formatConditionLabel(topListing.condition),
        itemPrice: topListing.price,
        shipping: topListing.shipping,
        fees: topListing.mandatoryFees,
        totalKnownCost: totalKnownCost(topListing),
      }
    : undefined;

  const summaryActions = (
    <div className="flex flex-wrap items-start justify-center gap-2 sm:justify-end">
      {!authUser ? (
        <>
          {summaryCartItem ? <AddToCartButton {...summaryCartItem} /> : null}
          <AddToCompareButton productId={productId} productName={product.modelName} labeled />
          <Link
            href={`/login?next=${encodeURIComponent(redirectTo)}`}
            className="inline-flex min-h-11 items-center text-sm font-medium text-link hover:underline"
          >
            Sign in to save or set a price alert
          </Link>
        </>
      ) : (
        <>
          <ProductActions
            productId={productId}
            redirectTo={redirectTo}
            isSaved={Boolean(saveState?.isSaved)}
            alert={saveState?.alert ?? null}
            suggestedAlert={suggestedAlert}
            currentLowestPrice={lowestKnown}
            cartItem={summaryCartItem}
          />
          <AddToCompareButton productId={productId} productName={product.modelName} labeled />
        </>
      )}
    </div>
  );

  return (
    <PageShell>
      <TrackProductView
        productId={productId}
        productName={product.modelName}
        brandName={product.brand.name}
        imageSrc={productImage}
      />
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
        imageSrc={productImage}
        brandName={product.brand.name}
        productName={product.modelName}
        modelNumber={product.modelNumber}
        matchStatusLabel={matchStatusLabel}
        offerCount={rows.length}
        sourceCount={new Set(rows.map((r) => r.listing.sourceId)).size}
        lastCheckedMinutesAgo={freshnessMinutes}
        lowestTotalKnownCost={lowestKnown}
        categorySlug={product.category.slug}
        actions={summaryActions}
      />

      {comparable === "1" ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          Comparable product — not an exact match for your search.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,20rem)] lg:items-start">
        <div className="min-w-0 space-y-4">
          <section className="panel p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">Buying options</h2>
                <p className="mt-1 text-sm text-muted">
                  Ranked by Total Known Cost and your selected priority — costs break down per offer.
                </p>
              </div>
            </div>
            {hasFilters && rows.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface px-4 py-10 text-center">
                <p className="text-sm text-muted">
                  No listings match your budget, condition, or delivery preferences.
                </p>
                <Link
                  href={`/compare/${productId}`}
                  className="btn-cta mt-4 inline-block px-5 py-2.5 text-sm"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="mt-4">
                <PriorityTabs
                  productId={productId}
                  productName={product.modelName}
                  brandName={product.brand.name}
                  productImageSrc={productImage}
                  rows={rows}
                  priority={effectivePriority}
                  priorityOptions={priorityOptions}
                  panel={panel}
                />
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ComparisonMethodologyPanel compact />
          <PriceHistorySection summary={priceHistory} hideWhenEmpty />
          {visibleSources.length > 0 ? <BackendSourcesPanel sources={sources} /> : null}
        </aside>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-navy-900">Related alternatives</h2>
          <p className="mt-1 text-sm text-muted">Other approved products in {product.category.name}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <li key={item.productId} className="min-w-0">
                <PopularComparisonCard item={item} signedIn={Boolean(authUser)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CompareMobileStickyActions
        productId={productId}
        productName={product.modelName}
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
