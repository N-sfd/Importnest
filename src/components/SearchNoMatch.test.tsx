import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchNoMatchContent } from "@/components/SearchNoMatch";
import type { SearchFlowParams, SearchIntent } from "@/lib/search-intent";

/**
 * Renders the content component directly (no PageShell) — the full
 * SearchNoMatch wraps this in PageShell, which pulls in an async,
 * auth-checking Header that needs a real request/DB context. The candidate
 * products list here is what a resolved prisma lookup would already look
 * like; SearchNoMatch's own DB fetch is exercised for real by this project's
 * *.integration.test.ts suite, not here.
 */
function renderNoMatch(options: {
  query?: string;
  intent?: Partial<SearchIntent>;
  currentParams?: SearchFlowParams;
  products?: { id: string; modelName: string; brand: { name: string } }[];
  categorySlug?: string;
}) {
  const jsx = (
    <SearchNoMatchContent
      query={options.query ?? "quiet dishwasher"}
      intent={options.intent}
      products={options.products ?? []}
      categorySlug={options.categorySlug}
      currentParams={options.currentParams ?? { q: options.query ?? "quiet dishwasher" }}
    />
  );
  return renderToStaticMarkup(jsx);
}

describe("SearchNoMatch — no exact match", () => {
  it("shows the exact required heading and names the query", () => {
    const html = renderNoMatch({ query: "flux capacitor" });
    expect(html).toContain("No exact match found");
    expect(html).toContain("flux capacitor");
  });

  it("always offers Search again and Browse category, even with nothing else captured", () => {
    const html = renderNoMatch({});
    expect(html).toContain("Search again");
    expect(html).toContain("Browse category");
  });

  it("never shows a Comparable alternative badge when there are no candidates", () => {
    const html = renderNoMatch({});
    expect(html).not.toContain("Comparable alternative");
  });
});

describe("SearchNoMatch — comparable alternatives available", () => {
  const products = [
    { id: "cp-1", modelName: "Apex Quiet Dishwasher AH-4200", brand: { name: "Apex Home" } },
    { id: "cp-2", modelName: "Nordica Slimline Dishwasher", brand: { name: "Nordica" } },
  ];

  it("labels every candidate 'Comparable alternative', never as an exact match", () => {
    const html = renderNoMatch({ query: "dishwasher", products });
    expect(html).toContain("Comparable alternative");
    expect(html).not.toContain("Exact match");
    // One badge per candidate — not mixed together as a single vague label.
    const badgeCount = html.match(/border-dashed border-navy-800\/35[^>]*>\s*Comparable alternative/g)?.length;
    expect(badgeCount).toBe(products.length);
  });

  it("shows each candidate's real name and brand, never a placeholder", () => {
    const html = renderNoMatch({ query: "dishwasher", products });
    expect(html).toContain("Apex Quiet Dishwasher AH-4200");
    expect(html).toContain("Apex Home");
    expect(html).toContain("Nordica Slimline Dishwasher");
    expect(html).toContain("Nordica");
  });

  it("links each candidate to its comparison page tagged as comparable", () => {
    const html = renderNoMatch({ query: "dishwasher", products });
    expect(html).toContain('href="/compare/cp-1?comparable=1"');
    expect(html).toContain('href="/compare/cp-2?comparable=1"');
  });

  it("still offers Search again and Browse category alongside the candidates", () => {
    const html = renderNoMatch({ query: "dishwasher", products, categorySlug: "appliances" });
    expect(html).toContain("Search again");
    expect(html).toContain('href="/search/results?category=appliances"');
  });
});

describe("SearchNoMatch — no source data (nothing to browse toward)", () => {
  it("falls back to browsing everything instead of a fabricated category when none is known", () => {
    const html = renderNoMatch({ query: "unobtainium widget", products: [], categorySlug: undefined });
    expect(html).toContain('href="/search/results"');
    expect(html).not.toContain("category=appliances");
  });
});

describe("SearchNoMatch — captured preferences stay visible", () => {
  it("shows budget, condition, comparable preference, and delivery timing chips", () => {
    const html = renderNoMatch({
      intent: {
        budgetMax: 200,
        condition: "used",
        allowComparableAlternatives: false,
        deliveryBy: "this week",
      },
    });

    expect(html).toContain("Under $200");
    expect(html).toContain("Condition: used");
    expect(html).toContain("Exact model only");
    expect(html).toContain("Needed by: this week");
  });

  it("shows nothing captured when no intent was resolved yet", () => {
    const html = renderNoMatch({ intent: undefined });
    expect(html).not.toContain("What we captured");
  });
});

describe("SearchNoMatch — offered actions reflect what's actually captured (all filters too strict)", () => {
  it("offers 'Allow comparable products' only when the shopper chose exact-only", () => {
    const exactOnly = renderNoMatch({ intent: { allowComparableAlternatives: false } });
    expect(exactOnly).toContain("Allow comparable products");

    const undecided = renderNoMatch({ intent: {} });
    expect(undecided).not.toContain("Allow comparable products");
  });

  it("offers 'Change budget' only when a budget was captured", () => {
    const withBudget = renderNoMatch({ currentParams: { q: "x", budgetMax: "150" } });
    expect(withBudget).toContain("Change budget");

    const withoutBudget = renderNoMatch({ currentParams: { q: "x" } });
    expect(withoutBudget).not.toContain("Change budget");
  });

  it("offers every applicable relief action at once when budget, condition, and exact-only are all captured", () => {
    const html = renderNoMatch({
      intent: { allowComparableAlternatives: false },
      currentParams: { q: "x", budgetMax: "50", condition: "new" },
    });
    expect(html).toContain("Allow comparable products");
    expect(html).toContain("Change budget");
    expect(html).toContain("Remove condition filter");
    expect(html).toContain("Browse category");
    expect(html).toContain("Search again");
  });
});

describe("SearchNoMatch — user relaxes one filter", () => {
  it("the Remove-filter action targets only the captured non-budget filter", () => {
    const html = renderNoMatch({ currentParams: { q: "x", condition: "used" } });
    expect(html).toContain("Remove condition filter");
    expect(html).toContain('href="/search/clarify?q=x"');
  });
});

describe("SearchNoMatch — session remains preserved across every offered action", () => {
  it("keeps the session id in the Change budget, Remove filter, and Allow comparable hrefs", () => {
    const html = renderNoMatch({
      intent: { allowComparableAlternatives: false },
      currentParams: {
        q: "quiet dishwasher",
        budgetMax: "200",
        condition: "used",
        sid: "session-xyz789",
      },
    });

    // Each action link is a /search/clarify href; every one must carry sid.
    const hrefs = [...html.matchAll(/href="([^"]*\/search\/clarify\?[^"]*)"/g)].map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(decodeURIComponent(href)).toContain("sid=session-xyz789");
    }
  });
});
