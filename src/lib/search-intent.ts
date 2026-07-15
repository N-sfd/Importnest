import { z } from "zod";
import type { Priority } from "@/lib/types";

export const searchIntentSchema = z.object({
  query: z.string(),
  category: z.string().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  condition: z.enum(["new", "open_box", "refurbished", "used", "any"]).optional(),
  deliveryBy: z.string().optional(),
  preferredBrands: z.array(z.string()).optional(),
  excludedBrands: z.array(z.string()).optional(),
  requiredAttributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  preferredAttributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  allowComparableAlternatives: z.boolean().optional(),
  sortPriority: z.enum(["best_overall", "lowest_cost", "fastest_delivery", "best_warranty"]).optional(),
});

export type SearchIntent = z.infer<typeof searchIntentSchema>;

const BUDGET_PATTERNS: RegExp[] = [
  /(?:under|below|less than|no more than|max(?:imum)?(?:\s*(?:of|budget))?)\s*\$?\s*(\d+(?:\.\d+)?)/i,
  /\$\s*(\d+(?:\.\d+)?)\s*(?:or less|and under|budget)/i,
];

const CONDITION_KEYWORDS: [RegExp, SearchIntent["condition"]][] = [
  [/\bopen[\s-]?box\b/i, "open_box"],
  [/\brefurb(?:ished)?\b/i, "refurbished"],
  [/\bused\b|\bsecond[\s-]?hand\b|\bpre[\s-]?owned\b/i, "used"],
  [/\bbrand[\s-]?new\b|\bnew\b/i, "new"],
];

const DELIVERY_PATTERNS: RegExp[] = [
  /\b(asap|today|tomorrow|this week|this weekend|next week|by (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
];

const EXACT_ONLY_PATTERN = /\bexact(?:ly)?\b.{0,20}\bonly\b|\bonly\b.{0,20}\bexact\b/i;
const ALTERNATIVES_OK_PATTERN = /\b(similar|comparable|alternative)s?\s+(?:ok|okay|fine|acceptable|welcome)\b/i;

/**
 * Pure, DB-free heuristic extraction from free text. Deliberately simple
 * (regex over an LLM call) — the catalog is small and this only needs to cut
 * down clarifying questions, not perform real NLU.
 */
export function parseQueryHeuristics(query: string): Partial<SearchIntent> {
  const intent: Partial<SearchIntent> = {};

  for (const pattern of BUDGET_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      intent.budgetMax = Number(match[1]);
      break;
    }
  }

  for (const [pattern, condition] of CONDITION_KEYWORDS) {
    if (pattern.test(query)) {
      intent.condition = condition;
      break;
    }
  }

  for (const pattern of DELIVERY_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      intent.deliveryBy = match[1];
      break;
    }
  }

  if (EXACT_ONLY_PATTERN.test(query)) {
    intent.allowComparableAlternatives = false;
  } else if (ALTERNATIVES_OK_PATTERN.test(query)) {
    intent.allowComparableAlternatives = true;
  }

  return intent;
}

export type ClarifyingQuestionId =
  | "budgetMax"
  | "condition"
  | "allowComparableAlternatives"
  | "sortPriority"
  | "deliveryBy"
  | "preferredBrands";

export type ClarifyingQuestion = {
  id: ClarifyingQuestionId;
  prompt: string;
  options: { label: string; value: string }[];
  allowFreeText?: boolean;
};

// Priority order: cheapest to ask, most likely to change the result first.
const QUESTION_PRIORITY: ClarifyingQuestionId[] = [
  "budgetMax",
  "condition",
  "allowComparableAlternatives",
  "sortPriority",
  "deliveryBy",
  "preferredBrands",
];

