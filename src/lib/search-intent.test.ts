import { describe, expect, it } from "vitest";
import {
  allowComparableHref,
  answeredQuestionIds,
  browseCategoryHref,
  findRemovableSearchFlowField,
  getClarifyingQuestions,
  intentFromSearchParams,
  isUrgentDeliveryPhrase,
  parseQueryHeuristics,
  searchFlowHrefWithout,
  searchIntentSchema,
  sortPriorityToComparePriority,
  type SearchFlowParams,
} from "@/lib/search-intent";

describe("parseQueryHeuristics", () => {
  it("extracts a budget cap from natural language", () => {
    expect(parseQueryHeuristics("I need a backpack for college under $100").budgetMax).toBe(100);
  });
  it("extracts condition keywords", () => {
    expect(parseQueryHeuristics("looking for a refurbished laptop").condition).toBe("refurbished");
    expect(parseQueryHeuristics("used phone please").condition).toBe("used");
    expect(parseQueryHeuristics("open box dishwasher").condition).toBe("open_box");
  });
  it("extracts delivery timing", () => {
    expect(parseQueryHeuristics("need it by friday").deliveryBy).toMatch(/friday/i);
  });
  it("extracts exact-only vs comparable-ok signals", () => {
    expect(parseQueryHeuristics("exact model only please").allowComparableAlternatives).toBe(false);
    expect(parseQueryHeuristics("similar alternatives ok").allowComparableAlternatives).toBe(true);
  });
  it("returns an empty object for queries with no extractable signal", () => {
    expect(parseQueryHeuristics("iPhone 6")).toEqual({});
  });
});

describe("answeredQuestionIds / intentFromSearchParams", () => {
  it("treats an explicit 'any' as answered even though it has no concrete value", () => {
    const params = { budgetMax: "any" };
    expect(answeredQuestionIds(params).has("budgetMax")).toBe(true);
    expect(intentFromSearchParams(params).budgetMax).toBeUndefined();
  });
  it("parses a concrete budget answer", () => {
    const params = { budgetMax: "100" };
    expect(intentFromSearchParams(params).budgetMax).toBe(100);
  });
  it("parses condition and alternatives params", () => {
    expect(intentFromSearchParams({ condition: "used" }).condition).toBe("used");
    expect(intentFromSearchParams({ alt: "exact" }).allowComparableAlternatives).toBe(false);
    expect(intentFromSearchParams({ alt: "comparable" }).allowComparableAlternatives).toBe(true);
  });
});

describe("getClarifyingQuestions", () => {
  it("asks up to 3 questions, in priority order, for a fully-unanswered intent", () => {
    const questions = getClarifyingQuestions(new Set());
    expect(questions).toHaveLength(3);
    expect(questions.map((q) => q.id)).toEqual(["budgetMax", "condition", "allowComparableAlternatives"]);
  });
  it("skips questions that are already answered", () => {
    const answered = answeredQuestionIds({ budgetMax: "100", condition: "any" });
    const questions = getClarifyingQuestions(answered);
    expect(questions.map((q) => q.id)).toEqual(["allowComparableAlternatives", "sortPriority", "deliveryBy"]);
  });
  it("needs no clarification once every question has been answered", () => {
    const answered = answeredQuestionIds({
      budgetMax: "any",
      condition: "any",
      alt: "comparable",
      priority: "best_overall",
      deliveryBy: "any",
      brands: "any",
    });
    expect(getClarifyingQuestions(answered)).toHaveLength(0);
  });
});

describe("searchIntentSchema", () => {
  it("accepts a fully populated intent", () => {
    const result = searchIntentSchema.safeParse({
      query: "backpack",
      budgetMax: 100,
      condition: "new",
      allowComparableAlternatives: true,
      sortPriority: "lowest_cost",
    });
    expect(result.success).toBe(true);
  });
  it("rejects an invalid condition value", () => {
    const result = searchIntentSchema.safeParse({ query: "backpack", condition: "brand-new" });
    expect(result.success).toBe(false);
  });
});

describe("sortPriorityToComparePriority", () => {
  it("maps each sortPriority value to the closest compare-page tab", () => {
    expect(sortPriorityToComparePriority("lowest_cost")).toBe("lowest-cost");
    expect(sortPriorityToComparePriority("fastest_delivery")).toBe("fastest-delivery");
    expect(sortPriorityToComparePriority("best_warranty")).toBe("best-protection");
    expect(sortPriorityToComparePriority("best_overall")).toBe("best-overall");
  });
  it("returns undefined when no priority was captured", () => {
    expect(sortPriorityToComparePriority(undefined)).toBeUndefined();
  });
});

