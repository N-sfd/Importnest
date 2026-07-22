"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart, type CartItem } from "@/components/CartProvider";
import { PopularComparisonsSection } from "@/components/PopularComparisonCard";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { PrimaryAction, SecondaryAction } from "@/components/StatusPanel";
import { CART_MAX_QUANTITY, cartSummaryTotals, lineUnitCost } from "@/lib/cart-storage";
import { BRAND_FALLBACK_IMAGE, productThumbClass } from "@/lib/images";
import type { PopularComparison } from "@/lib/popular-comparisons";
import { saveProductAction } from "@/lib/saved-actions";

function money(value: number | undefined): string {
  return value != null ? `$${value.toFixed(2)}` : "Not provided";
}

const TRUST_POINTS = [
  "Approved sources only",
  "Total Known Cost shown clearly",
  "Sponsored results do not change organic ranking",
  "Price and availability depend on retailer data freshness",
];

export function CartLineRow({
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
    <article className="cart-item panel p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="cart-item-image relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface sm:h-28 sm:w-28">
          <Image
            src={imageSrc}
            alt={item.title}
            fill
            className={productThumbClass(imageSrc)}
            sizes="112px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {item.brand ? <span>{item.brand}</span> : null}
            {item.brand ? <span aria-hidden="true">·</span> : null}
            <span>{item.retailerName ?? "Source not confirmed"}</span>
          </div>
          <p className="mt-1 text-base font-bold leading-snug text-navy-900">{item.title}</p>

          {unavailable ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900">
              This offer is no longer available. Remove it or check the product page for current options.
            </p>
          ) : (
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-muted">Condition</dt>
                <dd className="font-semibold text-navy-900">{item.condition ?? "Not provided"}</dd>
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
                <dt className="text-muted">Total Known Cost (each)</dt>
                <dd className="font-semibold tabular-nums text-navy-900">{money(unitCost)}</dd>
              </div>
            </dl>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2 rounded-full border border-border">
              <button
                type="button"
                onClick={() => setQuantity(item.listingId, item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1 || unavailable}
                aria-label={`Decrease quantity of ${item.title}`}
                className="flex h-10 w-10 items-center justify-center text-lg font-semibold text-navy-900 disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-4 text-center text-sm font-semibold tabular-nums text-navy-900" aria-live="polite">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(item.listingId, item.productId, item.quantity + 1)}
                disabled={item.quantity >= CART_MAX_QUANTITY || unavailable}
                aria-label={`Increase quantity of ${item.title}`}
                className="flex h-10 w-10 items-center justify-center text-lg font-semibold text-navy-900 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <Link
              href={`/compare/${item.productId}`}
              className="font-semibold text-link hover:underline"
            >
              View offers
            </Link>

            {signedIn ? (
              <form action={saveProductAction.bind(null, item.productId, "/cart")}>
                <button
                  type="submit"
                  disabled={isSaved}
                  className="font-semibold text-navy-900 hover:underline disabled:cursor-default disabled:text-muted disabled:no-underline"
                >
                  {isSaved ? "Saved for later" : "Save for later"}
                </button>
              </form>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent("/cart")}`}
                className="font-semibold text-navy-900 hover:underline"
              >
                Sign in to save for later
              </Link>
            )}

            <button
              type="button"
              onClick={() => remove(item.listingId, item.productId)}
              aria-label={`Remove ${item.title} from cart`}
              className="font-semibold text-muted hover:text-red-700 hover:underline"
            >
              Remove
            </button>
          </div>

          {!unavailable && item.listingId ? (
            <div className="mt-3">
              <a
                href={`/go/${item.listingId}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-cta inline-block min-h-11 px-4 py-2 text-sm"
              >
                Continue to retailer
              </a>
              <p className="mt-1 text-xs leading-snug text-muted">
                Purchase completes on {item.retailerName ?? "the retailer"}&apos;s website.
              </p>
            </div>
          ) : null}
        </div>

        {!unavailable ? (
          <div className="shrink-0 text-right sm:w-28">
            <p className="text-[11px] uppercase tracking-wide text-muted">Item total</p>
            <p className="text-base font-bold tabular-nums text-navy-900">{money(lineTotal)}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function CartSummary({ items }: { items: CartItem[] }) {
  const { subtotal, hasUnknownShipping, hasUnknownFees, shippingTotal, feesTotal, totalKnownCost } =
    cartSummaryTotals(items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasRetailerLink = items.some((item) => item.listingId != null);

  return (
    <aside className="cart-summary panel h-fit p-4 sm:p-5 lg:sticky lg:top-20">
      <h2 className="text-base font-bold tracking-tight text-navy-900">Cart summary</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Items</dt>
          <dd className="font-semibold tabular-nums text-navy-900">{itemCount}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Item subtotal</dt>
          <dd className="font-semibold tabular-nums text-navy-900">${subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Known shipping</dt>
          <dd className="font-semibold tabular-nums text-navy-900">
            ${shippingTotal.toFixed(2)}
            {hasUnknownShipping ? (
              <span className="ml-1 text-[11px] font-medium text-amber-700">
                (not fully provided)
              </span>
            ) : null}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Known fees</dt>
          <dd className="font-semibold tabular-nums text-navy-900">
            ${feesTotal.toFixed(2)}
            {hasUnknownFees ? (
              <span className="ml-1 text-[11px] font-medium text-amber-700">
                (not fully provided)
              </span>
            ) : null}
          </dd>
        </div>
        <div className="flex justify-between gap-2 border-t border-border pt-2 text-base">
          <dt className="font-bold text-navy-900">Total Known Cost</dt>
          <dd className="font-extrabold tabular-nums text-navy-900">${totalKnownCost.toFixed(2)}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Total Known Cost includes item price, known shipping, and known fees. Taxes or
        retailer-only charges may appear at checkout if not provided by the source.
      </p>

      {hasRetailerLink ? (
        <p className="mt-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs leading-relaxed text-navy-900">
          Some purchases may be completed on the retailer website.
        </p>
      ) : null}

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <Link href="/checkout" className="cart-primary-button btn-cta block min-h-11 px-4 py-2.5 text-center text-sm">
          Checkout demo
        </Link>
        <p className="text-center text-[11px] font-semibold leading-snug text-amber-900">
          No payment is processed.
        </p>
        <Link
          href="/search"
          className="block text-center text-sm font-semibold text-link hover:underline"
        >
          Continue shopping
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface px-3 py-3 text-xs">
        <p className="font-bold text-navy-900">Compare before you buy</p>
        <ul className="mt-1.5 space-y-1 text-muted">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex gap-1.5">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function EmptyCart({
  popularComparisons,
  signedIn,
}: {
  popularComparisons: PopularComparison[];
  signedIn: boolean;
}) {
  return (
    <div className="space-y-10">
      <section
        className="rounded-2xl border border-border bg-panel px-5 py-10 text-center sm:px-8"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-xl font-extrabold tracking-tight text-navy-900 sm:text-2xl">
          Your cart is empty
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
          Add products from search results, Best Deals, or category pages to review them here.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <PrimaryAction href="/">Continue shopping</PrimaryAction>
          <SecondaryAction href="/search?q=deals">View today&apos;s deals</SecondaryAction>
          <SecondaryAction href="/search">Browse categories</SecondaryAction>
        </div>
      </section>

      <PopularComparisonsSection items={popularComparisons} signedIn={signedIn} />

      <RecentlyViewedSection />
    </div>
  );
}

export function CartClient({
  signedIn,
  savedProductIds,
  popularComparisons,
}: {
  signedIn: boolean;
  savedProductIds: string[];
  popularComparisons: PopularComparison[];
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

  return (
    <div className="cart-page">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Shopping Cart</h1>
        <p className="mt-1 text-sm text-muted">Review selected offers before checkout.</p>
      </div>

      {items.length === 0 ? (
        <EmptyCart popularComparisons={popularComparisons} signedIn={signedIn} />
      ) : (
        (() => {
          const availableItems = items.filter(
            (i) => i.listingId == null || !unavailableIds.has(i.listingId),
          );

          return (
            <div className="cart-layout grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-7">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-navy-900">
                    {items.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                    {items.reduce((sum, i) => sum + i.quantity, 0) === 1 ? "item" : "items"} in cart
                  </p>
                  <button
                    type="button"
                    onClick={clear}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
                  >
                    Clear cart
                  </button>
                </div>

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
          );
        })()
      )}
    </div>
  );
}
