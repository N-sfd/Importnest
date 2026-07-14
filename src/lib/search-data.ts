import { prisma } from "@/lib/prisma";
import { sortPriorityToComparePriority, type SearchIntent } from "@/lib/search-intent";

export type SearchInputType = "keyword" | "model-number";

function classifyInput(query: string): SearchInputType {
  return /^\d{8,14}$/.test(query) ? "model-number" : "keyword";
}

/**
 * Matches a free-text or UPC/model-number query to a single canonical
 * product. Numeric queries in UPC/EAN length range are checked against
 * ProductIdentifier first since that's an exact, unambiguous match; anything
 * else falls back to a fuzzy name/model/brand search.
 */
export async function matchProduct(query: string): Promise<string | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  if (classifyInput(trimmed) === "model-number") {
    const identifier = await prisma.productIdentifier.findUnique({
      where: { value: trimmed },
    });
    if (identifier) return identifier.canonicalProductId;
  }

  const product = await prisma.canonicalProduct.findFirst({
    where: {
      OR: [
        { modelName: { contains: trimmed, mode: "insensitive" } },
        { modelNumber: { contains: trimmed, mode: "insensitive" } },
        { brand: { name: { contains: trimmed, mode: "insensitive" } } },
      ],
    },
  });

  return product?.id ?? null;
}

export async function recordSearchSession(input: {
  query: string;
  categoryId?: string | null;
  matchedProductId: string | null;
  criteria?: Record<string, unknown>;
}) {
  return prisma.searchSession.create({
    data: {
      query: input.query,
      inputType: classifyInput(input.query.trim()),
      categoryId: input.categoryId ?? undefined,
      status: input.matchedProductId ? "matched" : "no-match",
      criteria: input.criteria ? JSON.stringify(input.criteria) : undefined,
    },
  });
}

/** Opens a session when a query enters the clarification flow, so each answer can be persisted against it. */
export async function startSearchSession(query: string, categoryId?: string | null) {
  return prisma.searchSession.create({
    data: {
      query,
      inputType: classifyInput(query.trim()),
      categoryId: categoryId ?? undefined,
      status: "clarifying",
    },
  });
}

export async function recordClarificationAnswer(input: {
  searchSessionId: string;
  question: string;
  answer: string;
  resolvedAttribute: string;
}) {
  return prisma.searchClarification.create({ data: input });
}

export async function finalizeSearchSession(input: {
  searchSessionId: string;
  matchedProductId: string | null;
  criteria?: Record<string, unknown>;
}) {
  return prisma.searchSession.update({
    where: { id: input.searchSessionId },
    data: {
      status: input.matchedProductId ? "matched" : "no-match",
      criteria: input.criteria ? JSON.stringify(input.criteria) : undefined,
    },
  });
}

const STOPWORDS = new Set([
  "a", "an", "the", "for", "of", "in", "on", "with", "under", "over", "to",
  "i", "need", "want", "looking", "some", "any", "this", "that", "please",
]);

function significantWords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Broader, category/brand-based fallback used only when an exact match
 * fails. Deliberately looser than matchProduct — callers must label these as
 * "comparable alternative", not an exact match.
 */
export async function findComparableProducts(
  query: string,
  intent: Partial<SearchIntent> = {},
): Promise<string[]> {
  const words = significantWords(query);
  if (!words.length) return [];

  const candidates = await prisma.canonicalProduct.findMany({
    where: {
      AND: [
        {
          OR: words.flatMap((w) => [
            { category: { name: { contains: w, mode: "insensitive" as const } } },
            { brand: { name: { contains: w, mode: "insensitive" as const } } },
          ]),
        },
        intent.excludedBrands?.length
          ? { brand: { name: { notIn: intent.excludedBrands } } }
          : {},
      ],
    },
    select: { id: true },
  });

  return Array.from(new Set(candidates.map((c) => c.id)));
}

export type FinalizeSearchResult =
  | { kind: "redirect"; productId: string; searchParams: URLSearchParams }
  | { kind: "no-match"; comparableCandidates: string[] };

/**
 * Shared by both the fast-path entry (/search) and the post-clarification
 * confirm step (/search/confirm) — resolves a direct match, falls back to a
 * comparable-alternative search only when one wasn't already found and the
 * shopper hasn't ruled it out, and records/finalizes the session either way.
 */
export async function finalizeSearch(
  query: string,
  intent: SearchIntent,
  options: { directMatch: string | null; sessionId?: string; categoryId?: string | null },
): Promise<FinalizeSearchResult> {
  let finalMatch = options.directMatch;
  let isComparable = false;
  let comparableCandidates: string[] = [];

  if (!finalMatch && intent.allowComparableAlternatives !== false) {
    comparableCandidates = await findComparableProducts(query, intent);
    if (comparableCandidates.length === 1) {
      finalMatch = comparableCandidates[0];
      isComparable = true;
    }
  }

  const capturedFields = Object.keys(intent).filter((k) => k !== "query");
  if (options.sessionId) {
    await finalizeSearchSession({
      searchSessionId: options.sessionId,
      matchedProductId: finalMatch,
      criteria: capturedFields.length ? intent : undefined,
    });
  } else {
    await recordSearchSession({
      query,
      categoryId: options.categoryId,
      matchedProductId: finalMatch,
      criteria: capturedFields.length ? intent : undefined,
    });
  }

  if (finalMatch) {
    const searchParams = new URLSearchParams();
    if (intent.budgetMax != null) searchParams.set("maxBudget", String(intent.budgetMax));
    if (intent.condition && intent.condition !== "any") searchParams.set("condition", intent.condition);
    if (intent.sortPriority) {
      const mapped = sortPriorityToComparePriority(intent.sortPriority);
      if (mapped) searchParams.set("priority", mapped);
    }
    if (isComparable) searchParams.set("comparable", "1");
    return { kind: "redirect", productId: finalMatch, searchParams };
  }

  return { kind: "no-match", comparableCandidates };
}
