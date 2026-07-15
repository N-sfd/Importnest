import { describe, expect, it } from "vitest";
import { sortByPreferredBrand } from "@/lib/search-data";

describe("sortByPreferredBrand", () => {
  const candidates = [
    { id: "1", brandName: "Acme" },
    { id: "2", brandName: "Fjallraven" },
    { id: "3", brandName: "Generic" },
  ];

  it("surfaces preferred-brand matches first", () => {
    const result = sortByPreferredBrand(candidates, ["Fjallraven"]);
    expect(result[0].brandName).toBe("Fjallraven");
  });

  it("preserves relative order among equally (non-)preferred candidates", () => {
    const result = sortByPreferredBrand(candidates, ["Fjallraven"]);
    expect(result.map((c) => c.id)).toEqual(["2", "1", "3"]);
  });

  it("is a no-op when no preferred brands are given", () => {
    expect(sortByPreferredBrand(candidates, undefined)).toEqual(candidates);
    expect(sortByPreferredBrand(candidates, [])).toEqual(candidates);
  });

  it("is a no-op when no candidate matches any preferred brand", () => {
    expect(sortByPreferredBrand(candidates, ["Nonexistent Brand"])).toEqual(candidates);
  });
});
