import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PriceHistorySection } from "@/components/PriceHistorySection";
import { emptyPriceHistory, type ProductPriceHistorySummary } from "@/lib/price-history";

function makeSummary(overrides: Partial<ProductPriceHistorySummary> = {}): ProductPriceHistorySummary {
  return {
    points: [
      { day: "2026-07-10", total: 100 },
      { day: "2026-07-14", total: 90 },
    ],
    currentLowest: 90,
    previousLowest: 100,
    thirtyDayLow: 90,
    lastChange: -10,
    lastChangeAt: "2026-07-14",
    ...overrides,
  };
}

describe("PriceHistorySection — no history", () => {
  it("shows the honest not-enough-data message instead of a chart or stats", () => {
    const html = renderToStaticMarkup(<PriceHistorySection summary={emptyPriceHistory(120)} />);

    expect(html).toContain("Not enough recorded price checks yet");
    expect(html).not.toContain("Current lowest");
    expect(html).not.toContain("<svg");
  });

  it("renders nothing when hideWhenEmpty and there are fewer than two checks", () => {
    const html = renderToStaticMarkup(
      <PriceHistorySection summary={emptyPriceHistory(null)} hideWhenEmpty />,
    );
    expect(html).toBe("");
  });

  it("never shows illustrative or demo copy", () => {
    const html = renderToStaticMarkup(<PriceHistorySection summary={emptyPriceHistory(null)} />);
    expect(html).not.toContain("Illustrative");
    expect(html).not.toContain("demo");
  });
});

describe("PriceHistorySection — real history present", () => {
  it("uses the existing panel card style", () => {
    const html = renderToStaticMarkup(<PriceHistorySection summary={makeSummary()} />);
    expect(html).toContain('class="panel');
  });

  it("shows current lowest, previous lowest, 30-day low, and last change", () => {
    const html = renderToStaticMarkup(<PriceHistorySection summary={makeSummary()} />);

    expect(html).toContain("Current lowest");
    expect(html).toContain("$90.00");
    expect(html).toContain("Previous lowest");
    expect(html).toContain("$100.00");
    expect(html).toContain("30-day low");
    expect(html).toContain("Down $10.00");
    expect(html).toContain("2026-07-14");
  });

  it("renders a simple accessible chart with an aria-label and a screen-reader text summary", () => {
    const html = renderToStaticMarkup(<PriceHistorySection summary={makeSummary()} />);

    expect(html).toContain("role=\"img\"");
    expect(html).toContain("aria-label=");
    expect(html).toContain('class="sr-only"');
    expect(html).toContain("Price history summary:");
  });
});

describe("PriceHistorySection — price decrease", () => {
  it("labels a lower last price as 'Down $X'", () => {
    const html = renderToStaticMarkup(
      <PriceHistorySection summary={makeSummary({ lastChange: -12.5 })} />,
    );
    expect(html).toContain("Down $12.50");
  });
});

describe("PriceHistorySection — price increase", () => {
  it("labels a higher last price as 'Up $X'", () => {
    const html = renderToStaticMarkup(
      <PriceHistorySection summary={makeSummary({ lastChange: 8 })} />,
    );
    expect(html).toContain("Up $8.00");
  });
});
