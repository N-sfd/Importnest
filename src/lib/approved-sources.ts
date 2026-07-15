/**
 * Customer-facing retailer labels & trust copy for the homepage trust UI.
 * Source IDs stay stable in the DB; this is display-only.
 */
export const DEMO_REFERENCE_SOURCE_IDS = new Set([
  "src-amazon",
  "src-idealo",
  "src-authorized-outlet",
]);

export type ApprovedRetailerTrust = {
  label: string;
  badge: string;
  trustHint: string;
};

/** Friendlier, recognizable labels + why we trust them. */
export const APPROVED_RETAILER_TRUST: Record<string, ApprovedRetailerTrust> = {
  "src-official": {
    label: "Apex Home Store",
    badge: "Manufacturer",
    trustHint:
      "Apex Home Store: sold and fulfilled by the brand with full manufacturer warranty and authorized support.",
  },
  "src-retailer-direct": {
    label: "Best Buy",
    badge: "National retailer",
    trustHint:
      "Best Buy: authorized national retailer with store pickup and a guaranteed 15-day return window on most new items.",
  },
  "src-local-electronics": {
    label: "Local Apex Dealer",
    badge: "Authorized dealer",
    trustHint:
      "Local Apex Dealer: verified Authorized Apex Home partner inventory with same-day pickup when listed.",
  },
  "src-google-shopping": {
    label: "Google Shopping",
    badge: "Verified merchants",
    trustHint:
      "Google Shopping: offers from Google’s verified merchant network only — no open-web dropshippers.",
  },
  "src-discount-home": {
    label: "Wayfair Home",
    badge: "Marketplace",
    trustHint:
      "Wayfair Home: licensed home marketplace with tracked delivery and documented seller policies.",
  },
};

export function isPublicApprovedSource(sourceId: string) {
  return !DEMO_REFERENCE_SOURCE_IDS.has(sourceId);
}

export function retailerTrustFor(sourceId: string, fallbackName: string): ApprovedRetailerTrust {
  return (
    APPROVED_RETAILER_TRUST[sourceId] ?? {
      label: fallbackName,
      badge: "Approved",
      trustHint: "Onboarded Importnest source connector with active listing freshness.",
    }
  );
}
