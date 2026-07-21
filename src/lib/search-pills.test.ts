import { describe, expect, it } from "vitest";
import { intentPillsFromQuery } from "@/lib/search-pills";

describe("intentPillsFromQuery", () => {
  it("returns empty for short queries", () => {
    expect(intentPillsFromQuery("ab")).toEqual([]);
  });

  it("extracts budget, type, and delivery from natural language", () => {
    const pills = intentPillsFromQuery("quiet dishwasher under $900 this week");
    expect(pills.map((p) => p.label)).toEqual([
      "Max: $900",
      "Type: Dishwasher",
      "Delivery: This Week",
    ]);
  });

  it("does not invent attributes that are not in the query", () => {
    const pills = intentPillsFromQuery("Sony WH-1000XM5");
    expect(pills).toEqual([]);
  });
});
