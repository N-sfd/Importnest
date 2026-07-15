import { prisma } from "@/lib/prisma";
import { getCompareRows, totalKnownCost } from "@/lib/compare-data";

export type AlertType = "price-drop" | "back-in-stock" | "any-change";
export type AlertStatus = "watching" | "triggered" | "paused";

/**
 * Alert.threshold is a free-text column shared across alert types (seed data
 * has display strings like "≤ $250" and "Back in stock"), so a price-drop
 * threshold is parsed defensively rather than assumed to be a clean number —
 * new alerts created through the app store a plain numeric string, but this
 * still needs to tolerate the legacy formatted values.
 */
export function parseThresholdPrice(threshold: string | null): number | null {
  if (!threshold) return null;
  const match = threshold.match(/[\d.]+/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

/** Pure so the trigger rule itself is unit-testable without a DB round trip. */
export function isPriceDropTriggered(threshold: string | null, currentPrice: number | null): boolean {
  const target = parseThresholdPrice(threshold);
  if (target == null || currentPrice == null) return false;
  return currentPrice <= target;
}

/** Lowest total known cost currently listed for a product, or null if nothing is listed. */
export async function getBestCurrentPrice(canonicalProductId: string): Promise<number | null> {
  const rows = await getCompareRows(canonicalProductId);
  if (rows.length === 0) return null;
  return Math.min(...rows.map((r) => totalKnownCost(r.listing)));
}

export type SaveAndAlertState = {
  isSaved: boolean;
  alert: { threshold: string | null; isActive: boolean } | null;
};

/** Used by the compare page to render Save/alert controls for the current viewer, if any. */
export async function getSaveAndAlertState(
  userId: string,
  canonicalProductId: string,
): Promise<SaveAndAlertState> {
  const [saved, alert] = await Promise.all([
    prisma.savedProduct.findUnique({
      where: { userId_canonicalProductId: { userId, canonicalProductId } },
    }),
    prisma.alert.findUnique({
      where: { userId_canonicalProductId_type: { userId, canonicalProductId, type: "price-drop" } },
    }),
  ]);

  return {
    isSaved: saved != null,
    alert: alert ? { threshold: alert.threshold, isActive: alert.isActive } : null,
  };
}

export type WatchlistItem = {
  savedProductId: string | null;
  alertId: string | null;
  canonicalProductId: string;
  productName: string;
  currentPrice: number | null;
  threshold: string | null;
  alertType: AlertType | null;
  status: AlertStatus;
  sourceCoverage: number;
};

/**
 * Merges SavedProduct and Alert rows into one per-product view — a shopper
 * can save a product without an alert, or (today) have at most one alert per
 * type per product (see the Alert @@unique constraint). Status is computed
 * live against current listing prices rather than persisted, so it can never
 * go stale between syncs.
 */
export async function getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
  const [savedProducts, alerts] = await Promise.all([
    prisma.savedProduct.findMany({
      where: { userId },
      include: { canonicalProduct: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.alert.findMany({
      where: { userId },
      include: { canonicalProduct: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const productIds = new Set([
    ...savedProducts.map((s) => s.canonicalProductId),
    ...alerts.map((a) => a.canonicalProductId),
  ]);

  const items: WatchlistItem[] = [];
  for (const productId of productIds) {
    const saved = savedProducts.find((s) => s.canonicalProductId === productId);
    const alert = alerts.find((a) => a.canonicalProductId === productId);
    const canonicalProduct = saved?.canonicalProduct ?? alert?.canonicalProduct;
    if (!canonicalProduct) continue;

    const [currentPrice, sourceCoverage] = await Promise.all([
      getBestCurrentPrice(productId),
      prisma.listing.count({ where: { canonicalProductId: productId } }),
    ]);

    let status: AlertStatus = "watching";
    if (alert) {
      if (!alert.isActive) {
        status = "paused";
      } else if (alert.type === "price-drop" && isPriceDropTriggered(alert.threshold, currentPrice)) {
        status = "triggered";
      }
    }

    items.push({
      savedProductId: saved?.id ?? null,
      alertId: alert?.id ?? null,
      canonicalProductId: productId,
      productName: canonicalProduct.modelName,
      currentPrice,
      threshold: alert?.threshold ?? null,
      alertType: (alert?.type as AlertType | undefined) ?? null,
      status,
      sourceCoverage,
    });
  }

  return items;
}
