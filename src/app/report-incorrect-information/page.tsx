import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout, TrustSection } from "@/components/TrustPageLayout";

export const metadata: Metadata = {
  title: "Report incorrect information — Importnest",
  description: "How to flag a wrong price, listing, or product match on Importnest.",
};

export default function ReportIncorrectInformationPage() {
  return (
    <TrustPageLayout
      title="Report incorrect information"
      intro="Spot a wrong price, a mismatched product, or missing data? Here's how to flag it."
    >
      <TrustSection title="What to include">
        <p>
          The product name or comparison page URL, the retailer or offer that looks wrong, and
          what you expected to see instead (for example, the correct price or the correct
          product). Screenshots help.
        </p>
      </TrustSection>

      <TrustSection title="How to send it">
        <p>
          Email{" "}
          <a href="mailto:support@importnest.example" className="font-medium text-link hover:underline">
            support@importnest.example
          </a>{" "}
          with the details above. We review reports and correct or remove listings that turn out
          to be wrong.
        </p>
      </TrustSection>

      <TrustSection title="Why this happens">
        <p>
          Listing data comes from automated retailer feeds. Occasionally a feed is delayed,
          mismatched, or out of date before our next sync — see{" "}
          <Link href="/data-freshness" className="font-medium text-link hover:underline">
            data freshness
          </Link>{" "}
          for how we label that. Reports from shoppers help us catch what automated checks miss.
        </p>
      </TrustSection>
    </TrustPageLayout>
  );
}
