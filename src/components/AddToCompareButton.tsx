"use client";

import { useCompareBasket } from "@/components/CompareBasketProvider";

/** Plus when not yet in the compare basket, checkmark once it is. */
export function CompareIcon({
  checked = false,
  className = "",
}: {
  checked?: boolean;
  className?: string;
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {checked ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 5v14M5 12h14" />}
    </svg>
  );
}

/** Icon-only add/remove-from-compare toggle — the primary "Compare" navigation link stays the one clear text CTA on product cards. */
export function AddToCompareButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
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
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-panel/95 shadow-sm transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        inBasket ? "text-accent" : limitReached ? "text-muted" : "text-navy-900"
      }`}
    >
      <CompareIcon checked={inBasket} />
    </button>
  );
}
