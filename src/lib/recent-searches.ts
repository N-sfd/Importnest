import { prisma } from "@/lib/prisma";

export type RecentSearch = {
  id: string;
  query: string;
  createdAt: Date;
  /** Parsed from the session's captured SearchIntent JSON, when present */
  budgetMax: number | null;
  continueHref: string;
};

function parseBudgetMax(criteria: string | null): number | null {
  if (!criteria) return null;
  try {
    const parsed: unknown = JSON.parse(criteria);
    if (parsed && typeof parsed === "object" && "budgetMax" in parsed) {
      const value = (parsed as { budgetMax?: unknown }).budgetMax;
      if (typeof value === "number" && Number.isFinite(value)) return value;
    }
  } catch {
    // Malformed/legacy criteria — treat as no captured budget rather than throw.
  }
  return null;
}

/**
 * Most recent distinct queries a signed-in shopper has run, for the homepage
 * "recent searches" shortcut. Only sessions recorded against a real userId —
 * anonymous searches are never attributed, so a signed-out or first-time
 * visitor simply gets an empty list rather than a fabricated one.
 */
export async function getRecentSearches(userId: string, limit = 3): Promise<RecentSearch[]> {
  const sessions = await prisma.searchSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit * 3, // over-fetch since repeat queries are deduped below
  });

  const seen = new Set<string>();
  const recent: RecentSearch[] = [];
  for (const session of sessions) {
    const key = session.query.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    recent.push({
      id: session.id,
      query: session.query,
      createdAt: session.createdAt,
      budgetMax: parseBudgetMax(session.criteria),
      continueHref: `/search?q=${encodeURIComponent(session.query)}`,
    });
    if (recent.length >= limit) break;
  }
  return recent;
}
