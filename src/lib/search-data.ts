import { prisma } from "@/lib/prisma";

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
}) {
  return prisma.searchSession.create({
    data: {
      query: input.query,
      inputType: classifyInput(input.query.trim()),
      categoryId: input.categoryId ?? undefined,
      status: input.matchedProductId ? "matched" : "no-match",
    },
  });
}
