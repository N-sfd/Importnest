import { getCompareProduct, getCompareRows } from "@/lib/compare-data";
import { formatConditionLabel, totalKnownCost } from "@/lib/compare-view";
import { productImageFor } from "@/lib/images";

export type CompareBasketItem = {
  id: string;
  name: string;
  brandName: string;
  categoryName: string;
  imageSrc: string;
  lowestKnownPrice: number | null;
  offerCount: number;
  conditions: string[];
  lastCheckedMinutesAgo: number | null;
};

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

      return {
        id,
        name: product.modelName,
        brandName: product.brand.name,
        categoryName: product.category.name,
        imageSrc: productImageFor(id),
        lowestKnownPrice: rows.length > 0 ? Math.min(...rows.map((row) => totalKnownCost(row.listing))) : null,
        offerCount: rows.length,
        conditions,
        lastCheckedMinutesAgo: freshnessValues.length > 0 ? Math.min(...freshnessValues) : null,
      };
    }),
  );

  return results.filter((item): item is CompareBasketItem => item !== null);
}
