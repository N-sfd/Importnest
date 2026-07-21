"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { PrimaryAction, SecondaryAction, StatusPanel } from "@/components/StatusPanel";
import { cartSummaryTotals, lineUnitCost } from "@/lib/cart-storage";
import {
  CHECKOUT_ORDER_STORAGE_KEY,
  generateConfirmationNumber,
  type CheckoutOrder,
  type Fulfillment,
} from "@/lib/checkout-order";
import { BRAND_FALLBACK_IMAGE, productThumbClass } from "@/lib/images";

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent";
const labelClass = "block text-sm";
const fieldLabelClass = "text-xs font-semibold text-muted";

export function CheckoutClient({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const { items } = useCart();

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [contactPhone, setContactPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(() => cartSummaryTotals(items), [items]);

  if (items.length === 0) {
    return (
      <StatusPanel
        title="Your cart is empty."
        description="Add products before checking out."
        actions={
          <>
            <PrimaryAction href="/search">Browse products</PrimaryAction>
            <SecondaryAction href="/">Go home</SecondaryAction>
          </>
        }
      />
    );
  }

  const addressComplete =
    fulfillment === "pickup" ||
    (line1.trim().length > 0 && city.trim().length > 0 && stateVal.trim().length > 0 && zip.trim().length > 0);
  const canSubmit =
    contactName.trim().length > 0 && contactEmail.trim().length > 0 && addressComplete && !submitting;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const order: CheckoutOrder = {
      confirmationNumber: generateConfirmationNumber(),
      createdAt: new Date().toISOString(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim() || undefined,
      fulfillment,
      address:
        fulfillment === "delivery"
          ? {
              line1: line1.trim(),
              line2: line2.trim() || undefined,
              city: city.trim(),
              state: stateVal.trim(),
              zip: zip.trim(),
            }
          : undefined,
      items,
      totals: {
        subtotal: totals.subtotal,
        shippingTotal: totals.shippingTotal,
        feesTotal: totals.feesTotal,
        totalKnownCost: totals.totalKnownCost,
      },
      isDemo: true,
    };

    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(CHECKOUT_ORDER_STORAGE_KEY, JSON.stringify(order));
      }
    } catch {
      // sessionStorage can throw in locked-down/private-browsing contexts —
      // the confirmation page handles a missing order gracefully either way.
    }
    router.push("/checkout/confirmation");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-navy-900">Checkout</h1>
        <div className="mt-2 space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
          <p className="font-bold">Demo checkout — no payment is processed.</p>
          <p className="text-xs leading-relaxed">
            Importnest cart helps you prepare your purchase. Some items may be completed through
            the retailer. This flow is for product testing only — no real purchase is made.
          </p>
        </div>
      </div>

      <section className="panel p-4 sm:p-5">
        <h2 className="text-base font-bold text-navy-900">Cart summary</h2>
        <ul className="mt-3 divide-y divide-border">
          {items.map((item) => {
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
        <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold tabular-nums text-navy-900">{money(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="font-semibold tabular-nums text-navy-900">{money(totals.shippingTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Fees</dt>
            <dd className="font-semibold tabular-nums text-navy-900">{money(totals.feesTotal)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-bold text-navy-900">Total known cost</dt>
            <dd className="font-extrabold tabular-nums text-navy-900">{money(totals.totalKnownCost)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted">Excludes local sales tax.</p>
      </section>

      <section className="panel p-4 sm:p-5">
        <h2 className="text-base font-bold text-navy-900">Customer contact information</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            <span className={fieldLabelClass}>Full name</span>
            <input
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span className={fieldLabelClass}>Email</span>
            <input
              required
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            <span className={fieldLabelClass}>Phone (optional)</span>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <h2 className="text-base font-bold text-navy-900">Delivery or pickup preference</h2>
        <div className="mt-3 flex flex-wrap gap-3" role="radiogroup" aria-label="Delivery or pickup preference">
          {(["delivery", "pickup"] as const).map((option) => (
            <label
              key={option}
              className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold capitalize transition ${
                fulfillment === option
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-navy-900 hover:border-navy-800"
              }`}
            >
              <input
                type="radio"
                name="fulfillment"
                value={option}
                checked={fulfillment === option}
                onChange={() => setFulfillment(option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          This records your preference only — actual fulfillment happens at each retailer once you
          complete their checkout.
        </p>
      </section>

      {fulfillment === "delivery" ? (
        <section className="panel p-4 sm:p-5">
          <h2 className="text-base font-bold text-navy-900">Shipping address</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              <span className={fieldLabelClass}>Address line 1</span>
              <input required value={line1} onChange={(e) => setLine1(e.target.value)} className={inputClass} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              <span className={fieldLabelClass}>Address line 2 (optional)</span>
              <input value={line2} onChange={(e) => setLine2(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={fieldLabelClass}>City</span>
              <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={fieldLabelClass}>State</span>
              <input required value={stateVal} onChange={(e) => setStateVal(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={fieldLabelClass}>ZIP code</span>
              <input required value={zip} onChange={(e) => setZip(e.target.value)} className={inputClass} />
            </label>
          </div>
        </section>
      ) : null}

      <section className="panel p-4 sm:p-5">
        <h2 className="text-base font-bold text-navy-900">Payment</h2>
        <div className="mt-3 rounded-xl border border-dashed border-border bg-surface px-4 py-6 text-center">
          <p className="text-sm font-semibold text-amber-900">
            Checkout demo — payment processing is not connected yet.
          </p>
          <p className="mt-1 text-xs font-medium text-amber-900">
            Demo checkout is for product-flow testing only. No payment is processed.
          </p>
          <p className="mt-1 text-xs text-muted">
            No payment method is collected here. Completing this demo does not charge any card or move
            any money.
          </p>
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <h2 className="text-base font-bold text-navy-900">Review your order</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Contact</dt>
            <dd className="text-right font-medium text-navy-900">
              {contactName.trim() || "—"}
              {contactEmail.trim() ? ` · ${contactEmail.trim()}` : ""}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Fulfillment</dt>
            <dd className="text-right font-medium capitalize text-navy-900">{fulfillment}</dd>
          </div>
          {fulfillment === "delivery" ? (
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Ship to</dt>
              <dd className="text-right font-medium text-navy-900">
                {[line1, city, stateVal, zip].filter((v) => v.trim()).join(", ") || "—"}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-2 border-t border-border pt-2">
            <dt className="font-bold text-navy-900">Total known cost</dt>
            <dd className="font-extrabold tabular-nums text-navy-900">{money(totals.totalKnownCost)}</dd>
          </div>
        </dl>
      </section>

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-cta min-h-11 w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Placing demo order…" : "Place demo order"}
      </button>
      <p className="text-center text-xs text-muted">
        This is a demo order confirmation flow. No payment is processed and no order is sent to any
        retailer.
      </p>
    </form>
  );
}
