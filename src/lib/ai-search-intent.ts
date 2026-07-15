import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { ClarifyingQuestionId, SearchIntent } from "@/lib/search-intent";

const MODEL = "claude-haiku-4-5";
export const REQUEST_TIMEOUT_MS = 8000;
export const MAX_RETRIES = 2;
export const MAX_RESPONSE_TOKENS = 400;

const QUESTION_IDS = [
  "budgetMax",
  "condition",
  "allowComparableAlternatives",
  "sortPriority",
  "deliveryBy",
  "preferredBrands",
] as const;

const aiIntentSchema = z.object({
  budgetMax: z.number().nonnegative().optional(),
  condition: z.enum(["new", "open_box", "refurbished", "used", "any"]).optional(),
  deliveryBy: z.string().max(60).optional(),
  allowComparableAlternatives: z.boolean().optional(),
  sortPriority: z.enum(["best_overall", "lowest_cost", "fastest_delivery", "best_warranty"]).optional(),
});

export const aiResponseSchema = z.object({
  intent: aiIntentSchema,
  questionWording: z
    .array(z.object({ id: z.enum(QUESTION_IDS), prompt: z.string().min(5).max(140) }))
    .max(6)
    .optional(),
});

export type AiExtractionResult = {
  intent: Partial<SearchIntent>;
  questionWording: Partial<Record<ClarifyingQuestionId, string>>;
};

const SYSTEM_PROMPT = `You extract shopping-search intent from a single free-text query.

Only extract what the shopper's own words state or clearly imply — never invent
product facts. Do not guess prices, availability, delivery dates, product
specifications, warranty terms, or retailer information; those come from the
product catalog, not from you.

Optionally suggest more concise, contextual wording for the listed clarifying
question ids (e.g. mention the product type from the query), but keep each
under 140 characters and do not change what the question is actually asking.

Respond with JSON matching the provided schema only.`;

export type AiExtractionOutcome =
  | { status: "ok"; result: AiExtractionResult }
  | { status: "unavailable"; reason: "missing_key" | "service_error" };

/**
 * Best-effort structured-intent extraction. Never throws.
 * Callers should keep the deterministic clarify path when status !== "ok".
 */
export async function extractIntentWithAIOutcome(query: string): Promise<AiExtractionOutcome> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { status: "unavailable", reason: "missing_key" };
  }

  const start = performance.now();
  try {
    const client = new Anthropic();
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_RESPONSE_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Shopper query: ${JSON.stringify(query)}\n\nQuestion ids you may reword: ${QUESTION_IDS.join(", ")}.`,
          },
        ],
        output_config: { format: zodOutputFormat(aiResponseSchema) },
      },
      { timeout: REQUEST_TIMEOUT_MS, maxRetries: MAX_RETRIES },
    );

    if (response.stop_reason === "refusal") {
      return { status: "unavailable", reason: "service_error" };
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { status: "unavailable", reason: "service_error" };
    }

    const parsedJson: unknown = JSON.parse(textBlock.text);
    const result = aiResponseSchema.safeParse(parsedJson);
    if (!result.success) {
      return { status: "unavailable", reason: "service_error" };
    }

    const questionWording: Partial<Record<ClarifyingQuestionId, string>> = {};
    for (const q of result.data.questionWording ?? []) {
      questionWording[q.id] = q.prompt;
    }

    return { status: "ok", result: { intent: result.data.intent, questionWording } };
  } catch (err) {
    console.warn("[ai-search-intent] extraction failed, using deterministic fallback:", err);
    return { status: "unavailable", reason: "service_error" };
  } finally {
    console.info(`[perf] search.aiExtraction ${(performance.now() - start).toFixed(1)}ms`);
  }
}

/**
 * Best-effort structured-intent extraction. Returns null on ANY failure —
 * missing API key, network error, timeout, refusal, or a response that
 * doesn't validate — so callers always have a safe path: fall back to
 * parseQueryHeuristics (search-intent.ts) and the static question prompts.
 * This function never throws.
 */
export async function extractIntentWithAI(query: string): Promise<AiExtractionResult | null> {
  const outcome = await extractIntentWithAIOutcome(query);
  return outcome.status === "ok" ? outcome.result : null;
}
