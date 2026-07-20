"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addToCart,
  CART_LINE_LIMIT,
  CART_STORAGE_KEY,
  isInCart,
  parseCartJSON,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
  type NewCartItem,
} from "@/lib/cart-storage";

export type { CartItem, NewCartItem };
export { CART_LINE_LIMIT };

type CartContextValue = {
  items: CartItem[];
  /** Total unit count across all lines (sum of quantities), for the header badge. */
  count: number;
  /** Max distinct product/listing lines the cart holds. */
  limit: number;
  /** True once the cart holds CART_LINE_LIMIT distinct lines — adding a new (not-already-in-cart) line is a no-op past this point. */
  isFull: boolean;
  isInCart: (listingId: string | undefined, productId: string) => boolean;
  add: (item: NewCartItem) => void;
  remove: (listingId: string | undefined, productId: string) => void;
  setQuantity: (listingId: string | undefined, productId: string, quantity: number) => void;
  clear: () => void;
};

/**
 * Default (no-op) value used when a component renders outside the provider —
 * e.g. component tests that mount a single card in isolation. Production
 * always has the provider mounted at the root layout.
 */
const noopContextValue: CartContextValue = {
  items: [],
  count: 0,
  limit: CART_LINE_LIMIT,
  isFull: false,
  isInCart: () => false,
  add: () => {},
  remove: () => {},
  setQuantity: () => {},
  clear: () => {},
};

const CartContext = createContext<CartContextValue>(noopContextValue);

function loadItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  return parseCartJSON(window.localStorage.getItem(CART_STORAGE_KEY));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Guards the write effect so it never overwrites real storage with the
  // empty initial state before the load effect has run once.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const has = useCallback(
    (listingId: string | undefined, productId: string) => isInCart(items, listingId, productId),
    [items],
  );

  const add = useCallback((item: NewCartItem) => {
    setItems((current) => addToCart(current, item).items);
  }, []);

  const remove = useCallback((listingId: string | undefined, productId: string) => {
    setItems((current) => removeFromCart(current, listingId, productId));
  }, []);

  const setQuantity = useCallback(
    (listingId: string | undefined, productId: string, quantity: number) => {
      setItems((current) => updateCartQuantity(current, listingId, productId, quantity));
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const isFull = items.length >= CART_LINE_LIMIT;

  const value = useMemo<CartContextValue>(
    () => ({ items, count, limit: CART_LINE_LIMIT, isFull, isInCart: has, add, remove, setQuantity, clear }),
    [items, count, isFull, has, add, remove, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
