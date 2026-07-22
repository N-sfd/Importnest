import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { formatConditionLabel } from "@/lib/compare-view";
import type { ProductCardListing } from "@/components/ProductCard";

/**
 * Compact, always-visible icon row (Compare, Cart — Save lives on the image
 * corner, at zero row height) plus one prominent primary CTA below. Replaces
 * a hover-reveal-on-desktop / "···" overflow-on-mobile pattern that hid these
 * controls behind an interaction and didn't help card height anyway once
 * revealed — a flat icon row is shorter and works the same on touch and mouse.
 */
export function ProductCardActions({
  productId,
  productName,
  brandName,
  imageSrc,
  href,
  bestListing,
  primaryCtaLabel,
}: {
  productId: string;
  productName: string;
  brandName: string;
  imageSrc: string;
  href: string;
  bestListing?: ProductCardListing | null;
  primaryCtaLabel: string;
}) {
  return (
    <div className="product-card-actions">
      <div className="product-card-actions-row">
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
      <Link
        href={href}
        className="product-card-action-wide btn-cta flex min-h-10 items-center justify-center px-3 py-2.5 text-center text-sm font-semibold"
      >
        {primaryCtaLabel}
      </Link>
    </div>
  );
}
