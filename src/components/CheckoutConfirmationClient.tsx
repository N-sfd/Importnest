"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { PrimaryAction, SecondaryAction, StatusPanel } from "@/components/StatusPanel";
import { lineUnitCost } from "@/lib/cart-storage";
import {
  CHECKOUT_ORDER_STORAGE_KEY,
  parseCheckoutOrderJSON,
  type CheckoutOrder,
} from "@/lib/checkout-order";
import { BRAND_FALLBACK_IMAGE, productThumbClass } from "@/lib/images";

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function CheckoutConfirmationClient() {
  const { clear } = useCart();
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let parsed: CheckoutOrder | null = null;
    try {
      parsed = parseCheckoutOrderJSON(window.sessionStorage.getItem(CHECKOUT_ORDER_STORAGE_KEY));
    } catch {
      parsed = null;
    }
    setOrder(parsed);
    setLoaded(true);
    // A successfully placed demo order clears the cart it was built from —
    // idempotent if the cart is already empty, so safe to call unconditionally here.
    if (parsed) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded) {
    return null;
  }

  if (!order) {
    return (
      <StatusPanel
        title="No order found."
        description="We couldn't find a recent demo order in this browser session. Start checkout again from your cart."
        actions={
          <>
            <PrimaryAction href="/cart">Go to cart</PrimaryAction>
            <SecondaryAction href="/">Go home</SecondaryAction>
          </>
        }
      />
    );
  }

  return (
    <div>
      <StatusPanel
        tone="accent"
        title="Order confirmed"
        description="This is a demo order confirmation. No payment was processed."
      >
        <p className="mt-3 text-sm text-muted">Confirmation number</p>
        <p className="text-2xl font-extrabold tracking-tight text-navy-900">
          {order.confirmationNumber}
        </p>
      </StatusPanel>

      <section className="panel mt-4 p-4 sm:p-5">
        <h2 className="text-base font-bold text-navy-900">Order details</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Customer email</dt>
            <dd className="font-semibold text-navy-900">{order.contactEmail}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Fulfillment preference</dt>
            <dd className="font-semibold capitalize text-navy-900">{order.fulfillment}</dd>
          </div>
          {order.fulfillment === "delivery" && order.address ? (
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Ship to</dt>
              <dd className="text-right font-semibold text-navy-900">
                {[order.address.line1, order.address.line2, order.address.city, order.address.state, order.address.zip]
                  .filter(Boolean)
                  .join(", ")}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-2 border-t border-border pt-2 text-base">
            <dt className="font-bold text-navy-900">Total known cost</dt>
            <dd className="font-extrabold tabular-nums text-navy-900">
              {money(order.totals.totalKnownCost)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="panel mt-4 p-4 sm:p-5">
        <h2 className="text-base font-bold text-navy-900">Ordered items</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((item) => {
            const unitCost = lineUnitCost(item);
            const imageSrc = item.imageUrl ?? BRAND_FALLBACK_IMAGE;
            return (
              <li
                key={item.listingId ?? `product:${item.productId}`}
                className="flex items-center gap-3 py-2.5"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                  <Image
                    src={imageSrc}
                    alt={item.title}
                    fill
                    className={productThumbClass(imageSrc)}
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-900">{item.title}</p>
                  <p className="text-xs text-muted">Qty {item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-navy-900">
                  {unitCost != null ? money(unitCost * item.quantity) : "Not confirmed"}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
        This is a demo order confirmation. No payment was processed and no order was sent to any
        retailer or email address.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryAction href="/search">Browse products</PrimaryAction>
        <SecondaryAction href="/">Go home</SecondaryAction>
      </div>
    </div>
  );
}
