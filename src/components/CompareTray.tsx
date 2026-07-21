"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useCompareBasket } from "@/components/CompareBasketProvider";
import type { CompareBasketItem } from "@/lib/compare-basket";
import { productThumbClass } from "@/lib/images";

function money(value: number | null): string {
  return value != null ? `$${value.toFixed(2)}` : "—";
}

/**
 * Sticky comparison dock whenever the basket has items, plus a quick
 * side-by-side sheet so shoppers need not leave the current page.
 */
export function CompareTray() {
  const { items, count, clear, remove, lastAction, toastVisible, dismissToast } =
    useCompareBasket();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [products, setProducts] = useState<CompareBasketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const sheetId = useId();

  const idsKey = items.map((i) => i.id).join(",");
  const showLimit = toastVisible && lastAction?.type === "limit";

  useEffect(() => {
    if (count === 0) setSheetOpen(false);
  }, [count]);

  useEffect(() => {
    if (!showLimit) return;
    const timer = window.setTimeout(() => dismissToast(), 4000);
    return () => window.clearTimeout(timer);
  }, [showLimit, dismissToast]);

  useEffect(() => {
    if (!sheetOpen || items.length === 0) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/compare-basket?ids=${encodeURIComponent(idsKey)}`)
      .then((res) => res.json())
      .then((data: { items: CompareBasketItem[] }) => {
        if (!cancelled) setProducts(data.items ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sheetOpen, idsKey, items.length]);

  useEffect(() => {
    if (!sheetOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSheetOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  if (count === 0 && !showLimit) return null;

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="compare-tray"
      >
        {showLimit ? (
          <div className="compare-tray-inner">
            <p className="text-sm font-medium text-navy-900">
              You can compare up to 4 products at a time.
            </p>
            <button
              type="button"
              onClick={dismissToast}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="compare-tray-inner">
            <div className="compare-tray-thumbs" aria-hidden={count === 0}>
              {items.slice(0, 4).map((item) => (
                <span key={item.id} className="compare-tray-chip" title={item.name}>
                  {item.name.slice(0, 1).toUpperCase()}
                </span>
              ))}
            </div>
            <p className="compare-tray-count">
              <span className="font-bold text-navy-900">
                {count} {count === 1 ? "item" : "items"} selected
              </span>
              <span className="hidden text-muted sm:inline"> for comparison</span>
            </p>
            <div className="compare-tray-actions">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-navy-900 hover:border-navy-800"
                aria-expanded={sheetOpen}
                aria-controls={sheetId}
              >
                Quick compare
              </button>
              <Link href="/compare/list" className="btn-cta px-4 py-2 text-xs sm:text-sm">
                Compare now →
              </Link>
              <button
                type="button"
                onClick={clear}
                className="hidden rounded-full border border-border px-3 py-2 text-xs font-semibold text-navy-900 hover:border-navy-800 sm:inline-flex"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {sheetOpen ? (
        <>
          <button
            type="button"
            aria-label="Close compare sheet"
            className="compare-sheet-backdrop"
            onClick={() => setSheetOpen(false)}
          />
          <aside
            id={sheetId}
            role="dialog"
            aria-modal="true"
            aria-label="Quick compare"
            className="compare-sheet"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <h2 className="text-base font-bold text-navy-900">Quick compare</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Total Known Cost side by side — leave the page only when ready.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-navy-900"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {loading ? (
                <p className="text-sm text-muted">Loading comparison…</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-muted">No products in compare yet.</p>
              ) : (
                <ul className="space-y-3">
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="flex gap-3 rounded-xl border border-border bg-panel p-3"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-[#F7FAFC]">
                        <Image
                          src={product.imageSrc}
                          alt=""
                          fill
                          className={productThumbClass(product.imageSrc)}
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy-900">{product.name}</p>
                        <p className="text-xs text-muted">{product.brandName}</p>
                        <p className="mt-1 text-sm font-extrabold tabular-nums text-navy-900">
                          {money(product.lowestKnownPrice)}
                          <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                            TKC
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {product.offerCount > 0
                            ? `${product.offerCount} offers · ${product.conditions.join(", ") || "—"}`
                            : "No offers"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <Link
                          href={`/compare/${product.id}`}
                          className="rounded-full border border-border px-2.5 py-1 text-center text-[11px] font-semibold text-navy-900"
                        >
                          Offers
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(product.id)}
                          className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-navy-900"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-border px-4 py-3">
              <Link href="/compare/list" className="btn-cta flex w-full justify-center px-4 py-2.5 text-sm">
                Open full comparison table
              </Link>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
