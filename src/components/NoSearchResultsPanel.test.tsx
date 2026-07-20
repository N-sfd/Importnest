import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NoSearchResultsPanel } from "@/components/NoSearchResultsPanel";
import type { ResultsPageParams } from "@/components/SearchResultsLayout";

describe("NoSearchResultsPanel — no exact match for the current filters", () => {
  it("names the query in the description", () => {
    const html = renderToStaticMarkup(<NoSearchResultsPanel params={{ q: "quiet dishwasher" }} />);
    expect(html).toContain("quiet dishwasher");
    expect(html).toContain("No matching product found");
  });

  it("falls back to a broadening message when there's no query at all", () => {
    const html = renderToStaticMarkup(<NoSearchResultsPanel params={{}} />);
    expect(html).toContain("Try broadening your criteria");
  });
});

describe("NoSearchResultsPanel — all filters too strict", () => {
  const strictParams: ResultsPageParams = {
    q: "quiet dishwasher",
    category: "appliances",
    brand: "Apex Home",
    priceMax: "100",
    condition: "new",
    pickup: "1",
    comparable: "0",
  };

  it("offers to remove one filter at a time, not all of them at once", () => {
    const html = renderToStaticMarkup(<NoSearchResultsPanel params={strictParams} />);
    const removeMatches = html.match(/Remove [a-z ]+/g) ?? [];
    expect(removeMatches.length).toBe(1);
  });

  it("offers to allow comparable alternatives when the search was exact-only", () => {
    const html = renderToStaticMarkup(<NoSearchResultsPanel params={strictParams} />);
    expect(html).toContain("Allow comparable alternatives");
  });

  it("always offers Browse category and Edit search alongside filter relief", () => {
    const html = renderToStaticMarkup(<NoSearchResultsPanel params={strictParams} />);
    expect(html).toContain("Browse category");
    expect(html).toContain("Edit search");
  });
});

describe("NoSearchResultsPanel — user relaxes one filter", () => {
  it("removes only the highest-priority captured filter, preserving every other one", () => {
    // "condition" outranks "priceMax" in removal priority, so it's the one offered.
    const params: ResultsPageParams = {
      q: "quiet dishwasher",
      priceMax: "100",
      condition: "new",
    };
    const html = renderToStaticMarkup(<NoSearchResultsPanel params={params} />);
    expect(html).toContain("Remove condition filter");

    // The only /search/results?... link in this panel (with no category
    // captured, "Browse category" points at plain /search/results) is the
    // "Remove condition filter" action itself.
    const hrefMatch = html.match(/href="(\/search\/results\?[^"]+)"/);
    expect(hrefMatch).not.toBeNull();

    // React SSR HTML-escapes "&" between query params as "&amp;".
    const qs = new URLSearchParams(hrefMatch![1].split("?")[1].replace(/&amp;/g, "&"));
    expect(qs.has("condition")).toBe(false);
    expect(qs.get("priceMax")).toBe("100");
    expect(qs.get("q")).toBe("quiet dishwasher");
  });
});

describe("NoSearchResultsPanel — no source data (no category known)", () => {
  it("browses everything instead of a fabricated category when none was captured", () => {
    const html = renderToStaticMarkup(<NoSearchResultsPanel params={{ q: "unobtainium widget" }} />);
    // Primary "Browse category" stays category-agnostic; department chips are separate.
    expect(html).toContain('href="/search/results"');
    expect(html).toContain("Explore other departments");
    expect(html).toMatch(/Browse category<\/a>/);
  });

  it("links to the real captured category when one exists", () => {
    const html = renderToStaticMarkup(
      <NoSearchResultsPanel params={{ q: "quiet dishwasher", category: "appliances" }} />,
    );
    expect(html).toContain('href="/search/results?category=appliances"');
  });

  it("shows a softer empty state for category-only browsing", () => {
    const html = renderToStaticMarkup(
      <NoSearchResultsPanel params={{ category: "accessories" }} />,
    );
    expect(html).toContain("Browse Accessories");
    expect(html).toContain("Explore popular products below");
  });
});
