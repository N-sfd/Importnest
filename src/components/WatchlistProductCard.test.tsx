import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WatchlistProductCard } from "@/components/WatchlistProductCard";
import type { WatchlistItem } from "@/lib/saved-data";

function makeItem(overrides: Partial<WatchlistItem> = {}): WatchlistItem {
  return {
    savedProductId: "saved-1",
    alertId: "alert-1",
    canonicalProductId: "cp-apex-ah4200",
    brandName: "Apex Home",
    productName: "Apex Quiet Dishwasher AH-4200",
    currentPrice: 849,
    targetPrice: 800,
    threshold: "800",
    alertType: "price-drop",
    status: "watching",
    sourceCoverage: 3,
    offerCount: 5,
    priceChange: -15,
    lastCheckedMinutesAgo: 10,
    priceHistory: [
      { day: "2026-07-10", total: 864 },
      { day: "2026-07-14", total: 849 },
    ],
    ...overrides,
  };
}

describe("WatchlistProductCard — every field present", () => {
  it("renders image, name, current best price, target price, price change, offer count, last checked, and alert status", () => {
    const html = renderToStaticMarkup(<WatchlistProductCard item={makeItem()} />);

    expect(html).toContain("Apex Home");
    expect(html).toContain("Apex Quiet Dishwasher AH-4200");
    expect(html).toContain("$849.00");
    expect(html).toContain("$800.00");
    expect(html).toContain("Down $15.00");
    expect(html).toContain("5 offers");
    expect(html).toContain("Watching");
  });

  it("renders View comparison, Edit alert, Pause/Resume, and Remove actions", () => {
    const html = renderToStaticMarkup(<WatchlistProductCard item={makeItem()} />);

    expect(html).toContain("View comparison");
    expect(html).toContain("Edit alert");
    expect(html).toContain("Pause");
    expect(html).toContain("Remove");
  });
});

describe("WatchlistProductCard — no price history", () => {
  it("shows 'Not provided' instead of a fabricated price change", () => {
    const html = renderToStaticMarkup(
      <WatchlistProductCard item={makeItem({ priceChange: null, priceHistory: [] })} />,
    );
    expect(html).toContain("Not provided");
    expect(html).not.toContain("Down $");
    expect(html).not.toContain("Up $");
  });
});

describe("WatchlistProductCard — missing current price", () => {
  it("shows an honest 'Not provided' instead of $0.00", () => {
    const html = renderToStaticMarkup(<WatchlistProductCard item={makeItem({ currentPrice: null })} />);
    expect(html).toContain("Not provided");
    expect(html).not.toContain("$0.00");
  });
});

describe("WatchlistProductCard — no alert set", () => {
  it("shows 'Not provided' for the target price and omits the Pause/Resume control", () => {
    const html = renderToStaticMarkup(
      <WatchlistProductCard
        item={makeItem({ alertId: null, alertType: null, targetPrice: null, status: "none" })}
      />,
    );
    expect(html).toContain("Not provided");
    expect(html).not.toContain("Pause");
    expect(html).not.toContain("Resume");
    expect(html).toContain("No alert");
  });
});

describe("WatchlistProductCard — alert status variants", () => {
  it("labels a triggered price-drop alert", () => {
    const html = renderToStaticMarkup(<WatchlistProductCard item={makeItem({ status: "triggered" })} />);
    expect(html).toContain("Price drop");
  });

  it("labels a paused alert and shows Resume instead of Pause", () => {
    const html = renderToStaticMarkup(<WatchlistProductCard item={makeItem({ status: "paused" })} />);
    expect(html).toContain("Paused");
    expect(html).toContain("Resume");
  });
});

describe("WatchlistProductCard — offer count wording", () => {
  it("uses singular 'offer' for exactly one", () => {
    const html = renderToStaticMarkup(<WatchlistProductCard item={makeItem({ offerCount: 1 })} />);
    expect(html).toContain("1 offer");
    expect(html).not.toContain("1 offers");
  });
});

describe("WatchlistProductCard — price increase", () => {
  it("labels a higher current price as 'Up $X'", () => {
    const html = renderToStaticMarkup(<WatchlistProductCard item={makeItem({ priceChange: 12 })} />);
    expect(html).toContain("Up $12.00");
  });
});
