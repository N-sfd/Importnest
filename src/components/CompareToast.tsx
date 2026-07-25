"use client";

import Link from "next/link";
import { useCompareBasket } from "@/components/CompareBasketProvider";
import { Toast } from "@/components/Toast";

/** Floating confirmation shown after add/remove/limit — bottom bar on mobile, bottom-right card on desktop. */
export function CompareToast() {
  const { count, lastAction, toastVisible, clear, dismissToast, items } = useCompareBasket();

  if (!toastVisible) return null;
  if (lastAction?.type !== "limit" && count === 0) return null;

  const isLimit = lastAction?.type === "limit";
  const lastAdded = items[items.length - 1];

  return (
    <Toast onDismiss={dismissToast}>
      {isLimit ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-navy-900">
            You can compare up to 4 products at a time.
          </p>
          <button
            type="button"
            onClick={dismissToast}
            className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
          >
            Got it
          </button>
        </div>
      ) : count === 1 ? (
        <div>
          <p className="text-sm font-semibold text-navy-900">Added to compare</p>
          <p className="mt-0.5 truncate text-sm text-muted">{lastAdded?.name}</p>
          <p className="mt-0.5 text-xs text-muted">1 item in compare</p>
          <div className="mt-2 flex gap-2">
            <Link href="/compare/list" className="btn-cta px-3 py-1.5 text-xs">
              View compare
            </Link>
            <button
              type="button"
              onClick={dismissToast}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
            >
              Keep shopping
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-navy-900">
            {count} products selected for comparison
          </p>
          <div className="mt-2 flex gap-2">
            <Link href="/compare/list" className="btn-cta px-3 py-1.5 text-xs">
              View compare
            </Link>
            <button
              type="button"
              onClick={clear}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </Toast>
  );
}
