"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PriceAlertModule } from "@/components/PriceAlertModule";
import type { NewCartItem } from "@/lib/cart-storage";
import { saveProductAction, unsaveProductAction } from "@/lib/saved-actions";

export type ProductAlertState = { threshold: string | null; isActive: boolean } | null;

/**
 * Compact Save / price-alert / Add to cart controls for the comparison page.
 */
export function ProductActions({
  productId,
  redirectTo,
  isSaved,
  alert,
  suggestedAlert,
  currentLowestPrice,
  lastCheckedMinutesAgo,
  cartItem,
}: {
  productId: string;
  redirectTo: string;
  isSaved: boolean;
  alert: ProductAlertState;
  suggestedAlert: string;
  currentLowestPrice: number | null;
  lastCheckedMinutesAgo?: number | null;
  /** The top-ranked listing snapshot, when at least one real offer exists — omitted (no button) otherwise. */
  cartItem?: NewCartItem;
}) {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start gap-3">
        {cartItem ? <AddToCartButton {...cartItem} /> : null}
        <form
          action={
            isSaved
              ? unsaveProductAction.bind(null, productId, redirectTo)
              : saveProductAction.bind(null, productId, redirectTo)
          }
        >
          <button
            type="submit"
            className={
              isSaved
                ? "min-h-11 rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium text-gray-700 hover:border-navy-800"
                : "btn-cta min-h-11 px-4 py-2 text-sm"
            }
          >
            {isSaved ? "Saved" : "Save product"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowAlert((v) => !v)}
          aria-expanded={showAlert}
          className="min-h-11 rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium text-gray-700 hover:border-navy-800"
        >
          {showAlert ? "Hide alert" : alert ? "Edit price alert" : "Set price alert"}
        </button>
      </div>

      {showAlert ? (
        <PriceAlertModule
          productId={productId}
          redirectTo={redirectTo}
          suggestedAlert={suggestedAlert}
          currentLowestPrice={currentLowestPrice}
          lastCheckedMinutesAgo={lastCheckedMinutesAgo}
          alert={alert}
        />
      ) : null}
    </div>
  );
}
