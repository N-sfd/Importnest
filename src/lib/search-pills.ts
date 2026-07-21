import { parseQueryHeuristics, type SearchIntent } from "@/lib/search-intent";

export type SearchFilterPill = {
  id: string;
  label: string;
};

const PRODUCT_TYPE_PATTERNS: [RegExp, string][] = [
  [/\bdishwashers?\b/i, "Dishwasher"],
  [/\blaptops?\b/i, "Laptop"],
  [/\bphones?\b|\bsmartphones?\b/i, "Phone"],
  [/\bheadphones?\b|\bearbuds?\b/i, "Headphones"],
  [/\btvs?\b|\btelevisions?\b/i, "TV"],
  [/\bvacuums?\b/i, "Vacuum"],
  [/\brefrigerators?\b|\bfridges?\b/i, "Refrigerator"],
  [/\bwashers?\b|\bwashing machines?\b/i, "Washer"],
  [/\bsneakers?\b|\brunning shoes?\b/i, "Footwear"],
  [/\bair purifiers?\b/i, "Air purifier"],
];

function conditionLabel(condition: SearchIntent["condition"]): string | null {
  switch (condition) {
    case "new":
      return "New";
    case "open_box":
      return "Open box";
    case "refurbished":
      return "Refurbished";
    case "used":
      return "Used";
    default:
      return null;
  }
}

function productTypeFromQuery(query: string): string | null {
  for (const [pattern, label] of PRODUCT_TYPE_PATTERNS) {
    if (pattern.test(query)) return label;
  }
  return null;
}

/**
 * Turn free-text query heuristics into interactive filter pills for the search UI.
 * Never invents attributes that were not present in the typed query.
 */
export function intentPillsFromQuery(query: string): SearchFilterPill[] {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const intent = parseQueryHeuristics(trimmed);
  const pills: SearchFilterPill[] = [];

  if (intent.budgetMax != null) {
    pills.push({ id: "budgetMax", label: `Max: $${intent.budgetMax}` });
  }

  const type = productTypeFromQuery(trimmed);
  if (type) {
    pills.push({ id: "type", label: `Type: ${type}` });
  }

  const condition = conditionLabel(intent.condition);
  if (condition) {
    pills.push({ id: "condition", label: `Condition: ${condition}` });
  }

  if (intent.deliveryBy) {
    const delivery = intent.deliveryBy.replace(/\b\w/g, (c) => c.toUpperCase());
    pills.push({ id: "delivery", label: `Delivery: ${delivery}` });
  }

  return pills;
}
