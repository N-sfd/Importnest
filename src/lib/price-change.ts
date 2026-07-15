export type PriceChangeTone = "down" | "up" | "none";

export type PriceChangeDisplay = {
  text: string;
  tone: PriceChangeTone;
};

/**
 * Formats a price delta (new total − old total) into shopper-facing copy.
 * Returns null when there's no real prior price to compare against — never
 * fabricates a "no change" claim from missing history. Shared by the
 * comparison page's price-history section and the saved-products cards so
 * "Up $X" / "Down $X" / "No change" wording stays identical everywhere.
 */
export function formatPriceChange(change: number | null | undefined): PriceChangeDisplay | null {
  if (change == null || !Number.isFinite(change)) return null;
  if (Math.abs(change) < 0.005) return { text: "No change", tone: "none" };
  if (change < 0) return { text: `Down $${Math.abs(change).toFixed(2)}`, tone: "down" };
  return { text: `Up $${change.toFixed(2)}`, tone: "up" };
}
