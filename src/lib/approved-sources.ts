/**
 * Marketplace IDs seeded for demo / connector experiments.
 * Keep them out of customer-facing “Approved sources” trust UI.
 */
export const DEMO_REFERENCE_SOURCE_IDS = new Set([
  "src-amazon",
  "src-idealo",
  "src-authorized-outlet",
]);

export function isPublicApprovedSource(sourceId: string) {
  return !DEMO_REFERENCE_SOURCE_IDS.has(sourceId);
}
