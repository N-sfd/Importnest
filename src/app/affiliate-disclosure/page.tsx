import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout, TrustSection } from "@/components/TrustPageLayout";

export const metadata: Metadata = {
  title: "Affiliate disclosure — Importnest",
  description: "Importnest may earn referral income. It never affects organic ranking.",
};

export default function AffiliateDisclosurePage() {
  return (
    <TrustPageLayout
      title="Affiliate disclosure"
      intro="A plain explanation of how Importnest makes money, and what it does and doesn't affect."
    >
      <TrustSection title="We may earn referral income">
        <p>
          Importnest may earn a commission when you click through to a retailer and make a
          purchase. This comes from the retailer, at no extra cost to you.
        </p>
      </TrustSection>

      <TrustSection title="It does not improve organic ranking">
        <p>
          Referral income never changes where an offer appears in organic comparison results.
          Ranking is based only on real listing data — price, condition, fulfillment signals, and
          source trust — described on our{" "}
          <Link href="/how-ranking-works" className="font-medium text-link hover:underline">
            How ranking works
          </Link>{" "}
          page. Sponsored placements, when shown, are kept in their own labeled section and never
          mixed into or reordered with organic results.
        </p>
      </TrustSection>
    </TrustPageLayout>
  );
}
