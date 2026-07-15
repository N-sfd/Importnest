import { describe, expect, it } from "vitest";
import {
  describePriceHistoryForScreenReaders,
  PRICE_HISTORY_WINDOW_DAYS,
  summarizePriceHistory,
  type PriceHistoryRawPoint,
} from "@/lib/price-history";

const NOW = new Date("2026-07-15T12:00:00.000Z");

function daysAgo(n: number, hour = 12): Date {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

function point(price: number, shipping: number, capturedAt: Date): PriceHistoryRawPoint {
  return { price, shipping, capturedAt };
}

describe("summarizePriceHistory — no history", () => {
  it("returns an empty summary (no fabricated points) when there are zero records", () => {
    const summary = summarizePriceHistory([], 199, NOW);
    expect(summary.points).toEqual([]);
    expect(summary.previousLowest).toBeNull();
    expect(summary.thirtyDayLow).toBeNull();
    expect(summary.lastChange).toBeNull();
    expect(summary.lastChangeAt).toBeNull();
    // The live current price still passes through even with no history.
    expect(summary.currentLowest).toBe(199);
  });
});

describe("summarizePriceHistory — one record", () => {
  it("is not enough to build a trend — no interpolated second point is invented", () => {
    const summary = summarizePriceHistory([point(100, 0, daysAgo(2))], 100, NOW);
    expect(summary.points).toEqual([]);
    expect(summary.thirtyDayLow).toBeNull();
    expect(summary.lastChange).toBeNull();
  });
});

describe("summarizePriceHistory — multiple records", () => {
  it("buckets each day to its real lowest total and computes stats from real points only", () => {
    const rows = [
      point(120, 5, daysAgo(5)),
      point(110, 5, daysAgo(3)),
      point(115, 5, daysAgo(3, 18)), // same day, higher — real daily min must win
      point(100, 0, daysAgo(1)),
    ];
    const summary = summarizePriceHistory(rows, 100, NOW);

    expect(summary.points).toEqual([
      { day: daysAgo(5).toISOString().slice(0, 10), total: 125 },
      { day: daysAgo(3).toISOString().slice(0, 10), total: 115 },
      { day: daysAgo(1).toISOString().slice(0, 10), total: 100 },
    ]);
    expect(summary.thirtyDayLow).toBe(100);
    expect(summary.previousLowest).toBe(115);
    expect(summary.currentLowest).toBe(100);
    expect(summary.lastChangeAt).toBe(daysAgo(1).toISOString().slice(0, 10));
  });

  it("falls back to the latest bucketed total as currentLowest when no live price is supplied", () => {
    const rows = [point(90, 0, daysAgo(4)), point(80, 0, daysAgo(1))];
    const summary = summarizePriceHistory(rows, null, NOW);
    expect(summary.currentLowest).toBe(80);
  });
});

describe("summarizePriceHistory — stale records", () => {
  it(`excludes records older than ${PRICE_HISTORY_WINDOW_DAYS} days from points and stats`, () => {
    const rows = [
      point(40, 0, daysAgo(PRICE_HISTORY_WINDOW_DAYS + 5)), // stale — outside window
      point(90, 0, daysAgo(4)),
      point(85, 0, daysAgo(1)),
    ];
    const summary = summarizePriceHistory(rows, 85, NOW);

    expect(summary.points).toHaveLength(2);
    expect(summary.points.some((p) => p.total === 40)).toBe(false);
    expect(summary.thirtyDayLow).toBe(85);
  });

  it("treats a product with only stale records the same as having no history", () => {
    const rows = [
      point(40, 0, daysAgo(PRICE_HISTORY_WINDOW_DAYS + 1)),
      point(45, 0, daysAgo(PRICE_HISTORY_WINDOW_DAYS + 2)),
    ];
    const summary = summarizePriceHistory(rows, 199, NOW);
    expect(summary.points).toEqual([]);
    expect(summary.thirtyDayLow).toBeNull();
  });

  it("excludes invalid records (negative or non-finite amounts) without repairing them", () => {
    const rows = [
      point(-10, 0, daysAgo(3)),
      point(Number.NaN, 0, daysAgo(2)),
      point(50, 0, daysAgo(1)),
      point(55, 0, daysAgo(0)),
    ];
    const summary = summarizePriceHistory(rows, 55, NOW);
    expect(summary.points).toHaveLength(2);
    expect(summary.points.every((p) => p.total >= 50)).toBe(true);
  });
});

describe("summarizePriceHistory — price decrease", () => {
  it("reports a negative lastChange when the newest total is lower than the previous day's", () => {
    const rows = [point(100, 0, daysAgo(3)), point(80, 0, daysAgo(1))];
    const summary = summarizePriceHistory(rows, 80, NOW);
    expect(summary.lastChange).toBe(-20);
  });
});

describe("summarizePriceHistory — price increase", () => {
  it("reports a positive lastChange when the newest total is higher than the previous day's", () => {
    const rows = [point(80, 0, daysAgo(3)), point(100, 0, daysAgo(1))];
    const summary = summarizePriceHistory(rows, 100, NOW);
    expect(summary.lastChange).toBe(20);
  });
});

describe("describePriceHistoryForScreenReaders", () => {
  it("summarizes every stat present in one sentence for assistive tech", () => {
    const rows = [point(100, 0, daysAgo(3)), point(80, 0, daysAgo(1))];
    const summary = summarizePriceHistory(rows, 80, NOW);
    const text = describePriceHistoryForScreenReaders(summary);

    expect(text).toContain("current lowest price $80.00");
    expect(text).toContain("previous lowest price $100.00");
    expect(text).toContain("30-day low $80.00");
    expect(text).toContain("last price change: down $20.00");
  });

  it("falls back to an honest 'unavailable' sentence when there is nothing to summarize", () => {
    const summary = summarizePriceHistory([], null, NOW);
    expect(describePriceHistoryForScreenReaders(summary)).toBe("Price history summary unavailable.");
  });
});
