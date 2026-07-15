import { prisma } from "@/lib/prisma";
import { classifyQuery } from "@/lib/product-classifier";
import { getClassifierContext } from "@/lib/search-data";

/**
 * Every rate here is derived from the SearchSession/SearchClarification
 * tables that already exist for the search flow — no new tracking table or
 * event log. That keeps this safe to run against production data (nothing
 * new is collected), but it also means a handful of the metrics the
 * hardening spec asked for genuinely cannot be computed today: this module
 * is honest about which ones (`unmeasured`) rather than approximating them
 * from a proxy signal that would quietly be wrong.
 *
 * `exactProductFastPathRate`/`clarificationRate` reclassify each stored
 * query against the *current* catalog/classifier, not the classifier
 * version that actually handled the request at the time — a caveat if the
 * catalog or classifier logic has changed materially since older sessions
 * were recorded.
 */
export type SearchMetricsReport = {
  totalSearchSessions: number;
  exactProductFastPathRate: number | null;
  clarificationRate: number | null;
  confirmationRate: number | null;
  comparisonCompletionRate: number | null;
  noResultRate: number | null;
  optionalQuestionSkipRate: number | null;
  answerEditRate: number | null;
  unmeasured: Record<string, string>;
};

const UNMEASURED_REASONS: Record<string, string> = {
  aiExtractionSuccessRate:
    "extractIntentWithAI's outcome isn't persisted per-session (only its resulting field values are, indistinguishable from heuristic/manual answers) — would need new instrumentation.",
  heuristicFallbackRate:
    "No stored signal distinguishes a field captured by parseQueryHeuristics from one captured by AI or a manual answer.",
  aiTimeoutRate:
    "extractIntentWithAI collapses all failure modes (timeout, network, invalid JSON, refusal) into a single null return with no persisted reason code.",
  invalidAiResponseRate: "Same as aiTimeoutRate — failure reason isn't captured or persisted.",
  comparableAlternativeRate:
    "finalizeSearch's isComparable flag is only reflected in the redirect URL's ?comparable=1, never written to SearchSession — would require re-simulating resolution per session or persisting the flag.",
  sessionResumeRate: "No persisted signal for 'shopper returned to an existing sid after leaving.'",
};

/**
 * Computes the operational metrics named in the search-intent hardening
 * spec, from existing data only. Intended for periodic/manual reporting,
 * not a hot path — it re-classifies every distinct session query, which is
 * O(sessions) work.
 */
export async function computeSearchMetrics(): Promise<SearchMetricsReport> {
  const sessions = await prisma.searchSession.findMany({
    select: { id: true, query: true, status: true },
  });
  const totalSearchSessions = sessions.length;

  if (totalSearchSessions === 0) {
    return {
      totalSearchSessions: 0,
      exactProductFastPathRate: null,
      clarificationRate: null,
      confirmationRate: null,
      comparisonCompletionRate: null,
      noResultRate: null,
      optionalQuestionSkipRate: null,
      answerEditRate: null,
      unmeasured: UNMEASURED_REASONS,
    };
  }

  const context = await getClassifierContext();
  let fastPathCount = 0;
  for (const s of sessions) {
    if (classifyQuery(s.query, context).classification === "exact_product") fastPathCount++;
  }
  const clarifiedCount = totalSearchSessions - fastPathCount;

  // finalizeSearch only ever runs from the fast path itself or from
  // /search/confirm once `confirmed=1` — so for the clarified population,
  // "no longer sitting at status clarifying" means the shopper confirmed.
  const clarifiedFinalized = sessions.filter(
    (s) => classifyQuery(s.query, context).classification !== "exact_product" && s.status !== "clarifying",
  ).length;

  const matchedCount = sessions.filter((s) => s.status === "matched").length;
  const noMatchCount = sessions.filter((s) => s.status === "no-match").length;

  const clarifications = await prisma.searchClarification.findMany({
    select: { searchSessionId: true, resolvedAttribute: true, answer: true },
  });
  const skippedCount = clarifications.filter((c) => c.answer === "Skipped").length;

  const seenAttributePerSession = new Map<string, Set<string>>();
  let editCount = 0;
  for (const c of clarifications) {
    const seen = seenAttributePerSession.get(c.searchSessionId) ?? new Set<string>();
    if (seen.has(c.resolvedAttribute)) editCount++;
    seen.add(c.resolvedAttribute);
    seenAttributePerSession.set(c.searchSessionId, seen);
  }

  return {
    totalSearchSessions,
    exactProductFastPathRate: fastPathCount / totalSearchSessions,
    clarificationRate: clarifiedCount / totalSearchSessions,
    confirmationRate: clarifiedCount > 0 ? clarifiedFinalized / clarifiedCount : null,
    comparisonCompletionRate: matchedCount / totalSearchSessions,
    noResultRate: noMatchCount / totalSearchSessions,
    optionalQuestionSkipRate: clarifications.length > 0 ? skippedCount / clarifications.length : null,
    answerEditRate: clarifications.length > 0 ? editCount / clarifications.length : null,
    unmeasured: UNMEASURED_REASONS,
  };
}
