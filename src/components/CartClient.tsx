"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart, type CartItem } from "@/components/CartProvider";
import { PrimaryAction, SecondaryAction, StatusPanel } from "@/components/StatusPanel";
import { CART_MAX_QUANTITY, cartSummaryTotals, lineUnitCost } from "@/lib/cart-storage";
import { BRAND_FALLBACK_IMAGE, productThumbClass } from "@/lib/images";
import { saveProductAction } from "@/lib/saved-actions";

function money(value: number | undefined): string {
  return value != null ? `$${value.toFixed(2)}` : "Not confirmed";
}

function CartLineRow({
  item,
  unavailable,
  isSaved,
  signedIn,
}: {
  item: CartItem;
  unavailable: boolean;
  isSaved: boolean;
  signedIn: boolean;
}) {
  const { remove, setQuantity } = useCart();
  const unitCost = lineUnitCost(item);
  const lineTotal = unitCost != null ? unitCost * item.quantity : undefined;
  const imageSrc = item.imageUrl ?? BRAND_FALLBACK_IMAGE;

  return (
    <article className="panel offer-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
          <Image
            src={imageSrc}
            alt={item.title}
            fill
            className={productThumbClass(imageSrc)}
            sizes="80px"
          />
        </div>

        <div className="min-w-0 flex-1">
          {item.brand ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.brand}</p>
          ) : null}
          <p className="mt-0.5 text-base font-bold leading-snug text-navy-900">{item.title}</p>

          {unavailable ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900">
              This offer is no longer available. Remove it or check the product page for current options.
            </p>
          ) : (
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-muted">Retailer</dt>
                <dd className="font-semibold text-navy-900">{item.retailerName ?? "Not confirmed"}</dd>
              </div>
              <div>
                <dt className="text-muted">Condition</dt>
                <dd className="font-semibold text-navy-900">{item.condition ?? "Not confirmed"}</dd>
              </div>
              <div>
                <dt className="text-muted">Item price</dt>
                <dd className="font-semibold tabular-nums text-navy-900">{money(item.itemPrice)}</dd>
              </div>
              <div>
                <dt className="text-muted">Shipping</dt>
                <dd className="font-semibold tabular-nums text-navy-900">{money(item.shipping)}</dd>
              </div>
              <div>
                <dt className="text-muted">Fees</dt>
                <dd className="font-semibold tabular-nums text-navy-900">{money(item.fees)}</dd>
              </div>
              <div>
                <dt className="text-muted">Total known cost (each)</dt>
                <dd className="font-semibold tabular-nums text-navy-900">{money(unitCost)}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-48">
          <div className="flex items-center justify-between rounded-full border border-border">
            <button
              type="button"
              onClick={() => setQuantity(item.listingId, item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1 || unavailable}
              aria-label={`Decrease quantity of ${item.title}`}
              className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-navy-900 disabled:opacity-30"
            >
              −
            </button>
            <span className="text-sm font-semibold tabular-nums text-navy-900" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(item.listingId, item.productId, item.quantity + 1)}
              disabled={item.quantity >= CART_MAX_QUANTITY || unavailable}
              aria-label={`Increase quantity of ${item.title}`}
              className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-navy-900 disabled:opacity-30"
            >
              +
            </button>
          </div>

          {!unavailable ? (
            <p className="text-right text-sm font-bold tabular-nums text-navy-900">{money(lineTotal)}</p>
          ) : null}

          {!unavailable && item.listingId ? (
            <a
              href={`/go/${item.listingId}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-cta min-h-11 px-3 py-2 text-center text-sm"
            >
              Continue to retailer checkout
            </a>
          ) : null}

          {signedIn ? (
            <form action={saveProductAction.bind(null, item.productId, "/cart")}>
              <button
                type="submit"
                disabled={isSaved}
                className="w-full rounded-full border border-border bg-panel px-3 py-2 text-sm font-semibold text-navy-900 hover:border-navy-800 disabled:cursor-default disabled:text-muted"
              >
                {isSaved ? "Saved for later" : "Save for later"}
              </button>
            </form>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent("/cart")}`}
              className="w-full rounded-full border border-border bg-panel px-3 py-2 text-center text-sm font-semibold text-navy-900 hover:border-navy-800"
            >
              Sign in to save for later
            </Link>
          )}

          <button
            type="button"
            onClick={() => remove(item.listingId, item.productId)}
            className="w-full rounded-full border border-border px-3 py-2 text-sm font-semibold text-muted hover:border-red-300 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function CartSummary({ items }: { items: CartItem[] }) {
  const { subtotal, hasUnknownShipping, hasUnknownFees, shippingTotal, feesTotal, totalKnownCost } =
    cartSummaryTotals(items);

  return (
    <aside className="panel h-fit p-4 sm:p-5 lg:sticky lg:top-20">
      <h2 className="text-base font-bold tracking-tight text-navy-900">Cart summary</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Subtotal (item prices)</dt>
          <dd className="font-semibold tabular-nums text-navy-900">${subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Known shipping</dt>
          <dd className="font-semibold tabular-nums text-navy-900">
            ${shippingTotal.toFixed(2)}
            {hasUnknownShipping ? <span className="ml-1 text-xs text-muted">*</span> : null}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Known fees</dt>
          <dd className="font-semibold tabular-nums text-navy-900">
            ${feesTotal.toFixed(2)}
            {hasUnknownFees ? <span className="ml-1 text-xs text-muted">*</span> : null}
          </dd>
        </div>
        <div className="flex justify-between gap-2 border-t border-border pt-2 text-base">
          <dt className="font-bold text-navy-900">Total known cost</dt>
          <dd className="font-extrabold tabular-nums text-navy-900">${totalKnownCost.toFixed(2)}</dd>
        </div>
      </dl>

      {hasUnknownShipping || hasUnknownFees ? (
        <p className="mt-2 text-xs text-muted">
          * Shipping or fees were not confirmed for one or more items — your total may be higher.
        </p>
      ) : null}

      <p className="mt-3 text-xs text-muted">Excludes local sales tax.</p>
      <p className="mt-1 text-xs text-muted">
        Checkout happens on each retailer&apos;s website — Importnest does not process payments.
      </p>

      <Link href="/checkout" className="btn-cta mt-4 block min-h-11 px-4 py-2.5 text-center text-sm">
        Continue to checkout
      </Link>
    </aside>
  );
}

export function CartClient({
  signedIn,
  savedProductIds,
}: {
  signedIn: boolean;
  savedProductIds: string[];
}) {
  const { items, clear } = useCart();
  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(new Set());
  const savedIdSet = useMemo(() => new Set(savedProductIds), [savedProductIds]);

  const listingIds = useMemo(
    () => items.map((i) => i.listingId).filter((id): id is string => id != null),
    [items],
  );
  const idsKey = listingIds.join(",");

  useEffect(() => {
    if (listingIds.length === 0) {
      setUnavailableIds(new Set());
      return;
    }
    let cancelled = false;
    fetch(`/api/cart-check?ids=${encodeURIComponent(idsKey)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { availableIds: string[] } | null) => {
        if (cancelled || !data) return;
        const available = new Set(data.availableIds);
        setUnavailableIds(new Set(listingIds.filter((id) => !available.has(id))));
      })
      .catch(() => {
        // Network/availability check failures never block rendering the cart —
        // items simply keep showing their last-known snapshot.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  if (items.length === 0) {
    return (
      <StatusPanel
        title="No items in your cart yet."
        description="Add products from search results, popular comparisons, or category pages."
        actions={
          <>
            <PrimaryAction href="/search">Browse products</PrimaryAction>
            <SecondaryAction href="/">Go home</SecondaryAction>
          </>
        }
      />
    );
  }

  const availableItems = items.filter((i) => i.listingId == null || !unavailableIds.has(i.listingId));
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-navy-900">
          Your cart · {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
        </h1>
        <button
          type="button"
          onClick={clear}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {items.map((item) => (
            <CartLineRow
              key={item.listingId ?? `product:${item.productId}`}
              item={item}
              unavailable={item.listingId != null && unavailableIds.has(item.listingId)}
              isSaved={savedIdSet.has(item.productId)}
              signedIn={signedIn}
            />
          ))}
        </div>

        <CartSummary items={availableItems} />
      </div>
    </div>
  );
}
