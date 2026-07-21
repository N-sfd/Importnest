import { describe, expect, it } from "vitest";
import {
  formatFreshness,
  FRESHNESS_STALE_MINUTES,
  FRESHNESS_WARN_MINUTES,
  freshnessWarningLabel,
  getFreshnessState,
  isFreshnessStale,
  needsFreshnessWarning,
} from "@/lib/freshness";

describe("formatFreshness", () => {
  it("formats just-now", () => {
    expect(formatFreshness(0)).toBe("Updated just now");
  });

  it("formats minutes", () => {
    expect(formatFreshness(1)).toBe("Updated 1 minute ago");
    expect(formatFreshness(8)).toBe("Updated 8 minutes ago");
    expect(formatFreshness(59)).toBe("Updated 59 minutes ago");
  });

  it("formats hours", () => {
    expect(formatFreshness(60)).toBe("Updated 1 hour ago");
    expect(formatFreshness(125)).toBe("Updated 2 hours ago");
    expect(formatFreshness(23 * 60)).toBe("Updated 23 hours ago");
  });

  it("formats yesterday and multi-day", () => {
    expect(formatFreshness(24 * 60)).toBe("Updated yesterday");
    expect(formatFreshness(3 * 24 * 60)).toBe("Updated 3 days ago");
  });

  it("never emits a raw technical value like '2639m'", () => {
    const text = formatFreshness(2639);
    expect(text).not.toMatch(/\d+m\b/);
    expect(text).not.toContain("2639");
  });

  it("formats an unknown timestamp softly", () => {
    expect(formatFreshness(null)).toBe("Last checked unknown");
    expect(formatFreshness(undefined)).toBe("Last checked unknown");
  });
});

describe("getFreshnessState", () => {
  it("is unknown for a missing timestamp", () => {
    expect(getFreshnessState(null)).toBe("unknown");
    expect(getFreshnessState(undefined)).toBe("unknown");
  });

  it("is fresh below the fresh threshold", () => {
    expect(getFreshnessState(0)).toBe("fresh");
    expect(getFreshnessState(14)).toBe("fresh");
  });

  it("is aging between fresh and stale thresholds", () => {
    expect(getFreshnessState(15)).toBe("aging");
    expect(getFreshnessState(FRESHNESS_STALE_MINUTES - 1)).toBe("aging");
  });

  it("is stale at and above the stale threshold", () => {
    expect(getFreshnessState(FRESHNESS_STALE_MINUTES)).toBe("stale");
    expect(getFreshnessState(2639)).toBe("stale");
  });
});

describe("isFreshnessStale", () => {
  it("treats stale ages and unknown ages both as stale for ranking gates", () => {
    expect(isFreshnessStale(FRESHNESS_STALE_MINUTES)).toBe(true);
    expect(isFreshnessStale(null)).toBe(true);
  });

  it("treats fresh and aging ages as not stale", () => {
    expect(isFreshnessStale(0)).toBe(false);
    expect(isFreshnessStale(FRESHNESS_STALE_MINUTES - 1)).toBe(false);
  });
});

describe("needsFreshnessWarning", () => {
  it("does not warn for unknown or recent ages", () => {
    expect(needsFreshnessWarning(null)).toBe(false);
    expect(needsFreshnessWarning(60)).toBe(false);
    expect(needsFreshnessWarning(FRESHNESS_WARN_MINUTES - 1)).toBe(false);
  });

  it("warns only when data is truly old", () => {
    expect(needsFreshnessWarning(FRESHNESS_WARN_MINUTES)).toBe(true);
    expect(needsFreshnessWarning(24 * 60)).toBe(true);
    expect(freshnessWarningLabel()).toBe("May need refresh");
  });
});
