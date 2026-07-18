"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CompareToast } from "@/components/CompareToast";

const STORAGE_KEY = "importnest.compareBasket";
export const COMPARE_BASKET_LIMIT = 4;

export type CompareBasketEntry = { id: string; name: string };
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
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is CompareBasketEntry =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as CompareBasketEntry).id === "string" &&
          typeof (entry as CompareBasketEntry).name === "string",
      )
      .slice(0, COMPARE_BASKET_LIMIT);
  } catch {
    return [];
  }
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
        if (current.some((item) => item.id === id)) return current;
        if (current.length >= COMPARE_BASKET_LIMIT) {
          setLastAction({ type: "limit" });
          setToastVisible(true);
          return current;
        }
        setLastAction({ type: "added" });
        setToastVisible(true);
        return [...current, { id, name }];
      });
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
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
