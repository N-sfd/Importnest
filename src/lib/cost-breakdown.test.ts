import { describe, expect, it } from "vitest";
import { formatCostBreakdownLine } from "@/lib/cost-breakdown";

describe("formatCostBreakdownLine — full data", () => {
  it("formats a plain real amount", () => {
    expect(formatCostBreakdownLine(45)).toEqual({
      text: "$45.00",
      isMissing: false,
      isEstimated: false,
    });
  });

  it("formats a real amount passed as a field object", () => {
    expect(formatCostBreakdownLine({ amount: 12.5 })).toEqual({
      text: "$12.50",
      isMissing: false,
      isEstimated: false,
    });
  });

  it("formats a real zero amount as a valid value, not missing", () => {
    expect(formatCostBreakdownLine(0)).toEqual({
      text: "$0.00",
      isMissing: false,
      isEstimated: false,
    });
  });
});

describe("formatCostBreakdownLine — missing shipping / missing fees", () => {
  it("reads null as 'Not provided', never a fabricated $0.00", () => {
    const result = formatCostBreakdownLine(null);
    expect(result.text).toBe("Not provided");
    expect(result.isMissing).toBe(true);
    expect(result.text).not.toContain("$0.00");
  });

  it("reads undefined the same way", () => {
    const result = formatCostBreakdownLine(undefined);
    expect(result.text).toBe("Not provided");
    expect(result.isMissing).toBe(true);
  });

  it("reads a field object with a null amount as missing", () => {
    const result = formatCostBreakdownLine({ amount: null });
    expect(result.text).toBe("Not provided");
    expect(result.isMissing).toBe(true);
  });
});

describe("formatCostBreakdownLine — discount", () => {
  it("signs a positive discount amount as a reduction", () => {
    const result = formatCostBreakdownLine(5, { signed: true });
    expect(result.text).toBe("-$5.00");
    expect(result.isMissing).toBe(false);
  });

  it("does not sign a zero discount (a real value, not a reduction)", () => {
    const result = formatCostBreakdownLine(0, { signed: true });
    expect(result.text).toBe("$0.00");
  });

  it("does not sign amounts when signed is not requested", () => {
    expect(formatCostBreakdownLine(5).text).toBe("$5.00");
  });
});

describe("formatCostBreakdownLine — estimated values", () => {
  it("flags a real amount as estimated without hiding the amount", () => {
    const result = formatCostBreakdownLine({ amount: 30, estimated: true });
    expect(result.text).toBe("$30.00");
    expect(result.isEstimated).toBe(true);
    expect(result.isMissing).toBe(false);
  });

  it("never reports isEstimated true for a missing amount", () => {
    const result = formatCostBreakdownLine({ amount: null, estimated: true });
    expect(result.isEstimated).toBe(false);
    expect(result.isMissing).toBe(true);
  });
});

describe("formatCostBreakdownLine — invalid negative values", () => {
  it("treats a negative stored amount as invalid, not a real value", () => {
    const result = formatCostBreakdownLine(-10);
    expect(result.text).toBe("Not provided");
    expect(result.isMissing).toBe(true);
  });

  it("treats NaN as invalid", () => {
    const result = formatCostBreakdownLine(Number.NaN);
    expect(result.text).toBe("Not provided");
    expect(result.isMissing).toBe(true);
  });

  it("treats Infinity as invalid", () => {
    const result = formatCostBreakdownLine(Number.POSITIVE_INFINITY);
    expect(result.text).toBe("Not provided");
    expect(result.isMissing).toBe(true);
  });

  it("never signs an invalid negative amount as if it were a valid discount", () => {
    const result = formatCostBreakdownLine(-5, { signed: true });
    expect(result.text).toBe("Not provided");
  });
});