describe("findRemovableSearchFlowField", () => {
  it("finds nothing to remove when no filter beyond the query itself was captured", () => {
    expect(findRemovableSearchFlowField({ q: "dishwasher" })).toBeUndefined();
  });

  it("finds a removable filter when one was captured", () => {
    const found = findRemovableSearchFlowField({ q: "dishwasher", condition: "used" });
    expect(found?.key).toBe("condition");
  });

  it("never offers to remove budget — that has its own dedicated 'Change budget' action", () => {
    expect(findRemovableSearchFlowField({ q: "dishwasher", budgetMax: "100" })).toBeUndefined();
  });
});

describe("searchFlowHrefWithout — user relaxes one filter", () => {
  const params: SearchFlowParams = {
    q: "quiet dishwasher",
    condition: "used",
    budgetMax: "200",
    deliveryBy: "this week",
    sid: "session-abc123",
    continue: "1",
  };

  it("clears only the targeted field", () => {
    const href = searchFlowHrefWithout(params, "condition");
    const qs = new URLSearchParams(href.split("?")[1]);
    expect(qs.has("condition")).toBe(false);
  });

  it("preserves every other captured preference, including budget and delivery timing", () => {
    const href = searchFlowHrefWithout(params, "condition");
    const qs = new URLSearchParams(href.split("?")[1]);
    expect(qs.get("q")).toBe("quiet dishwasher");
    expect(qs.get("budgetMax")).toBe("200");
    expect(qs.get("deliveryBy")).toBe("this week");
  });

  it("preserves the search session id across the action (session remains preserved)", () => {
    const href = searchFlowHrefWithout(params, "condition");
    const qs = new URLSearchParams(href.split("?")[1]);
    expect(qs.get("sid")).toBe("session-abc123");
  });

  it("drops 'continue' so the re-asked question isn't skipped straight back to confirmation", () => {
    const href = searchFlowHrefWithout(params, "condition");
    const qs = new URLSearchParams(href.split("?")[1]);
    expect(qs.has("continue")).toBe(false);
  });

  it("routes back into the clarify step so the cleared question is re-asked", () => {
    expect(searchFlowHrefWithout(params, "budgetMax")).toMatch(/^\/search\/clarify\?/);
  });
});

describe("allowComparableHref — session remains preserved", () => {
  it("turns comparable alternatives on while preserving the query, other filters, and the session id", () => {
    const href = allowComparableHref({
      q: "quiet dishwasher",
      alt: "exact",
      budgetMax: "200",
      sid: "session-abc123",
    });
    const qs = new URLSearchParams(href.split("?")[1]);

    expect(qs.get("alt")).toBe("comparable");
    expect(qs.get("q")).toBe("quiet dishwasher");
    expect(qs.get("budgetMax")).toBe("200");
    expect(qs.get("sid")).toBe("session-abc123");
  });
});

describe("browseCategoryHref", () => {
  it("links to the known category", () => {
    expect(browseCategoryHref("appliances")).toBe("/search/results?category=appliances");
  });

  it("never fabricates a category — browses everything when none is known", () => {
    expect(browseCategoryHref(undefined)).toBe("/search/results");
  });
});

describe("isUrgentDeliveryPhrase", () => {
  it("treats ASAP/today/tomorrow-style answers as urgent", () => {
    expect(isUrgentDeliveryPhrase("asap")).toBe(true);
    expect(isUrgentDeliveryPhrase("today")).toBe(true);
    expect(isUrgentDeliveryPhrase("tomorrow")).toBe(true);
    expect(isUrgentDeliveryPhrase("I need it ASAP please")).toBe(true);
  });
  it("does not treat looser timing as urgent", () => {
    expect(isUrgentDeliveryPhrase("this week")).toBe(false);
    expect(isUrgentDeliveryPhrase("by friday")).toBe(false);
    expect(isUrgentDeliveryPhrase("any")).toBe(false);
  });
  it("handles undefined/empty safely", () => {
    expect(isUrgentDeliveryPhrase(undefined)).toBe(false);
    expect(isUrgentDeliveryPhrase("")).toBe(false);
  });
});
