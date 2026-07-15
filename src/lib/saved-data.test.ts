import { describe, expect, it } from "vitest";
import { isPriceDropTriggered, parseThresholdPrice } from "@/lib/saved-data";

describe("parseThresholdPrice", () => {
  it("parses a plain numeric string", () => {
    expect(parseThresholdPrice("250")).toBe(250);
    expect(parseThresholdPrice("19.99")).toBe(19.99);
  });
  it("extracts the numeric part of a legacy formatted threshold", () => {
    expect(parseThresholdPrice("≤ $250")).toBe(250);
  });
  it("returns null for non-numeric or missing thresholds", () => {
    expect(parseThresholdPrice("Back in stock")).toBeNull();
    expect(parseThresholdPrice(null)).toBeNull();
    expect(parseThresholdPrice("")).toBeNull();
  });
});

describe("isPriceDropTriggered", () => {
  it("triggers when the current price is at or below the threshold", () => {
    expect(isPriceDropTriggered("250", 250)).toBe(true);
    expect(isPriceDropTriggered("250", 200)).toBe(true);
  });
  it("does not trigger when the current price is above the threshold", () => {
    expect(isPriceDropTriggered("250", 260)).toBe(false);
  });
  it("never triggers without a valid threshold or current price", () => {
    expect(isPriceDropTriggered(null, 200)).toBe(false);
    expect(isPriceDropTriggered("250", null)).toBe(false);
    expect(isPriceDropTriggered("not a price", 200)).toBe(false);
  });
});
