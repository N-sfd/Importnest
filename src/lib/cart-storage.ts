/**
 * Pure cart localStorage parsing/mutation logic — extracted so it can be
 * unit-tested without a DOM/localStorage global (mirrors compare-basket-storage.ts).
 *
 * Cart entries store a snapshot of real listing/product data at add-time
 * (not just an id) so the /cart page can render without a network round trip.
 */

export type CartItem = {
  productId: string;
  listingId?: string;
  title: string;
  brand?: string;
  imageUrl?: string;
  retailerName?: string;
  condition?: string;
  itemPrice?: number;
  shipping?: number;
  fees?: number;
  totalKnownCost?: number;
  quantity: number;
  /** ISO timestamp. */
  addedAt: string;
};

export const CART_STORAGE_KEY = "importnest_cart";
export const CART_MAX_QUANTITY = 10;
const CART_MAX_ITEMS = 100;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isOptionalFiniteNumber(value: unknown): value is number | undefined {
  return value === undefined || isFiniteNumber(value);
}

function clampQuantity(quantity: number): number {
  const rounded = Math.round(quantity);
  const safe = Number.isFinite(rounded) ? rounded : 1;
  return Math.min(CART_MAX_QUANTITY, Math.max(1, safe));
}

function isValidCartItem(entry: unknown): entry is CartItem {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.productId === "string" &&
    e.productId.length > 0 &&
    typeof e.title === "string" &&
    e.title.length > 0 &&
    isFiniteNumber(e.quantity) &&
    typeof e.addedAt === "string" &&
    isOptionalString(e.listingId) &&
    isOptionalString(e.brand) &&
    isOptionalString(e.imageUrl) &&
    isOptionalString(e.retailerName) &&
    isOptionalString(e.condition) &&
    isOptionalFiniteNumber(e.itemPrice) &&
    isOptionalFiniteNumber(e.shipping) &&
    isOptionalFiniteNumber(e.fees) &&
    isOptionalFiniteNumber(e.totalKnownCost)
  );
}

/** Parses and validates the cart localStorage payload. Any malformed input resets safely to an empty cart rather than throwing. */
export function parseCartJSON(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isValidCartItem)
      .map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))
      .slice(0, CART_MAX_ITEMS);
  } catch {
    return [];
  }
}

/** Line identity: the same listing (or the same product, when no listing was resolved) merges quantity instead of duplicating a row. */
function lineKey(item: { listingId?: string; productId: string }): string {
  return item.listingId ?? `product:${item.productId}`;
}

export type NewCartItem = Omit<CartItem, "quantity" | "addedAt">;

export function addToCart(current: CartItem[], newItem: NewCartItem): CartItem[] {
  const key = lineKey(newItem);
  const existingIndex = current.findIndex((item) => lineKey(item) === key);
  if (existingIndex >= 0) {
    const next = [...current];
    const existing = next[existingIndex]!;
    next[existingIndex] = { ...existing, quantity: clampQuantity(existing.quantity + 1) };
    return next;
  }
  if (current.length >= CART_MAX_ITEMS) return current;
  return [...current, { ...newItem, quantity: 1, addedAt: new Date().toISOString() }];
}

export function removeFromCart(
  current: CartItem[],
  listingId: string | undefined,
  productId: string,
): CartItem[] {
  const key = listingId ?? `product:${productId}`;
  return current.filter((item) => lineKey(item) !== key);
}

export function updateCartQuantity(
  current: CartItem[],
  listingId: string | undefined,
  productId: string,
  quantity: number,
): CartItem[] {
  const key = listingId ?? `product:${productId}`;
  return current.map((item) =>
    lineKey(item) === key ? { ...item, quantity: clampQuantity(quantity) } : item,
  );
}

export function isInCart(
  current: CartItem[],
  listingId: string | undefined,
  productId: string,
): boolean {
  const key = listingId ?? `product:${productId}`;
  return current.some((item) => lineKey(item) === key);
}

/** Per-line unit total known cost, falling back to item price alone when totalKnownCost wasn't captured at add-time. */
export function lineUnitCost(item: Pick<CartItem, "totalKnownCost" | "itemPrice">): number | undefined {
  return item.totalKnownCost ?? item.itemPrice;
}

export function cartSummaryTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + (i.itemPrice ?? 0) * i.quantity, 0);
  const hasUnknownPrice = items.some((i) => i.itemPrice == null);
  const hasUnknownShipping = items.some((i) => i.shipping == null);
  const hasUnknownFees = items.some((i) => i.fees == null);
  const shippingTotal = items.reduce((sum, i) => sum + (i.shipping ?? 0) * i.quantity, 0);
  const feesTotal = items.reduce((sum, i) => sum + (i.fees ?? 0) * i.quantity, 0);
  const totalKnownCost = items.reduce((sum, i) => sum + (lineUnitCost(i) ?? 0) * i.quantity, 0);
  return {
    subtotal,
    hasUnknownPrice,
    hasUnknownShipping,
    hasUnknownFees,
    shippingTotal,
    feesTotal,
    totalKnownCost,
  };
}
