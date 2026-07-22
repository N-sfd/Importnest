import { describe, expect, it } from "vitest";
import {
  formatFreshness,
  FRESHNESS_OUTDATED_MINUTES,
  FRESHNESS_REFRESH_MINUTES,
  FRESHNESS_STALE_MINUTES,
  freshnessWarningLabel,
  getFreshnessState,
  getFreshnessWarningLevel,
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

describe("getFreshnessWarningLevel", () => {
  it("is none for unknown, fresh, or aging-but-under-a-day ages", () => {
    expect(getFreshnessWarningLevel(null)).toBe("none");
    expect(getFreshnessWarningLevel(60)).toBe("none");
    expect(getFreshnessWarningLevel(FRESHNESS_REFRESH_MINUTES - 1)).toBe("none");
  });

  it("is refresh once data is a day old, up to the outdated threshold", () => {
    expect(getFreshnessWarningLevel(FRESHNESS_REFRESH_MINUTES)).toBe("refresh");
    expect(getFreshnessWarningLevel(FRESHNESS_OUTDATED_MINUTES - 1)).toBe("refresh");
  });

  it("is outdated only once data is truly stale (48h+)", () => {
    expect(getFreshnessWarningLevel(FRESHNESS_OUTDATED_MINUTES)).toBe("outdated");
    expect(getFreshnessWarningLevel(72 * 60)).toBe("outdated");
  });
});

describe("needsFreshnessWarning", () => {
  it("does not warn for unknown ages, or anything under a day old", () => {
    expect(needsFreshnessWarning(null)).toBe(false);
    // A product checked 1 hour ago must never carry a refresh/outdated warning.
    expect(needsFreshnessWarning(60)).toBe(false);
    expect(needsFreshnessWarning(FRESHNESS_REFRESH_MINUTES - 1)).toBe(false);
  });

  it("warns once data is a day old, escalating the label past 48h", () => {
    expect(needsFreshnessWarning(FRESHNESS_REFRESH_MINUTES)).toBe(true);
    expect(freshnessWarningLabel(FRESHNESS_REFRESH_MINUTES)).toBe("May need refresh");

    expect(needsFreshnessWarning(FRESHNESS_OUTDATED_MINUTES)).toBe(true);
    expect(freshnessWarningLabel(FRESHNESS_OUTDATED_MINUTES)).toBe("Data may be outdated");
  });
});
