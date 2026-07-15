import { prisma } from "@/lib/prisma";
import { minutesSince } from "@/lib/compare-view";
import { getCompareRows, totalKnownCost } from "@/lib/compare-data";

export type AlertType = "price-drop" | "back-in-stock" | "any-change";
export type AlertStatus = "watching" | "triggered" | "paused" | "none";

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

export type PriceHistoryPoint = {
  /** ISO date (YYYY-MM-DD) for the bucket */
  day: string;
  total: number;
};

export type WatchlistItem = {
  savedProductId: string | null;
  alertId: string | null;
  canonicalProductId: string;
  brandName: string;
  productName: string;
  currentPrice: number | null;
  /** Parsed numeric target, when an alert exists */
  targetPrice: number | null;
  threshold: string | null;
  alertType: AlertType | null;
  status: AlertStatus;
  /** Distinct approved sources currently listing this product */
  sourceCoverage: number;
  /** Current best − previous history best; null when no real prior point */
  priceChange: number | null;
  lastCheckedMinutesAgo: number | null;
  /**
   * Daily min total-known-cost points from PriceHistory.
   * Empty unless at least two real history points exist.
   */
  priceHistory: PriceHistoryPoint[];
};

function bucketDailyMin(
  rows: { price: number; shipping: number; capturedAt: Date }[],
): PriceHistoryPoint[] {
  const byDay = new Map<string, number>();
  for (const row of rows) {
    const day = row.capturedAt.toISOString().slice(0, 10);
    const total = row.price + row.shipping;
    const existing = byDay.get(day);
    if (existing == null || total < existing) byDay.set(day, total);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, total]) => ({ day, total }));
}

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
      include: { canonicalProduct: { include: { brand: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.alert.findMany({
      where: { userId },
      include: { canonicalProduct: { include: { brand: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const productIds = [
    ...new Set([
      ...savedProducts.map((s) => s.canonicalProductId),
      ...alerts.map((a) => a.canonicalProductId),
    ]),
  ];
  if (productIds.length === 0) return [];

  const listings = await prisma.listing.findMany({
    where: {
      canonicalProductId: { in: productIds },
      matches: { some: { status: "approved" } },
    },
    select: {
      id: true,
      canonicalProductId: true,
      sourceId: true,
      price: true,
      shipping: true,
      fees: true,
      freshnessCapturedAt: true,
    },
  });

  const listingIds = listings.map((l) => l.id);
  const historyRows =
    listingIds.length === 0
      ? []
      : await prisma.priceHistory.findMany({
          where: { listingId: { in: listingIds } },
          select: {
            listingId: true,
            price: true,
            shipping: true,
            capturedAt: true,
          },
          orderBy: { capturedAt: "asc" },
        });

  const listingProduct = new Map(listings.map((l) => [l.id, l.canonicalProductId!]));

  const items: WatchlistItem[] = [];
  for (const productId of productIds) {
    const saved = savedProducts.find((s) => s.canonicalProductId === productId);
    const alert = alerts.find((a) => a.canonicalProductId === productId);
    const canonicalProduct = saved?.canonicalProduct ?? alert?.canonicalProduct;
    if (!canonicalProduct) continue;

    const productListings = listings.filter((l) => l.canonicalProductId === productId);
    const currentPrice =
      productListings.length === 0
        ? null
        : Math.min(...productListings.map((l) => l.price + l.shipping + l.fees));

    const sourceCoverage = new Set(productListings.map((l) => l.sourceId)).size;

    const freshest = productListings.reduce<Date | null>((best, l) => {
      if (!best || l.freshnessCapturedAt > best) return l.freshnessCapturedAt;
      return best;
    }, null);

    const productHistoryRaw = historyRows.filter(
      (h) => listingProduct.get(h.listingId) === productId,
    );
    const daily = bucketDailyMin(productHistoryRaw);
    const priceHistory = daily.length >= 2 ? daily : [];

    let priceChange: number | null = null;
    if (currentPrice != null && daily.length >= 2) {
      priceChange = currentPrice - daily[daily.length - 2]!.total;
    } else if (daily.length >= 2) {
      priceChange = daily[daily.length - 1]!.total - daily[daily.length - 2]!.total;
    }

    let status: AlertStatus = "none";
    if (alert) {
      if (!alert.isActive) {
        status = "paused";
      } else if (alert.type === "price-drop" && isPriceDropTriggered(alert.threshold, currentPrice)) {
        status = "triggered";
      } else {
        status = "watching";
      }
    }

    items.push({
      savedProductId: saved?.id ?? null,
      alertId: alert?.id ?? null,
      canonicalProductId: productId,
      brandName: canonicalProduct.brand.name,
      productName: canonicalProduct.modelName,
      currentPrice,
      targetPrice: parseThresholdPrice(alert?.threshold ?? null),
      threshold: alert?.threshold ?? null,
      alertType: (alert?.type as AlertType | undefined) ?? null,
      status,
      sourceCoverage,
      priceChange,
      lastCheckedMinutesAgo: freshest ? minutesSince(freshest) : null,
      priceHistory,
    });
  }

  // Preserve save-order preference: saved first by createdAt, then alert-only
  const savedOrder = new Map(savedProducts.map((s, i) => [s.canonicalProductId, i]));
  items.sort((a, b) => (savedOrder.get(a.canonicalProductId) ?? 999) - (savedOrder.get(b.canonicalProductId) ?? 999));

  return items;
}
