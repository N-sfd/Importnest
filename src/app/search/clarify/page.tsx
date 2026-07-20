import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CategoryVisualCard } from "@/components/CategoryVisualCard";
import { ClarifyQuestions } from "@/components/ClarifyQuestions";
import { PageShell } from "@/components/PageShell";
import { SearchNoMatch } from "@/components/SearchNoMatch";
import { extractIntentWithAIOutcome } from "@/lib/ai-search-intent";
import { StatusBanner } from "@/components/StatusPanel";
import { getOrCreateAppUser } from "@/lib/auth";
import {
  categoryDisplayTitle,
  categoryHasImage,
  categoryImageSrc,
} from "@/lib/category-visuals";
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

/** Shown on broad queries with no detected category, to help narrow down where to look. */
const SUGGESTED_CATEGORIES = [
  "electronics",
  "appliances",
  "kitchen",
  "footwear",
  "accessories",
  "automotive",
];

/** Narrower set surfaced specifically for "deals"-style queries. */
const DEALS_CATEGORIES = ["electronics", "appliances", "kitchen", "footwear", "accessories"];

function DealsTagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.6 12.6 12.6 20.6a2 2 0 0 1-2.83 0l-6.37-6.37a2 2 0 0 1 0-2.83l8-8A2 2 0 0 1 13 3h6a2 2 0 0 1 2 2v6a2 2 0 0 1-.4 1.6z" />
      <circle cx="15.5" cy="8.5" r="1.5" />
    </svg>
  );
}

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

  const isDealsQuery = query.toLowerCase().includes("deal");

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
            tone="info"
            title="Using standard questions"
            description="AI assistance is not available right now, so Importnest is using the regular guided search. Product facts and results still come from approved source data."
          />
        </div>
      ) : null}
      {params.category ? (
        <CategoryVisualCard
          category={params.category}
          title={categoryRecord?.name}
          query={query}
          className="mb-5"
          compact
        />
      ) : (
        <div className="mb-5 space-y-3">
          {isDealsQuery ? (
            <aside
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 shadow-[var(--shadow-panel)] sm:gap-4 sm:px-4"
              aria-label="Deals"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-panel text-accent sm:h-16 sm:w-16">
                <DealsTagIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Deals</p>
                <p className="truncate text-sm font-bold text-navy-900 sm:text-base">
                  Find deal-worthy categories to compare
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted sm:text-sm">
                  Pick a department below, then answer a few questions so we can compare useful
                  offers from approved sources.
                </p>
              </div>
            </aside>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Not sure which department?
            </p>
          )}
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {(isDealsQuery ? DEALS_CATEGORIES : SUGGESTED_CATEGORIES).map((slug) => (
              <Link
                key={slug}
                href={`/search?category=${slug}&q=${encodeURIComponent(query)}`}
                className="flex w-[6.5rem] shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-panel p-2 text-center transition hover:border-navy-800"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-surface">
                  {categoryHasImage(slug) ? (
                    <Image
                      src={categoryImageSrc(slug)!}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : null}
                </div>
                <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-navy-900">
                  {isDealsQuery
                    ? `${categoryDisplayTitle(slug)} deals`
                    : categoryDisplayTitle(slug)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <ClarifyQuestions
        originalQuery={query}
        currentParams={currentParams}
        questions={questions}
        sessionId={sessionId}
      />
    </PageShell>
  );
}
