export type CostBreakdownField = {
  amount: number | null | undefined;
  /** True when the amount is a real but non-final estimate rather than a confirmed stored value. */
  estimated?: boolean;
};

export type CostBreakdownInput = CostBreakdownField | number | null | undefined;

export type CostBreakdownLineDisplay = {
  /** "$45.00" / "-$5.00" / "Not provided" — never "$0.00" for missing/invalid data. */
  text: string;
  isMissing: boolean;
  isEstimated: boolean;
};

function normalize(input: CostBreakdownInput): CostBreakdownField {
  if (input == null || typeof input === "number") return { amount: input };
  return input;
}

/**
 * Formats one cost-breakdown line from a real stored value only. Never
 * fabricates a dollar amount: missing, non-finite, or negative (invalid)
 * amounts all read as "Not provided" rather than a misleading "$0.00".
 */
export function formatCostBreakdownLine(
  input: CostBreakdownInput,
  options: { signed?: boolean } = {},
): CostBreakdownLineDisplay {
  const { amount, estimated = false } = normalize(input);

  if (amount == null || !Number.isFinite(amount) || amount < 0) {
    return { text: "Not provided", isMissing: true, isEstimated: false };
  }

  const prefix = options.signed && amount > 0 ? "-" : "";
  return { text: `${prefix}$${amount.toFixed(2)}`, isMissing: false, isEstimated: estimated };
}
