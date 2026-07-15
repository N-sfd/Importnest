"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
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
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-navy-900">A few quick questions</h1>
        <p className="mt-1 text-sm text-gray-600">
          This helps narrow down &ldquo;{originalQuery}&rdquo; to the right offers.
        </p>

        {capturedEntries.length > 0 && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Captured so far
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {capturedEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-navy-900 ring-1 ring-gray-200"
                >
                  {CAPTURED_TITLES[key]}: {CAPTURED_LABELS[key](value)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700">{q.prompt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => answer(q, opt.value, opt.label)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:border-navy-800 hover:text-navy-900"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {q.allowFreeText && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Or type your own answer"
                    value={freeText[q.id] ?? ""}
                    onChange={(e) => setFreeText((s) => ({ ...s, [q.id]: e.target.value }))}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-navy-800"
                  />
                  <button
                    type="button"
                    disabled={!freeText[q.id]?.trim()}
                    onClick={() => answer(q, freeText[q.id]!.trim(), freeText[q.id]!.trim())}
                    className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-40"
                  >
                    Use this
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => skip(q)}
                className="mt-3 text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                Skip this question
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-navy-800"
          >
            Back
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-navy-800"
          >
            Reset criteria
          </button>
          <button
            type="button"
            onClick={continueToComparison}
            className="ml-auto rounded-md bg-navy-900 px-5 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Continue to comparison
          </button>
        </div>
      </section>
    </main>
  );
}
