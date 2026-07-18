"use client";

import { useCompareBasket } from "@/components/CompareBasketProvider";

export function CompareIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="4" width="7" height="16" rx="1.5" />
      <rect x="14" y="4" width="7" height="16" rx="1.5" />
      <path strokeLinecap="round" d="M6.5 9v6M17.5 9v6" />
    </svg>
  );
}

export function AddToCompareButton({
  productId,
  productName,
  variant = "default",
}: {
  productId: string;
  productName: string;
  variant?: "default" | "icon";
}) {
  const { has, isFull, add, remove } = useCompareBasket();
  const inBasket = has(productId);
  const limitReached = isFull && !inBasket;

  function handleClick() {
    if (inBasket) {
      remove(productId);
      return;
    }
    add(productId, productName);
  }

  const label = inBasket ? "Remove from compare" : limitReached ? "Limit reached" : "Add to compare";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          inBasket
            ? `Remove ${productName} from compare`
            : limitReached
              ? "Compare list is full — remove an item to add this one"
              : `Add ${productName} to compare`
        }
        aria-pressed={inBasket}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-panel/95 shadow-sm transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          inBasket ? "text-accent" : limitReached ? "text-muted" : "text-navy-900"
        }`}
      >
        <CompareIcon />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={inBasket}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        inBasket
          ? "border-accent/40 bg-accent/10 text-accent hover:border-accent"
          : limitReached
            ? "border-border text-muted"
            : "border-border text-navy-900 hover:border-navy-800"
      }`}
    >
      <CompareIcon />
      {label}
    </button>
  );
}
