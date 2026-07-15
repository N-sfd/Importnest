import { redirect } from "next/navigation";
import { ClarifyQuestions } from "@/components/ClarifyQuestions";
import { PageShell } from "@/components/PageShell";
import { SearchNoMatch } from "@/components/SearchNoMatch";
import { extractIntentWithAIOutcome } from "@/lib/ai-search-intent";
import { StatusBanner } from "@/components/StatusPanel";
import { getOrCreateAppUser } from "@/lib/auth";
import { timeSync } from "@/lib/perf";
import { prisma } from "@/lib/prisma";
import { classifyAndResolve, finalizeSearch, startSearchSession } from "@/lib/search-data";
import {
  answeredQuestionIds,
  buildIntent,
  getClarifyingQuestions,
  paramsToRecord,
  parseQueryHeuristics,
  type ClarifyingQuestionId,
  type SearchFlowParams,
} from "@/lib/search-intent";

const AI_INTENT_TO_PARAM: Record<string, (value: unknown) => [string, string] | null> = {
  budgetMax: (v) => (typeof v === "number" ? ["budgetMax", String(v)] : null),
  condition: (v) => (typeof v === "string" ? ["condition", v] : null),
  allowComparableAlternatives: (v) =>
    typeof v === "boolean" ? ["alt", v ? "comparable" : "exact"] : null,
  deliveryBy: (v) => (typeof v === "string" ? ["deliveryBy", v] : null),
  sortPriority: (v) => (typeof v === "string" ? ["priority", v] : null),
};

export default async function ClarifyPage({
  searchParams,
}: {
  searchParams: Promise<SearchFlowParams>;
}) {
  const start = performance.now();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  if (!query) {
    redirect("/search");
  }

  // Defensive re-check: an exact/explicit query landing here directly (e.g.
  // a stale bookmark, browser back) should still skip straight to a result
  // rather than asking unnecessary questions. A generic category term must
  // never take this path, even on a direct hit to this route.
  const { classification, directMatch } = await classifyAndResolve(query);
  const user = await getOrCreateAppUser();
  if (classification.classification === "exact_product") {
    const categoryRecord = params.category
      ? await prisma.category.findUnique({ where: { slug: params.category } })
      : null;
    const intent = buildIntent(query, params);
    const result = await finalizeSearch(query, intent, {
      directMatch,
      categoryId: categoryRecord?.id,
      userId: user?.id ?? null,
    });
    console.info(`[perf] search.clarify(defensive-fast-path) ${(performance.now() - start).toFixed(1)}ms`);
    if (result.kind === "redirect") {
      const qs = result.searchParams.toString();
      redirect(`/compare/${result.productId}${qs ? `?${qs}` : ""}`);
    }
    if (result.kind === "results") {
      redirect(`/search/results?${result.searchParams.toString()}`);
    }
    return (
      <SearchNoMatch
        query={query}
        intent={intent}
        comparableCandidates={result.comparableCandidates}
        currentParams={params}
      />
    );
  }

  const heuristics = timeSync("search.parseQueryHeuristics", () => parseQueryHeuristics(query));
  const answered = answeredQuestionIds(params);
  if (heuristics.budgetMax !== undefined) answered.add("budgetMax");
  if (heuristics.condition !== undefined) answered.add("condition");
  if (heuristics.allowComparableAlternatives !== undefined) answered.add("allowComparableAlternatives");
  if (heuristics.deliveryBy !== undefined) answered.add("deliveryBy");

  let questionWording: Partial<Record<ClarifyingQuestionId, string>> = {};
  let aiUnavailable = false;

  // Only attempt AI extraction once per session, on the very first render
  // for this query (no sid yet). If it yields nothing new — including
  // whenever no API key is configured — this falls through to the exact
  // same deterministic path as before, with no extra redirect.
  if (!params.sid) {
    const aiOutcome = await extractIntentWithAIOutcome(query);
    if (aiOutcome.status === "unavailable") {
      aiUnavailable = true;
    } else {
      const ai = aiOutcome.result;
      questionWording = ai.questionWording;

      const aiParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(ai.intent)) {
        if (answered.has(key as ClarifyingQuestionId)) continue;
        const mapped = AI_INTENT_TO_PARAM[key]?.(value);
        if (mapped) aiParams[mapped[0]] = mapped[1];
      }

      if (Object.keys(aiParams).length > 0) {
        const categoryRecord = params.category
          ? await prisma.category.findUnique({ where: { slug: params.category } })
          : null;
        const sessionId = (await startSearchSession(query, categoryRecord?.id, user?.id ?? null)).id;
        const qs = new URLSearchParams({ ...paramsToRecord(params), ...aiParams, sid: sessionId });
        redirect(`/search/clarify?${qs.toString()}`);
      }
    }
  }

  const availableBrands = (await prisma.brand.findMany({ select: { name: true } })).map((b) => b.name);
  const questions = getClarifyingQuestions(answered, { availableBrands }).map((q) =>
    questionWording[q.id] ? { ...q, prompt: questionWording[q.id]! } : q,
  );
  const readyForConfirmation = questions.length === 0 || params.continue === "1";

  const categoryRecord = params.category
    ? await prisma.category.findUnique({ where: { slug: params.category } })
    : null;
  const sessionId = params.sid ?? (await startSearchSession(query, categoryRecord?.id, user?.id ?? null)).id;
  const currentParams = { sid: sessionId, ...paramsToRecord(params) };

  if (readyForConfirmation) {
    const qs = new URLSearchParams(currentParams);
    console.info(`[perf] search.clarify(to-confirm) ${(performance.now() - start).toFixed(1)}ms`);
    redirect(`/search/confirm?${qs.toString()}`);
  }

  console.info(`[perf] search.clarify(page-load) ${(performance.now() - start).toFixed(1)}ms`);
  return (
    <PageShell width="narrow">
      {aiUnavailable ? (
        <div className="mb-4">
          <StatusBanner
            tone="warn"
            title="AI service unavailable"
            description="We could not use AI assistance for this search, so we are using our standard clarifying questions instead. Your results stay just as accurate."
          />
        </div>
      ) : null}
      <ClarifyQuestions
        originalQuery={query}
        currentParams={currentParams}
        questions={questions}
        sessionId={sessionId}
      />
    </PageShell>
  );
}
