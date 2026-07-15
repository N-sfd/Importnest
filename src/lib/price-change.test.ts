import { describe, expect, it } from "vitest";
import { formatPriceChange } from "@/lib/price-change";

describe("formatPriceChange", () => {
  it("returns null when there's no real prior price to compare against", () => {
    expect(formatPriceChange(null)).toBeNull();
    expect(formatPriceChange(undefined)).toBeNull();
  });

  it("returns null for a non-finite delta rather than fabricating text", () => {
    expect(formatPriceChange(Number.NaN)).toBeNull();
  });

  it("reads as 'No change' for a delta under half a cent", () => {
    expect(formatPriceChange(0)).toEqual({ text: "No change", tone: "none" });
    expect(formatPriceChange(0.001)).toEqual({ text: "No change", tone: "none" });
  });

  it("reads as a price decrease ('Down $X')", () => {
    expect(formatPriceChange(-15)).toEqual({ text: "Down $15.00", tone: "down" });
  });

  it("reads as a price increase ('Up $X')", () => {
    expect(formatPriceChange(7.5)).toEqual({ text: "Up $7.50", tone: "up" });
  });
});
