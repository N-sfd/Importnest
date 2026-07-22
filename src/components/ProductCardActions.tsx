import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { ProductCardSaveButton } from "@/components/ProductCardSaveButton";
import { formatConditionLabel } from "@/lib/compare-view";
import type { ProductCardListing } from "@/components/ProductCard";

/**
 * View offers is the one prominent primary CTA, on top; Save/Compare/Cart
 * are a compact, always-visible icon row below it — no hover-reveal or
 * overflow menu, so the same layout works on touch and mouse alike.
 */
export function ProductCardActions({
  productId,
  productName,
  brandName,
  imageSrc,
  href,
  bestListing,
  primaryCtaLabel,
  isSaved,
  signedIn,
  redirectTo,
}: {
  productId: string;
  productName: string;
  brandName: string;
  imageSrc: string;
  href: string;
  bestListing?: ProductCardListing | null;
  primaryCtaLabel: string;
  isSaved: boolean;
  signedIn: boolean;
  redirectTo: string;
}) {
  return (
    <div className="product-card-actions">
      <Link
        href={href}
        className="product-card-action-wide btn-cta flex min-h-10 items-center justify-center px-3 py-2.5 text-center text-sm font-semibold"
      >
        {primaryCtaLabel}
      </Link>
      <div className="product-card-actions-row">
        <ProductCardSaveButton
          productId={productId}
          isSaved={isSaved}
          signedIn={signedIn}
          redirectTo={redirectTo}
        />
        <AddToCompareButton productId={productId} productName={productName} />
        {bestListing ? (
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
        ) : null}
      </div>
    </div>
  );
}
