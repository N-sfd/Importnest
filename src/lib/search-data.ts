import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { timeAsync, timeSync } from "@/lib/perf";
import { classifyQuery, type ClassificationResult } from "@/lib/product-classifier";
import { isUrgentDeliveryPhrase, sortPriorityToComparePriority, type SearchIntent } from "@/lib/search-intent";

export type SearchInputType = "keyword" | "model-number";

function classifyInput(query: string): SearchInputType {
  return /^\d{8,14}$/.test(query) ? "model-number" : "keyword";
}

export async function getClassifierContext() {
  const [brands, products] = await Promise.all([
    prisma.brand.findMany({ select: { name: true } }),
    prisma.canonicalProduct.findMany({ select: { modelName: true } }),
  ]);
  return {
    brandNames: brands.map((b) => b.name),
    catalogModelNames: products.map((p) => p.modelName),
  };
}

/**
 * Strict, exact-match-only lookup — deliberately narrower than the category/
 * brand word-overlap search in findComparableProducts. Only called after
 * classifyQuery has already decided a query is specific enough (exact_product)
 * to skip clarification; a generic category word must never resolve here just
 * because it happens to be a substring of one product's name.
 *
 * Not indexed for scale — the full-table brand/model scan below is fine for
 * this catalog's size but would need a proper WHERE-clause filter (e.g. by
 * brand id) before this catalog grows much larger.
 */
export async function resolveExactProduct(query: string): Promise<string | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  if (/^\d{8}$|^\d{9}[\dXx]$|^\d{12}$|^\d{13}$|^\d{14}$/.test(trimmed)) {
    const identifier = await prisma.productIdentifier.findUnique({ where: { value: trimmed } });
    return identifier?.canonicalProductId ?? null;
  }

  const exactName = await prisma.canonicalProduct.findFirst({
    where: { modelName: { equals: trimmed, mode: "insensitive" } },
  });
  if (exactName) return exactName.id;

  const exactModelNumber = await prisma.canonicalProduct.findFirst({
    where: { modelNumber: { equals: trimmed, mode: "insensitive" } },
  });
  if (exactModelNumber) return exactModelNumber.id;

  const normalizedQuery = trimmed.toLowerCase();
  const candidates = await prisma.canonicalProduct.findMany({ include: { brand: true } });
  for (const product of candidates) {
    const brandMentioned = normalizedQuery.includes(product.brand.name.toLowerCase());
    const nameMentioned = normalizedQuery.includes(product.modelName.toLowerCase());
    const modelNumberMentioned = product.modelNumber
      ? normalizedQuery.includes(product.modelNumber.toLowerCase())
      : false;
    if (brandMentioned && (nameMentioned || modelNumberMentioned)) {
      return product.id;
    }
  }

  return null;
}

/**
 * The single entry point for the "should this query skip clarification, and
 * if so, which product?" decision. Classification and resolution are kept as
 * separate steps on purpose: classification alone decides routing (a
 * recognized-but-unmatched identifier like a well-formed ASIN we don't carry
 * still skips clarification and shows an honest no-match, rather than being
 * downgraded into asking budget/condition questions about a barcode).
 */
export async function classifyAndResolve(
  query: string,
): Promise<{ classification: ClassificationResult; directMatch: string | null }> {
  const context = await getClassifierContext();
  const classification = timeSync("search.classifyQuery", () => classifyQuery(query, context));
  const directMatch =
    classification.classification === "exact_product"
      ? await timeAsync("search.resolveExactProduct", () => resolveExactProduct(query))
      : null;
  return { classification, directMatch };
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

/**
 * Best-effort audit trail — the URL params (not this table) are the source
 * of truth for clarification flow state, so a stale/expired/tampered sid
 * (foreign key violation on insert) must never surface as an error to the
 * shopper. Swallowed rather than thrown; logged for observability.
 */
export async function recordClarificationAnswer(input: {
  searchSessionId: string;
  question: string;
  answer: string;
  resolvedAttribute: string;
}) {
  try {
    return await prisma.searchClarification.create({ data: input });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      console.warn("[search-data] recordClarificationAnswer: unknown/expired searchSessionId, skipping");
      return null;
    }
    throw err;
  }
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
 * Sorts candidates so preferred-brand matches surface first, otherwise
 * preserving relative order. Pure so it's testable without a DB fixture for
 * every brand-preference scenario.
 */
export function sortByPreferredBrand<T extends { brandName: string }>(
  candidates: T[],
  preferredBrands: string[] | undefined,
): T[] {
  if (!preferredBrands?.length) return candidates;
  const preferred = new Set(preferredBrands);
  return [...candidates].sort(
    (a, b) => Number(preferred.has(b.brandName)) - Number(preferred.has(a.brandName)),
  );
}

/**
 * Broader, category/brand/name word-overlap fallback used only when
 * classifyQuery/resolveExactProduct found no exact match. Deliberately loose
 * — callers must label these as "comparable alternative", never an exact
 * match. Matching modelName words here (not just category/brand) is what
 * lets a generic query like "dishwasher" still surface the one seeded
 * dishwasher post-clarification, honestly labeled as a comparable option,
 * without that same looseness ever being allowed to skip clarification in
 * the first place (see classifyQuery). When multiple candidates match,
 * preferredBrands (a soft preference, unlike the hard-filtering
 * excludedBrands) determines which surfaces first.
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
            { modelName: { contains: w, mode: "insensitive" as const } },
          ]),
        },
        intent.excludedBrands?.length
          ? { brand: { name: { notIn: intent.excludedBrands } } }
          : {},
      ],
    },
    include: { brand: true },
  });

  const deduped = Array.from(new Map(candidates.map((c) => [c.id, c])).values()).map((c) => ({
    id: c.id,
    brandName: c.brand.name,
  }));

  return sortByPreferredBrand(deduped, intent.preferredBrands).map((c) => c.id);
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
  let sessionRecovered = false;
  if (options.sessionId) {
    try {
      await finalizeSearchSession({
        searchSessionId: options.sessionId,
        matchedProductId: finalMatch,
        criteria: capturedFields.length ? intent : undefined,
      });
    } catch (err) {
      // Invalid/expired/tampered sid (Prisma P2025 — record to update doesn't
      // exist). The shopper's query and answers are still fully intact in the
      // URL params that got us here, so recover by opening a fresh session
      // record rather than surfacing a crash and losing their search.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        console.warn("[search-data] finalizeSearch: unknown/expired sid, recovering with a new session");
        sessionRecovered = true;
      } else {
        throw err;
      }
    }
  }
  if (!options.sessionId || sessionRecovered) {
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
    if (isUrgentDeliveryPhrase(intent.deliveryBy)) searchParams.set("fastDelivery", "1");
    if (isComparable) searchParams.set("comparable", "1");
    return { kind: "redirect", productId: finalMatch, searchParams };
  }

  return { kind: "no-match", comparableCandidates };
}