function buildQuestion(id: ClarifyingQuestionId, availableBrands: string[]): ClarifyingQuestion {
  switch (id) {
    case "budgetMax":
      return {
        id,
        prompt: "What is your maximum budget?",
        options: [
          { label: "Under $50", value: "50" },
          { label: "Under $100", value: "100" },
          { label: "Under $250", value: "250" },
          { label: "Under $500", value: "500" },
          { label: "Any budget", value: "any" },
        ],
        allowFreeText: true,
      };
    case "condition":
      return {
        id,
        prompt: "Which condition do you prefer?",
        options: [
          { label: "New", value: "new" },
          { label: "Open box", value: "open_box" },
          { label: "Refurbished", value: "refurbished" },
          { label: "Used", value: "used" },
          { label: "Any / No preference", value: "any" },
        ],
      };
    case "allowComparableAlternatives":
      return {
        id,
        prompt: "Do you want this exact model only, or are similar alternatives acceptable?",
        options: [
          { label: "Exact model only", value: "exact" },
          { label: "Comparable alternatives OK", value: "comparable" },
        ],
      };
    case "sortPriority":
      return {
        id,
        prompt: "Which feature matters most: price, delivery, warranty, or condition?",
        options: [
          { label: "Lowest price", value: "lowest_cost" },
          { label: "Fastest delivery", value: "fastest_delivery" },
          { label: "Best warranty", value: "best_warranty" },
          { label: "No preference (best overall)", value: "best_overall" },
        ],
      };
    case "deliveryBy":
      return {
        id,
        prompt: "When do you need this?",
        options: [
          { label: "ASAP", value: "asap" },
          { label: "This week", value: "this week" },
          { label: "No rush", value: "any" },
        ],
        allowFreeText: true,
      };
    case "preferredBrands":
      return {
        id,
        prompt: "Any preferred brand?",
        options: [
          ...availableBrands.map((b) => ({ label: b, value: b })),
          { label: "Any / No preference", value: "any" },
        ],
      };
  }
}

/** Up to 3 questions for whatever hasn't been answered (or explicitly skipped) yet. */
export function getClarifyingQuestions(
  answered: Set<ClarifyingQuestionId>,
  options: { availableBrands?: string[] } = {},
): ClarifyingQuestion[] {
  const missing = QUESTION_PRIORITY.filter((id) => !answered.has(id));
  return missing.slice(0, 3).map((id) => buildQuestion(id, options.availableBrands ?? []));
}

/** Reads previously-answered clarification fields back out of URL search params. */
export function intentFromSearchParams(params: Record<string, string | undefined>): Partial<SearchIntent> {
  const intent: Partial<SearchIntent> = {};

  if (params.budgetMax && params.budgetMax !== "any") {
    const n = Number(params.budgetMax);
    if (!Number.isNaN(n)) intent.budgetMax = n;
  }
  // "any" is a valid answer with no concrete value — see answeredQuestionIds,
  // which is the source of truth for whether a question still needs asking.

  if (params.condition) {
    const parsed = searchIntentSchema.shape.condition.safeParse(params.condition);
    if (parsed.success) intent.condition = parsed.data;
  }

  if (params.alt === "exact") intent.allowComparableAlternatives = false;
  else if (params.alt === "comparable") intent.allowComparableAlternatives = true;

  if (params.priority) {
    const parsed = searchIntentSchema.shape.sortPriority.safeParse(params.priority);
    if (parsed.success) intent.sortPriority = parsed.data;
  }

  if (params.deliveryBy) intent.deliveryBy = params.deliveryBy;

  if (params.brands) {
    intent.preferredBrands = params.brands === "any" ? [] : params.brands.split(",").filter(Boolean);
  }

  return intent;
}

/**
 * The compare page's sort tabs use hyphenated Priority values.
 * Clarification "best warranty" maps to buyer-protection ranking.
 */
export function sortPriorityToComparePriority(
  priority: SearchIntent["sortPriority"],
): Priority | undefined {
  switch (priority) {
    case "lowest_cost":
      return "lowest-cost";
    case "fastest_delivery":
      return "fastest-delivery";
    case "best_warranty":
      return "best-protection";
    case "best_overall":
      return "best-overall";
    default:
      return undefined;
  }
}

/**
 * `budgetMax=any` and `brands=any` legitimately mean "answered, no
 * preference" — they can't be represented by a defined SearchIntent value,
 * so track which question ids were explicitly resolved (answered or
 * skipped) separately from the intent's own field values.
 */
