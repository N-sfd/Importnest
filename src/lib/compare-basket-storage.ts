export const COMPARE_BASKET_LIMIT = 4;

export type CompareBasketEntry = { id: string; name: string };

/**
 * Pure parsing/validation for the compare-basket localStorage payload —
 * extracted so it can be unit-tested without a DOM/localStorage global
 * (vitest.config.ts runs with environment: "node").
 */
export function parseCompareBasketJSON(raw: string | null): CompareBasketEntry[] {
  if (!raw) return [];
  try {
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

export type AddToBasketResult = {
  items: CompareBasketEntry[];
  outcome: "added" | "duplicate" | "limit";
};

export function addToBasket(current: CompareBasketEntry[], id: string, name: string): AddToBasketResult {
  if (current.some((item) => item.id === id)) {
    return { items: current, outcome: "duplicate" };
  }
  if (current.length >= COMPARE_BASKET_LIMIT) {
    return { items: current, outcome: "limit" };
  }
  return { items: [...current, { id, name }], outcome: "added" };
}

export function removeFromBasket(current: CompareBasketEntry[], id: string): CompareBasketEntry[] {
  return current.filter((item) => item.id !== id);
}
