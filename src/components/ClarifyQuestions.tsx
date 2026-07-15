"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { recordAnswerAction } from "@/lib/search-actions";
import type { ClarifyingQuestion } from "@/lib/search-intent";

const CAPTURED_LABELS: Record<string, (value: string) => string> = {
  budgetMax: (v) => (v === "any" ? "Any budget" : `Under $${v}`),
  condition: (v) => (v === "any" ? "Any condition" : v.replace(/_/g, " ")),
  alt: (v) => (v === "exact" ? "Exact model only" : "Comparable alternatives OK"),
  priority: (v) => (v === "any" ? "No preference" : v.replace(/_/g, " ")),
  deliveryBy: (v) => (v === "any" ? "No rush" : v),
  brands: (v) => (v === "any" ? "Any brand" : v.split(",").join(", ")),
};

const CAPTURED_TITLES: Record<string, string> = {
  budgetMax: "Budget",
  condition: "Condition",
  alt: "Alternatives",
  priority: "Priority",
  deliveryBy: "Delivery",
  brands: "Brand",
};

function paramKeyFor(id: ClarifyingQuestion["id"]): string {
  if (id === "allowComparableAlternatives") return "alt";
  if (id === "preferredBrands") return "brands";
  if (id === "sortPriority") return "priority";
  return id;
}

export function ClarifyQuestions({
  originalQuery,
  currentParams,
  questions,
  sessionId,
}: {
  originalQuery: string;
  currentParams: Record<string, string>;
  questions: ClarifyingQuestion[];
  sessionId: string;
}) {
  const router = useRouter();
  const [freeText, setFreeText] = useState<Record<string, string>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [questions]);

  const capturedEntries = Object.entries(currentParams).filter(
    ([key]) => key !== "q" && key !== "category" && key !== "sid" && CAPTURED_LABELS[key],
  );

  function navigate(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(currentParams);
    params.set("sid", sessionId);
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) params.delete(key);
      else params.set(key, value);
    }
    router.push(`/search/clarify?${params.toString()}`);
  }

  function answer(question: ClarifyingQuestion, value: string, label: string) {
    void recordAnswerAction({
      searchSessionId: sessionId,
      question: question.prompt,
      answer: label,
      resolvedAttribute: question.id,
    });
    navigate({ [paramKeyFor(question.id)]: value });
  }

  function skip(question: ClarifyingQuestion) {
    void recordAnswerAction({
      searchSessionId: sessionId,
      question: question.prompt,
      answer: "Skipped",
      resolvedAttribute: question.id,
    });
    navigate({ [paramKeyFor(question.id)]: "any" });
  }

  function reset() {
    const params = new URLSearchParams();
    params.set("q", originalQuery);
    router.push(`/search/clarify?${params.toString()}`);
  }

  function continueToComparison() {
    navigate({ continue: "1" });
  }

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold tracking-tight text-foreground outline-none"
      >
        A few quick questions
      </h1>
      <p className="mt-1 text-sm text-muted">
        This helps narrow down &ldquo;{originalQuery}&rdquo; to the right offers.
      </p>

      {capturedEntries.length > 0 && (
        <div className="panel mt-5 bg-surface p-4 shadow-none">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Captured so far</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {capturedEntries.map(([key, value]) => (
              <span
                key={key}
                className="rounded-full bg-panel px-3 py-1 text-xs font-medium ring-1 ring-border"
              >
                {CAPTURED_TITLES[key]}: {CAPTURED_LABELS[key](value)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {questions.map((q) => {
          const promptId = `clarify-question-${q.id}`;
          const inputId = `clarify-freetext-${q.id}`;
          return (
            <fieldset key={q.id} className="panel fade-up p-4">
              <legend id={promptId} className="text-sm font-semibold text-foreground">
                {q.prompt}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby={promptId}>
                {q.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => answer(q, opt.value, opt.label)}
                    className="min-h-11 rounded-full border border-border bg-surface px-3 py-2 text-sm font-medium hover:border-navy-800 hover:bg-navy-100"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {q.allowFreeText && (
                <div className="mt-3 flex gap-2">
                  <label htmlFor={inputId} className="sr-only">
                    Or type your own answer to &ldquo;{q.prompt}&rdquo;
                  </label>
                  <input
                    id={inputId}
                    type="text"
                    placeholder="Or type your own answer"
                    value={freeText[q.id] ?? ""}
                    onChange={(e) => setFreeText((s) => ({ ...s, [q.id]: e.target.value }))}
                    className="min-h-11 flex-1 rounded-full border border-border bg-panel px-4 py-1.5 text-sm outline-none focus:border-navy-800 focus:ring-2 focus:ring-ring/40"
                  />
                  <button
                    type="button"
                    disabled={!freeText[q.id]?.trim()}
                    onClick={() => answer(q, freeText[q.id]!.trim(), freeText[q.id]!.trim())}
                    className="btn-cta min-h-11 px-4 py-1.5 text-sm disabled:opacity-40"
                  >
                    Use this
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => skip(q)}
                aria-label={`Skip "${q.prompt}"`}
                className="mt-3 inline-flex min-h-11 items-center px-1 text-xs font-medium text-muted hover:text-foreground"
              >
                Skip this question
              </button>
            </fieldset>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-11 rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium hover:border-navy-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium hover:border-navy-800"
        >
          Reset criteria
        </button>
        <button
          type="button"
          onClick={continueToComparison}
          className="btn-cta ml-auto min-h-11 px-5 py-2 text-sm"
        >
          Continue to comparison
        </button>
      </div>
    </>
  );
}
