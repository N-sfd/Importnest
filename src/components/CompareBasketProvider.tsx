"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CompareToast } from "@/components/CompareToast";
import {
  addToBasket,
  COMPARE_BASKET_LIMIT,
  type CompareBasketEntry,
  parseCompareBasketJSON,
  removeFromBasket,
} from "@/lib/compare-basket-storage";

const STORAGE_KEY = "importnest.compareBasket";
export { COMPARE_BASKET_LIMIT };
export type { CompareBasketEntry };
type LastAction = { type: "added" } | { type: "limit" } | null;

type CompareBasketContextValue = {
  items: CompareBasketEntry[];
  count: number;
  limit: number;
  has: (id: string) => boolean;
  isFull: boolean;
  add: (id: string, name: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  lastAction: LastAction;
  toastVisible: boolean;
  dismissToast: () => void;
};

/**
 * Default (no-op) value used when a component renders outside the provider —
 * e.g. component tests that mount a single card in isolation. Production
 * always has the provider mounted at the root layout.
 */
const noopContextValue: CompareBasketContextValue = {
  items: [],
  count: 0,
  limit: COMPARE_BASKET_LIMIT,
  has: () => false,
  isFull: false,
  add: () => {},
  remove: () => {},
  clear: () => {},
  lastAction: null,
  toastVisible: false,
  dismissToast: () => {},
};

const CompareBasketContext = createContext<CompareBasketContextValue>(noopContextValue);

function loadItems(): CompareBasketEntry[] {
  if (typeof window === "undefined") return [];
  return parseCompareBasketJSON(window.localStorage.getItem(STORAGE_KEY));
}

export function CompareBasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareBasketEntry[]>([]);
  const [lastAction, setLastAction] = useState<LastAction>(null);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    setItems(loadItems());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const has = useCallback((id: string) => items.some((item) => item.id === id), [items]);

  const add = useCallback(
    (id: string, name: string) => {
      setItems((current) => {
        const { items: next, outcome } = addToBasket(current, id, name);
        if (outcome === "duplicate") return current;
        setLastAction({ type: outcome === "limit" ? "limit" : "added" });
        setToastVisible(true);
        return next;
      });
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setItems((current) => removeFromBasket(current, id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setToastVisible(false);
  }, []);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const value = useMemo<CompareBasketContextValue>(
    () => ({
      items,
      count: items.length,
      limit: COMPARE_BASKET_LIMIT,
      has,
      isFull: items.length >= COMPARE_BASKET_LIMIT,
      add,
      remove,
      clear,
      lastAction,
      toastVisible,
      dismissToast,
    }),
    [items, has, add, remove, clear, lastAction, toastVisible, dismissToast],
  );

  return (
    <CompareBasketContext.Provider value={value}>
      {children}
      <CompareToast />
    </CompareBasketContext.Provider>
  );
}

export function useCompareBasket() {
  return useContext(CompareBasketContext);
}
