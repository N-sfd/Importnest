import { describe, expect, it } from "vitest";
import {
  formatAlertThresholdLabel,
  isPriceDropTriggered,
  parseAlertThreshold,
  parseThresholdPrice,
  removeAlertConfirmMessage,
  removeProductConfirmMessage,
} from "@/lib/saved-data";

describe("parseThresholdPrice", () => {
  it("parses a plain numeric string", () => {
    expect(parseThresholdPrice("250")).toBe(250);
    expect(parseThresholdPrice("19.99")).toBe(19.99);
  });
  it("extracts the numeric part of a legacy formatted threshold", () => {
    expect(parseThresholdPrice("≤ $250")).toBe(250);
  });
  it("computes the absolute target from a percent-drop encoding", () => {
    // 15% off $200 → $170
    expect(parseThresholdPrice("pct:15@200")).toBe(170);
    expect(parseThresholdPrice("pct:10@199.99")).toBe(179.99);
  });
  it("returns null for non-numeric or missing thresholds", () => {
    expect(parseThresholdPrice("Back in stock")).toBeNull();
    expect(parseThresholdPrice(null)).toBeNull();
    expect(parseThresholdPrice("")).toBeNull();
    expect(parseThresholdPrice("pct:0@200")).toBeNull();
    expect(parseThresholdPrice("pct:100@200")).toBeNull();
  });
});

describe("parseAlertThreshold / formatAlertThresholdLabel", () => {
  it("distinguishes dollar and percent encodings", () => {
    expect(parseAlertThreshold("199.99")).toEqual({ kind: "dollar", amount: 199.99 });
    expect(parseAlertThreshold("pct:15@200")).toEqual({
      kind: "percent",
      percent: 15,
      baseline: 200,
      target: 170,
    });
  });
  it("formats a human-readable label for each kind", () => {
    expect(formatAlertThresholdLabel("199.99")).toBe("$199.99");
    expect(formatAlertThresholdLabel("pct:15@200")).toBe("15% off (≤ $170.00)");
    expect(formatAlertThresholdLabel(null)).toBeNull();
  });
});

describe("isPriceDropTriggered", () => {
  it("triggers when the current price is at or below the threshold", () => {
    expect(isPriceDropTriggered("250", 250)).toBe(true);
    expect(isPriceDropTriggered("250", 200)).toBe(true);
  });
  it("triggers percent-drop alerts against the computed absolute target", () => {
    expect(isPriceDropTriggered("pct:15@200", 170)).toBe(true);
    expect(isPriceDropTriggered("pct:15@200", 169)).toBe(true);
    expect(isPriceDropTriggered("pct:15@200", 171)).toBe(false);
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

describe("removeProductConfirmMessage / removeAlertConfirmMessage — destructive action confirmation copy", () => {
  it("names the specific product and mentions the alert is removed too", () => {
    const message = removeProductConfirmMessage("Apex Quiet Dishwasher AH-4200");
    expect(message).toContain("Apex Quiet Dishwasher AH-4200");
    expect(message).toContain("saved products");
    expect(message).toContain("price alert");
  });

  it("names the specific product for the alert-only removal prompt", () => {
    const message = removeAlertConfirmMessage("Apex Quiet Dishwasher AH-4200");
    expect(message).toContain("Apex Quiet Dishwasher AH-4200");
    expect(message).toContain("price alert");
  });
});
