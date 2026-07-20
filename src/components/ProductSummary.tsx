import Image from "next/image";
import type { ReactNode } from "react";
import { formatFreshness } from "@/lib/freshness";
import { productThumbClass } from "@/lib/images";

/**
 * Compact identity strip for the top of the comparison page — image, brand,
 * name, model number, match status, offer count, and last-checked time, plus
 * whatever Save/alert controls the caller wants to show. Deliberately small:
 * no marketing copy, no oversized imagery. Fields the product doesn't have
 * (e.g. no model number) are omitted rather than shown as a fake placeholder.
 */
export function ProductSummary({
  imageSrc,
  brandName,
  productName,
  modelNumber,
  matchStatusLabel,
  offerCount,
  lastCheckedMinutesAgo,
  lowestTotalKnownCost,
  actions,
}: {
  imageSrc: string;
  brandName: string;
  productName: string;
  modelNumber?: string | null;
  matchStatusLabel: string;
  offerCount: number;
  lastCheckedMinutesAgo: number | null;
  /** Live lowest Total Known Cost across compared offers, when available. */
  lowestTotalKnownCost?: number | null;
  actions: ReactNode;
}) {
  return (
    <section className="panel flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-white sm:h-24 sm:w-24">
        <Image
          src={imageSrc}
          alt={productName}
          fill
          className={productThumbClass(imageSrc)}
          sizes="96px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{brandName}</p>
        <h1 className="truncate text-base font-bold leading-snug text-navy-900 sm:text-lg">
          {productName}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted">
          {modelNumber ? (
            <>
              <span>Model {modelNumber}</span>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span className="font-medium text-navy-900">{matchStatusLabel}</span>
          <span aria-hidden="true">·</span>
          <span>
            {offerCount} {offerCount === 1 ? "offer" : "offers"}
          </span>
          <span aria-hidden="true">·</span>
          <span>{formatFreshness(lastCheckedMinutesAgo)}</span>
        </p>
        {lowestTotalKnownCost != null ? (
          <p className="mt-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Lowest Total Known Cost
            </span>
            <span className="ml-2 text-lg price-text">
              ${lowestTotalKnownCost.toFixed(2)}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    </section>
  );
}
