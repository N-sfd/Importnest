"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";

/**
 * Hydration must win a race against any descendant that records a view on
 * mount (see RecordProductView) — passive effects (useEffect) fire bottom-up,
 * child before parent, so a plain useEffect here would let this provider's
 * own `setItems(loadItems())` overwrite a child's just-recorded view. Layout
 * effects flush for the *entire tree* before any passive effect runs, so
 * this always wins the race regardless of nesting depth. Guarded for SSR,
 * where useLayoutEffect would otherwise warn.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STORAGE_KEY = "importnest.recentlyViewed";
const LIMIT = 8;

export type RecentlyViewedEntry = {
  id: string;
  name: string;
  brandName: string;
  imageSrc: string;
};

type RecentlyViewedContextValue = {
  items: RecentlyViewedEntry[];
  recordView: (entry: RecentlyViewedEntry) => void;
};

const noopContextValue: RecentlyViewedContextValue = {
  items: [],
  recordView: () => {},
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue>(noopContextValue);

function loadItems(): RecentlyViewedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is RecentlyViewedEntry =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as RecentlyViewedEntry).id === "string" &&
          typeof (entry as RecentlyViewedEntry).name === "string" &&
          typeof (entry as RecentlyViewedEntry).brandName === "string" &&
          typeof (entry as RecentlyViewedEntry).imageSrc === "string",
      )
      .slice(0, LIMIT);
  } catch {
    return [];
  }
}

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RecentlyViewedEntry[]>([]);

  useIsomorphicLayoutEffect(() => {
    setItems(loadItems());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const recordView = useCallback((entry: RecentlyViewedEntry) => {
    setItems((current) => {
      const withoutEntry = current.filter((item) => item.id !== entry.id);
      return [entry, ...withoutEntry].slice(0, LIMIT);
    });
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ items, recordView }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}
