"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { PriceAlertModule } from "@/components/PriceAlertModule";
import { formatConditionLabel } from "@/lib/compare-view";
import type { ProductCardListing } from "@/components/ProductCard";

type PriceAlertProps = {
  suggestedAlert: string;
  currentLowestPrice: number | null;
  alert?: { threshold: string | null; isActive: boolean } | null;
};

/**
 * Single primary CTA + secondary Compare/Cart.
 * Desktop: secondary actions appear on card hover / focus-within.
 * Mobile: overflow menu (···) for secondary actions.
 */
export function ProductCardActions({
  productId,
  productName,
  brandName,
  imageSrc,
  href,
  bestListing,
  primaryCtaLabel,
  signedIn,
  redirectTo,
  freshnessMinutesAgo,
  priceAlert,
}: {
  productId: string;
  productName: string;
  brandName: string;
  imageSrc: string;
  href: string;
  bestListing?: ProductCardListing | null;
  primaryCtaLabel: string;
  signedIn: boolean;
  redirectTo: string;
  freshnessMinutesAgo?: number | null;
  priceAlert?: PriceAlertProps | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onPointer(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [menuOpen]);

  const secondary = (
    <>
      <AddToCompareButton productId={productId} productName={productName} labeled />
      {bestListing ? (
        <AddToCartButton
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
          label="Add to cart"
        />
      ) : null}
      {signedIn && priceAlert ? (
        <PriceAlertModule
          productId={productId}
          redirectTo={redirectTo}
          suggestedAlert={priceAlert.suggestedAlert}
          currentLowestPrice={priceAlert.currentLowestPrice}
          lastCheckedMinutesAgo={freshnessMinutesAgo}
          alert={priceAlert.alert}
          compact
        />
      ) : null}
    </>
  );

  return (
    <div ref={rootRef} className="product-card-actions">
      <Link
        href={href}
        className="product-card-action-wide btn-cta flex min-h-10 items-center justify-center px-3 py-2.5 text-center text-sm font-semibold"
      >
        {primaryCtaLabel}
      </Link>

      {/* Desktop: reveal on card hover */}
      <div className="product-card-secondary-desktop">{secondary}</div>

      {/* Mobile: overflow */}
      <div className="product-card-secondary-mobile">
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label="More actions"
          onClick={() => setMenuOpen((v) => !v)}
          className="product-card-more-btn"
        >
          <span aria-hidden="true">···</span>
        </button>
        {menuOpen ? (
          <div id={menuId} role="menu" className="product-card-more-menu">
            {secondary}
          </div>
        ) : null}
      </div>
    </div>
  );
}