export function answeredQuestionIds(params: Record<string, string | undefined>): Set<ClarifyingQuestionId> {
  const answered = new Set<ClarifyingQuestionId>();
  if (params.budgetMax) answered.add("budgetMax");
  if (params.condition) answered.add("condition");
  if (params.alt) answered.add("allowComparableAlternatives");
  if (params.priority) answered.add("sortPriority");
  if (params.deliveryBy) answered.add("deliveryBy");
  if (params.brands) answered.add("preferredBrands");
  return answered;
}

/** Shared across /search, /search/clarify, and /search/confirm. */
export type SearchFlowParams = {
  q?: string;
  category?: string;
  budgetMax?: string;
  condition?: string;
  alt?: string;
  priority?: string;
  deliveryBy?: string;
  brands?: string;
  continue?: string;
  confirmed?: string;
  sid?: string;
};

export function buildIntent(query: string, params: SearchFlowParams): SearchIntent {
  return {
    query,
    ...parseQueryHeuristics(query),
    ...intentFromSearchParams(params),
  };
}

/** Serializes only the params with real values, dropping empty/undefined ones — for building next-step URLs. */
export function paramsToRecord(params: SearchFlowParams): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value) record[key] = value;
  }
  return record;
}

/** Fields a shopper can drop one at a time to broaden a no-match search — budget gets its own dedicated "Change budget" action instead. */
const REMOVABLE_SEARCH_FLOW_FIELDS: { key: keyof SearchFlowParams; label: string }[] = [
  { key: "condition", label: "condition filter" },
  { key: "brands", label: "brand preference" },
  { key: "deliveryBy", label: "delivery timing" },
];

/** The first captured filter (other than budget) a shopper could remove to broaden a no-match search, if any. */
export function findRemovableSearchFlowField(
  params: SearchFlowParams,
): { key: keyof SearchFlowParams; label: string } | undefined {
  return REMOVABLE_SEARCH_FLOW_FIELDS.find(({ key }) => Boolean(params[key]));
}

/**
 * Builds a /search/clarify link with one field cleared — clarify re-asks
 * that question naturally (answeredQuestionIds no longer includes it)
 * rather than needing a separate "remove filter" code path. Every other
 * captured param, including the session id, is preserved untouched so the
 * shopper's session and remaining preferences survive the click.
 */
export function searchFlowHrefWithout(
  params: SearchFlowParams,
  key: keyof SearchFlowParams,
): string {
  const next: SearchFlowParams = { ...params };
  delete next[key];
  // Re-asking a just-cleared question must not be skipped past straight to confirmation.
  delete next.continue;
  delete next.confirmed;
  const qs = new URLSearchParams(paramsToRecord(next)).toString();
  return qs ? `/search/clarify?${qs}` : "/search/clarify";
}

/** Turns comparable alternatives on, preserving every other captured param (including sid). */
export function allowComparableHref(params: SearchFlowParams): string {
  const next: SearchFlowParams = { ...params, alt: "comparable" };
  delete next.continue;
  delete next.confirmed;
  const qs = new URLSearchParams(paramsToRecord(next)).toString();
  return `/search/clarify?${qs}`;
}

/** Never falls back to a fabricated category — browses everything when none is actually known. */
export function browseCategoryHref(categorySlug: string | undefined): string {
  return categorySlug
    ? `/search/results?category=${encodeURIComponent(categorySlug)}`
    : "/search/results";
}

const URGENT_DELIVERY_PATTERN = /\b(asap|today|tonight|tomorrow|now|immediately)\b/i;

/**
 * There's no structured delivery-date data anywhere in the schema, so a
 * deliveryBy answer can only drive a real filter when it signals genuine
 * urgency — narrowed to pickup-available listings (the one real "fast"
 * signal available), not a fabricated ship-speed estimate. "this week" or a
 * specific day name isn't urgent enough to justify excluding shipped items.
 */
export function isUrgentDeliveryPhrase(deliveryBy: string | undefined): boolean {
  if (!deliveryBy) return false;
  return URGENT_DELIVERY_PATTERN.test(deliveryBy);
}
