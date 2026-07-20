import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { formatConditionLabel } from "@/lib/compare-view";
import { productThumbClass } from "@/lib/images";
import { saveProductAction, unsaveProductAction } from "@/lib/saved-actions";
import type { BestDealItem } from "@/lib/best-deals";

export type DealProductCardProps = {
  productId: string;
  href: string;
  imageSrc: string;
  productName: string;
  brandName: string;
  currentTotal: number;
  previousTotal: number | null;
  dealBadge: string;
  /** Real percent drop vs a prior day's total — drives the louder badge treatment when present. */
  discountPercent: number | null;
  isSaved: boolean;
  signedIn: boolean;
  bestListing: BestDealItem["bestListing"];
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-6.7-4.35-9.33-7.6C.5 10.9 1.1 7.4 3.7 5.7 5.7 4.4 8.2 4.8 10 6.4L12 8.2l2-1.8c1.8-1.6 4.3-2 6.3-.7 2.6 1.7 3.2 5.2 1.03 7.7C18.7 16.65 12 21 12 21z"
      />
    </svg>
  );
}

/** Compact Best Deal card with optional save heart. */
export function DealProductCard({
  productId,
  href,
  imageSrc,
  productName,
  brandName,
  currentTotal,
  previousTotal,
  dealBadge,
  discountPercent,
  isSaved,
  signedIn,
  bestListing,
}: DealProductCardProps) {
  return (
    <div className="relative h-full">
      <Link
        href={href}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-panel shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden bg-white">
          <Image
            src={imageSrc}
            alt={productName}
            fill
            className={`${productThumbClass(imageSrc)} transition duration-300 group-hover:scale-[1.03]`}
            sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 16vw"
          />
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              discountPercent != null ? "badge-savings" : "bg-navy-900 text-white"
            }`}
          >
            {discountPercent != null ? `Save ${discountPercent}%` : dealBadge}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-1 p-3 pr-10">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-navy-900 group-hover:text-link">
            {productName}
          </p>
          <p className="text-[11px] text-muted">{brandName}</p>
          <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-1">
            <p className="text-base price-text">${currentTotal.toFixed(2)}</p>
            {previousTotal != null ? (
              <p className="text-xs tabular-nums text-muted line-through">
                ${previousTotal.toFixed(2)}
              </p>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5">
        {signedIn ? (
          <form
            action={
              isSaved
                ? unsaveProductAction.bind(null, productId, "/")
                : saveProductAction.bind(null, productId, "/")
            }
          >
            <button
              type="submit"
              aria-label={isSaved ? `Unsave ${productName}` : `Save ${productName}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-panel/95 shadow-sm transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSaved ? "text-cta" : "text-navy-900"
              }`}
            >
              <HeartIcon filled={isSaved} />
            </button>
          </form>
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(href)}`}
            aria-label={`Sign in to save ${productName}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-panel/95 text-navy-900 shadow-sm transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HeartIcon filled={false} />
          </Link>
        )}
        <AddToCompareButton productId={productId} productName={productName} />
        <AddToCartButton
          compact
          listingId={bestListing.listingId}
          productId={productId}
          title={productName}
          brand={brandName}
          imageUrl={imageSrc}
          retailerName={bestListing.sourceName}
          condition={formatConditionLabel(bestListing.condition)}
          itemPrice={bestListing.price}
          shipping={bestListing.shipping}
          fees={bestListing.fees}
          totalKnownCost={bestListing.price + bestListing.shipping + bestListing.fees}
        />
      </div>
    </div>
  );
}
