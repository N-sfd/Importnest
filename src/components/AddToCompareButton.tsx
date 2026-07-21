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

/** Add/remove-from-compare toggle. Use `labeled` for text "Compare" on product cards. */
export function AddToCompareButton({
  productId,
  productName,
  labeled = false,
}: {
  productId: string;
  productName: string;
  /** Text button for product-card footers; icon-only when false. */
  labeled?: boolean;
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

  const ariaLabel = inBasket
    ? `Remove ${productName} from compare`
    : limitReached
      ? "Compare list is full — remove an item to add this one"
      : `Add ${productName} to compare`;

  if (labeled) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-pressed={inBasket}
        disabled={limitReached}
        className={`flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed ${
          inBasket
            ? "border-accent/60 bg-accent/10 text-accent"
            : limitReached
              ? "border-border bg-surface text-muted"
              : "border-border bg-white text-navy-900 hover:border-navy-800"
        }`}
      >
        <CompareIcon checked={inBasket} />
        {inBasket ? "In compare" : limitReached ? "Full" : "Compare"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={inBasket}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-panel/95 shadow-sm transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        inBasket ? "text-accent" : limitReached ? "text-muted" : "text-navy-900"
      }`}
    >
      <CompareIcon checked={inBasket} />
    </button>
  );
}
