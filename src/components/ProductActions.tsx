"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { NewCartItem } from "@/lib/cart-storage";
import {
  removeAlertAction,
  saveProductAction,
  setPriceAlertAction,
  toggleAlertActiveAction,
  unsaveProductAction,
} from "@/lib/saved-actions";

export type ProductAlertState = { threshold: string | null; isActive: boolean } | null;

/**
 * Compact Save / price-alert / Add to cart controls for the comparison page.
 * The alert form starts collapsed behind a single toggle button labeled "Set
 * price alert" (no alert yet) or "Edit alert" (one already exists) — the four
 * button states shopper-facing copy needs to show, in one place, rather than
 * an always-open form taking up identity-section space.
 */
export function ProductActions({
  productId,
  redirectTo,
  isSaved,
  alert,
  suggestedAlert,
  currentLowestPrice,
  cartItem,
}: {
  productId: string;
  redirectTo: string;
  isSaved: boolean;
  alert: ProductAlertState;
  suggestedAlert: string;
  currentLowestPrice: number | null;
  /** The top-ranked listing snapshot, when at least one real offer exists — omitted (no button) otherwise. */
  cartItem?: NewCartItem;
}) {
  const [editingAlert, setEditingAlert] = useState(false);

  return (
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

      <div>
        <button
          type="button"
          onClick={() => setEditingAlert((v) => !v)}
          aria-expanded={editingAlert}
          aria-controls={`alert-edit-${productId}`}
          className="min-h-11 rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium text-gray-700 hover:border-navy-800"
        >
          {editingAlert ? "Close" : alert ? "Edit alert" : "Set price alert"}
        </button>

        {editingAlert ? (
          <div
            id={`alert-edit-${productId}`}
            className="mt-2 max-w-sm rounded-xl border border-border bg-surface p-3"
          >
            {alert ? (
              <p className="text-sm text-muted">
                Notify below{" "}
                <span className="font-semibold text-foreground">${alert.threshold}</span>
                {currentLowestPrice != null ? (
                  <>
                    {" "}
                    · current{" "}
                    <span className="font-semibold text-foreground">
                      ${currentLowestPrice.toFixed(2)}
                    </span>
                  </>
                ) : null}
                {!alert.isActive ? " (paused)" : null}
              </p>
            ) : null}

            <form
              action={setPriceAlertAction.bind(null, productId, redirectTo)}
              className="mt-2 flex flex-wrap items-center gap-2"
            >
              <label htmlFor={`threshold-${productId}`} className="text-sm text-muted">
                Notify below $
              </label>
              <input
                id={`threshold-${productId}`}
                name="threshold"
                type="number"
                min="0.01"
                step="0.01"
                required
                defaultValue={alert?.threshold ?? suggestedAlert}
                placeholder="0.00"
                className="min-h-11 w-24 rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="min-h-11 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-navy-800"
              >
                {alert ? "Save alert" : "Set price alert"}
              </button>
            </form>

            {alert ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <form
                  action={toggleAlertActiveAction.bind(null, productId, "price-drop", redirectTo)}
                >
                  <button
                    type="submit"
                    className="min-h-11 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-navy-800"
                  >
                    {alert.isActive ? "Pause" : "Resume"}
                  </button>
                </form>
                <form action={removeAlertAction.bind(null, productId, "price-drop", redirectTo)}>
                  <button
                    type="submit"
                    className="min-h-11 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-navy-800"
                  >
                    Remove alert
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
