import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  finalizeSearch,
  findComparableProducts,
  recordClarificationAnswer,
  startSearchSession,
} from "@/lib/search-data";

// Exercises the real database because the thing under test is exactly a
// Prisma error code (P2025 "record not found" on update, P2003 foreign-key
// violation on insert) that a mock would paper over. A shopper landing on
// /search/confirm or /search/clarify with a stale, expired, or hand-edited
// sid must never see a crash — their query is still fully intact in the URL
// that got them there, so recovery must be silent and the search must
// complete.
describe("session security — invalid/expired sid recovery", () => {
  const sessionsToClean: string[] = [];

  afterAll(async () => {
    await prisma.searchClarification.deleteMany({ where: { searchSessionId: { in: sessionsToClean } } });
    await prisma.searchSession.deleteMany({ where: { id: { in: sessionsToClean } } });
    await prisma.$disconnect();
  });

  it("recordClarificationAnswer never throws for an unknown searchSessionId", async () => {
    await expect(
      recordClarificationAnswer({
        searchSessionId: "nonexistent-session-id-abc123",
        question: "What is your maximum budget?",
        answer: "Under $100",
        resolvedAttribute: "budgetMax",
      }),
    ).resolves.toBeNull();
  });

  it("finalizeSearch recovers from an unknown/expired sid by opening a fresh session, preserving the query", async () => {
    const uniqueQuery = `backpack-recovery-test-${Date.now()}`;
    const result = await finalizeSearch(
      uniqueQuery,
      { query: uniqueQuery, budgetMax: 50 },
      { directMatch: null, sessionId: "expired-or-forged-sid-xyz789" },
    );
    // No throw, and the search still completes (either a redirect or an
    // honest no-match) instead of a crash that loses the shopper's query.
    expect(["redirect", "no-match"]).toContain(result.kind);

    const recovered = await prisma.searchSession.findFirst({
      where: { query: uniqueQuery },
      orderBy: { createdAt: "desc" },
    });
    expect(recovered).not.toBeNull();
    sessionsToClean.push(recovered!.id);
  });

  it("a real, valid sid finalizes in place rather than creating a duplicate session", async () => {
    const uniqueQuery = `dishwasher-dedup-test-${Date.now()}`;
    const session = await startSearchSession(uniqueQuery, null);
    sessionsToClean.push(session.id);

    await finalizeSearch(
      uniqueQuery,
      { query: uniqueQuery, condition: "new" },
      { directMatch: null, sessionId: session.id },
    );

    const updated = await prisma.searchSession.findUnique({ where: { id: session.id } });
    expect(updated).not.toBeNull();
    expect(updated!.status).not.toBe("clarifying");

    const allWithQuery = await prisma.searchSession.findMany({ where: { query: uniqueQuery } });
    expect(allWithQuery).toHaveLength(1);
  });
});

describe("session security — cross-session isolation", () => {
  const sessionsToClean: string[] = [];

  afterAll(async () => {
    await prisma.searchSession.deleteMany({ where: { id: { in: sessionsToClean } } });
    await prisma.$disconnect();
  });

  it("each guest session gets a distinct, non-sequential-looking id", async () => {
    const a = await startSearchSession("laptop", null);
    const b = await startSearchSession("laptop", null);
    sessionsToClean.push(a.id, b.id);

    expect(a.id).not.toBe(b.id);
    // Not a small sequential integer or otherwise trivially guessable/incrementable.
    expect(a.id.length).toBeGreaterThanOrEqual(20);
    expect(/^\d+$/.test(a.id)).toBe(false);
  });

  it("finalizing one session never mutates another session's row", async () => {
    const a = await startSearchSession("monitor", null);
    const b = await startSearchSession("monitor", null);
    sessionsToClean.push(a.id, b.id);

    await finalizeSearch("monitor", { query: "monitor", budgetMax: 200 }, { directMatch: null, sessionId: a.id });

    const untouched = await prisma.searchSession.findUnique({ where: { id: b.id } });
    expect(untouched!.status).toBe("clarifying");
    expect(untouched!.criteria).toBeNull();
  });
});

// Real database because the thing under test is exactly the category/brand/
// name word-overlap query against seeded catalog rows — a mock would hide a
// regression where a generic query like "dishwasher" stops surfacing any
// comparable candidate at all.
describe("comparable alternatives available", () => {
  const sessionsToClean: string[] = [];

  afterAll(async () => {
    await prisma.searchSession.deleteMany({ where: { id: { in: sessionsToClean } } });
    await prisma.$disconnect();
  });

  it("findComparableProducts surfaces at least one candidate for a generic category query with no exact match", async () => {
    const candidates = await findComparableProducts("dishwasher");
    expect(candidates.length).toBeGreaterThan(0);
  });

  it("finalizeSearch reports a real comparable candidate list rather than a fabricated one for a generic query", async () => {
    const session = await startSearchSession("dishwasher", null);
    sessionsToClean.push(session.id);

    const result = await finalizeSearch(
      "dishwasher",
      { query: "dishwasher" },
      { directMatch: null, sessionId: session.id },
    );
    // Either it auto-resolved a single comparable candidate (redirect,
    // flagged isComparable via ?comparable=1), routed to the results list, or
    // reported the no-match state with real candidate ids — never a crash,
    // and never candidates for a product that doesn't exist in the catalog.
    expect(["redirect", "results", "no-match"]).toContain(result.kind);
    if (result.kind === "no-match") {
      for (const id of result.comparableCandidates) {
        const exists = await prisma.canonicalProduct.findUnique({ where: { id } });
        expect(exists).not.toBeNull();
      }
    }
  });
});
