import { getCompareProduct, getCompareRows } from "@/lib/compare-data";
import {
  buildRecommendationPanel,
  formatConditionLabel,
  totalKnownCost,
} from "@/lib/compare-view";
import { productImageFor } from "@/lib/product-images";

export type CompareBasketItem = {
  id: string;
  name: string;
  brandName: string;
  categoryName: string;
  imageSrc: string;
  lowestKnownPrice: number | null;
  offerCount: number;
  sourceCount: number;
  conditions: string[];
  /** Real delivery/pickup summary from listing delivery labels — never invented. */
  deliverySummary: string | null;
  lastCheckedMinutesAgo: number | null;
  /** Short ranking rationale for best-overall, when a clear top offer exists. */
  bestReason: string | null;
};

function summarizeDelivery(
  labels: string[],
): string | null {
  const cleaned = labels.map((l) => l.trim()).filter(Boolean);
  if (cleaned.length === 0) return null;
  const hasPickup = cleaned.some((l) => /pickup/i.test(l));
  const shipping = cleaned.filter((l) => !/pickup/i.test(l));
  if (hasPickup && shipping.length > 0) return `Pickup & delivery (${shipping[0]})`;
  if (hasPickup) return "Pickup available";
  return shipping[0] ?? cleaned[0] ?? null;
}

/** Builds compare-list display data from real product/listing rows only — no invented fields. */
export async function getCompareBasketItems(ids: string[]): Promise<CompareBasketItem[]> {
  const uniqueIds = [...new Set(ids)];

  const results = await Promise.all(
    uniqueIds.map(async (id): Promise<CompareBasketItem | null> => {
      const product = await getCompareProduct(id);
      if (!product) return null;

      const rows = await getCompareRows(id);
      const conditions = [...new Set(rows.map((row) => formatConditionLabel(row.listing.condition)))];
      const freshnessValues = rows
        .map((row) => row.listing.freshnessMinutesAgo)
        .filter((v): v is number => v != null);
      const sourceCount = new Set(rows.map((row) => row.listing.sourceId)).size;
      const deliverySummary = summarizeDelivery(rows.map((row) => row.listing.deliveryLabel));
      const panel = buildRecommendationPanel(rows, "best-overall");
      const bestReason = panel
        ? panel.rationale.length > 120
          ? `${panel.rationale.slice(0, 117)}…`
          : panel.rationale
        : rows.length > 0
          ? null
          : null;

      return {
        id,
        name: product.modelName,
        brandName: product.brand.name,
        categoryName: product.category.name,
        imageSrc: productImageFor(id, product.category.slug, product.modelName),
        lowestKnownPrice:
          rows.length > 0 ? Math.min(...rows.map((row) => totalKnownCost(row.listing))) : null,
        offerCount: rows.length,
        sourceCount,
        conditions,
        deliverySummary,
        lastCheckedMinutesAgo: freshnessValues.length > 0 ? Math.min(...freshnessValues) : null,
        bestReason,
      };
    }),
  );

  return results.filter((item): item is CompareBasketItem => item !== null);
}
