"use server";

import { recordClarificationAnswer } from "@/lib/search-data";

/** Persists a single clarifying-question answer immediately, so it isn't only held in client-side URL state. */
export async function recordAnswerAction(input: {
  searchSessionId: string;
  question: string;
  answer: string;
  resolvedAttribute: string;
}) {
  await recordClarificationAnswer(input);
}
