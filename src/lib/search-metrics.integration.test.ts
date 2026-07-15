import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { computeSearchMetrics } from "@/lib/search-metrics";
import { finalizeSearch, recordClarificationAnswer, startSearchSession } from "@/lib/search-data";

// Real database, same reasoning as search-data.integration.test.ts: the
// thing under test is Prisma aggregation + the reclassification logic
// against real rows, not something a mock should stand in for.
describe("computeSearchMetrics", () => {
  const sessionIds: string[] = [];

  beforeAll(async () => {
    // One exact-product fast-path session (never asked, finalized immediately).
    const fastPath = await startSearchSession(`Apple iPhone 6 metrics-test-${Date.now()}`, null);
    sessionIds.push(fastPath.id);
    await finalizeSearch(fastPath.query, { query: fastPath.query }, { directMatch: null, sessionId: fastPath.id });

    // One clarified-and-confirmed session, with a skipped question and an edited answer.
    const clarified = await startSearchSession(`dishwasher metrics-test-${Date.now()}`, null);
    sessionIds.push(clarified.id);
    await recordClarificationAnswer({
      searchSessionId: clarified.id,
      question: "What is your maximum budget?",
      answer: "Under $100",
      resolvedAttribute: "budgetMax",
    });
    // Edits the same field again — should count toward answerEditRate.
    await recordClarificationAnswer({
      searchSessionId: clarified.id,
      question: "What is your maximum budget?",
      answer: "Under $250",
      resolvedAttribute: "budgetMax",
    });
    await recordClarificationAnswer({
      searchSessionId: clarified.id,
      question: "Which condition do you prefer?",
      answer: "Skipped",
      resolvedAttribute: "condition",
    });
    await finalizeSearch(
      clarified.query,
      { query: clarified.query, budgetMax: 250 },
      { directMatch: null, sessionId: clarified.id },
    );

    // One clarified-but-abandoned session (never confirmed).
    const abandoned = await startSearchSession(`laptop metrics-test-${Date.now()}`, null);
    sessionIds.push(abandoned.id);
  });

  afterAll(async () => {
    await prisma.searchClarification.deleteMany({ where: { searchSessionId: { in: sessionIds } } });
    await prisma.searchSession.deleteMany({ where: { id: { in: sessionIds } } });
    await prisma.$disconnect();
  });

  it("counts total sessions and never logs/returns raw query text", async () => {
    const report = await computeSearchMetrics();
    expect(report.totalSearchSessions).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(report)).not.toMatch(/metrics-test/);
  });

  it("names every metric the hardening spec asked for but can't measure yet, with a reason", () => {
    const required = [
      "aiExtractionSuccessRate",
      "heuristicFallbackRate",
      "aiTimeoutRate",
      "invalidAiResponseRate",
      "comparableAlternativeRate",
      "sessionResumeRate",
    ];
    return computeSearchMetrics().then((report) => {
      for (const key of required) {
        expect(report.unmeasured[key]).toBeTruthy();
      }
    });
  });

  it("produces rates within [0, 1] for every measured metric", async () => {
    const report = await computeSearchMetrics();
    for (const value of [
      report.exactProductFastPathRate,
      report.clarificationRate,
      report.confirmationRate,
      report.comparisonCompletionRate,
      report.noResultRate,
      report.optionalQuestionSkipRate,
      report.answerEditRate,
    ]) {
      if (value !== null) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});
