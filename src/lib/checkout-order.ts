/**
 * Pure demo-order parsing/generation logic — mirrors cart-storage.ts.
 *
 * There is no payment gateway and no Order table in this app yet, so a
 * "checkout" here only ever produces a demo confirmation: a snapshot of the
 * cart plus contact/fulfillment details, generated client-side and handed to
 * the confirmation page via sessionStorage (scoped to this browser tab, not a
 * persisted record). Nothing here ever claims a payment was processed.
 */

import type { CartItem } from "./cart-storage";

export const CHECKOUT_ORDER_STORAGE_KEY = "importnest_last_order";

export type Fulfillment = "delivery" | "pickup";

export type CheckoutAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
};

export type CheckoutOrder = {
  confirmationNumber: string;
  createdAt: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  fulfillment: Fulfillment;
  address?: CheckoutAddress;
  items: CartItem[];
  totals: {
    subtotal: number;
    shippingTotal: number;
    feesTotal: number;
    totalKnownCost: number;
  };
  /** Always true — no real payment integration exists yet. */
  isDemo: true;
};

/** Short, human-readable, obviously-not-a-real-backend-id demo confirmation number. */
export function generateConfirmationNumber(): string {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DEMO-${time}-${rand}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isValidAddress(value: unknown): value is CheckoutAddress {
  if (typeof value !== "object" || value === null) return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.line1 === "string" &&
    isOptionalString(a.line2) &&
    typeof a.city === "string" &&
    typeof a.state === "string" &&
    typeof a.zip === "string"
  );
}

function isValidOrder(value: unknown): value is CheckoutOrder {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (typeof o.confirmationNumber !== "string" || o.confirmationNumber.length === 0) return false;
  if (typeof o.createdAt !== "string") return false;
  if (typeof o.contactName !== "string" || typeof o.contactEmail !== "string") return false;
  if (!isOptionalString(o.contactPhone)) return false;
  if (o.fulfillment !== "delivery" && o.fulfillment !== "pickup") return false;
  if (o.address !== undefined && !isValidAddress(o.address)) return false;
  if (!Array.isArray(o.items)) return false;
  if (typeof o.totals !== "object" || o.totals === null) return false;
  const t = o.totals as Record<string, unknown>;
  if (
    !isFiniteNumber(t.subtotal) ||
    !isFiniteNumber(t.shippingTotal) ||
    !isFiniteNumber(t.feesTotal) ||
    !isFiniteNumber(t.totalKnownCost)
  ) {
    return false;
  }
  return o.isDemo === true;
}

/** Never throws — malformed/missing session data simply reads as "no order". */
export function parseCheckoutOrderJSON(raw: string | null): CheckoutOrder | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isValidOrder(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
