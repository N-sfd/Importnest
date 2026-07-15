import type { Metadata } from "next";
import { TrustPageLayout, TrustSection } from "@/components/TrustPageLayout";

export const metadata: Metadata = {
  title: "Data freshness policy — Importnest",
  description: "How Importnest labels last-checked times and stale prices.",
};

export default function DataFreshnessPage() {
  return (
    <TrustPageLayout
      title="Data freshness policy"
      intro="Prices and stock change constantly. Here's how we show you how current the data actually is."
    >
      <TrustSection title="Last checked time">
        <p>
          Every offer shows when it was last checked, in plain language — &ldquo;Updated 5 minutes
          ago,&rdquo; &ldquo;Updated 2 hours ago&rdquo; — never a raw timestamp you have to do
          math on.
        </p>
      </TrustSection>

      <TrustSection title="Stale thresholds">
        <p>
          Data checked less than 15 minutes ago is treated as fresh. Between 15 minutes and 1 hour
          it&apos;s aging, shown with a soft reminder that a refresh might help. At 1 hour or
          older, or when we don&apos;t know the age at all, we treat it as stale: totals still
          display, but we stop making confident ranking claims about it and show a banner
          prompting a refresh before you buy.
        </p>
      </TrustSection>

      <TrustSection title="Recheck behavior">
        <p>
          When an offer looks stale, you can refresh it directly from the comparison page to pull
          the latest price, shipping, and fee data for that listing rather than waiting for the
          next scheduled sync.
        </p>
      </TrustSection>

      <TrustSection title="Source failures">
        <p>
          If a retailer&apos;s feed is temporarily unavailable, we say so — &ldquo;Source
          temporarily unavailable&rdquo; — instead of leaving old data on screen without
          explanation or quietly hiding the offer.
        </p>
      </TrustSection>
    </TrustPageLayout>
  );
}
