import { ProductImage } from "@/components/ProductImage";
import type { ReactNode } from "react";
import { formatFreshness, needsFreshnessWarning, freshnessWarningLabel } from "@/lib/freshness";

function MatchBadge({ label }: { label: string }) {
  const lower = label.toLowerCase();
  const tone =
    lower.startsWith("exact match")
      ? "badge-savings"
      : lower.startsWith("comparable")
        ? "bg-amber-100 text-amber-900"
        : "bg-surface text-muted border border-border";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}

/**
 * Product identity strip for the comparison page — image, brand, name, model,
 * match badge, offer/source counts, freshness, and Save / alert / cart / compare
 * actions. Missing fields are omitted; never invents prices or ratings.
 */
export function ProductSummary({
  imageSrc,
  brandName,
  productName,
  modelNumber,
  matchStatusLabel,
  offerCount,
  sourceCount,
  lastCheckedMinutesAgo,
  lowestTotalKnownCost,
  actions,
  categorySlug,
}: {
  imageSrc: string;
  brandName: string;
  productName: string;
  modelNumber?: string | null;
  matchStatusLabel: string;
  offerCount: number;
  /** Distinct approved sources with a listing — omit when unknown. */
  sourceCount?: number | null;
  lastCheckedMinutesAgo: number | null;
  /** Live lowest Total Known Cost across compared offers, when available. */
  lowestTotalKnownCost?: number | null;
  actions: ReactNode;
  categorySlug?: string | null;
}) {
  const showFreshnessWarning = needsFreshnessWarning(lastCheckedMinutesAgo);
  const modelText = modelNumber?.trim() || null;

  return (
    <section className="panel compare-product-summary p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <ProductImage
          src={imageSrc}
          alt={productName}
          title={productName}
          category={categorySlug}
          size="summary"
          priority
          sizes="144px"
        />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{brandName}</p>
          <h1 className="mt-0.5 text-lg font-bold leading-snug text-navy-900 sm:text-xl">
            {productName}
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <MatchBadge label={matchStatusLabel} />
            {modelText ? (
              <span className="text-sm text-muted">
                Model <span className="font-medium text-navy-900">{modelText}</span>
              </span>
            ) : null}
          </div>

          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-sm text-muted sm:justify-start">
            {offerCount > 0 ? (
              <span>
                {offerCount} {offerCount === 1 ? "offer" : "offers"}
              </span>
            ) : (
              <span>No offers</span>
            )}
            {sourceCount != null && sourceCount > 0 ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {sourceCount} {sourceCount === 1 ? "source" : "sources"}
                </span>
              </>
            ) : null}
            <span aria-hidden="true">·</span>
            <span>{formatFreshness(lastCheckedMinutesAgo)}</span>
          </p>

          {showFreshnessWarning ? (
            <p className="mt-1 text-xs font-medium text-amber-800">
              {freshnessWarningLabel(lastCheckedMinutesAgo)}
            </p>
          ) : null}

          {lowestTotalKnownCost != null ? (
            <p className="mt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                From · Total Known Cost
              </span>
              <span className="ml-2 text-xl price-text sm:text-2xl">
                ${lowestTotalKnownCost.toFixed(2)}
              </span>
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:max-w-xs sm:justify-end lg:max-w-sm">
          {actions}
        </div>
      </div>
    </section>
  );
}
