import type { Metadata } from "next";
import { TrustPageLayout, TrustSection } from "@/components/TrustPageLayout";

export const metadata: Metadata = {
  title: "How ranking works — Importnest",
  description: "How Importnest orders comparison offers, in plain language.",
};

export default function HowRankingWorksPage() {
  return (
    <TrustPageLayout
      title="How ranking works"
      intro="A short explanation of how we decide which offer shows first — no hidden formula, no paid placement."
    >
      <TrustSection title="Your priority decides the order">
        <p>
          On every comparison page you can sort by Best overall, Lowest total cost, Fastest
          available, Best condition, or Best protection. Switching priorities changes the order
          offers appear in — it never changes what data is shown for each one.
        </p>
      </TrustSection>

      <TrustSection title="Organic ranking uses real data only">
        <p>
          Rankings are calculated from the listing data we actually have: total known cost (item
          price plus shipping and mandatory fees), condition, whether the source is an authorized
          or manufacturer channel, and real fulfillment signals like confirmed pickup. Nothing is
          scored on a rating, review count, or delivery date we don&apos;t actually have.
        </p>
      </TrustSection>

      <TrustSection title="Stale data doesn't get to claim &ldquo;best&rdquo;">
        <p>
          If the top-ranked offer&apos;s price data is old enough to be unreliable, we don&apos;t
          label it a confident &ldquo;Best overall&rdquo; or &ldquo;Lowest total cost&rdquo; pick.
          Instead it shows as a neutral &ldquo;Available option&rdquo; with a prompt to refresh
          prices before you buy. A ranking claim is only as trustworthy as the data behind it.
        </p>
      </TrustSection>

      <TrustSection title="Sponsored placements are kept separate">
        <p>
          Sponsored offers are shown in their own, clearly labeled section. They are never mixed
          into organic rankings and never change the order of the offers ranked above.
        </p>
      </TrustSection>

      <TrustSection title="Missing data is reported honestly, not guessed">
        <p>
          When a source doesn&apos;t give us a detail — a warranty, a return window, a delivery
          estimate — we say it wasn&apos;t provided instead of inventing a plausible-looking value.
          You&apos;ll see this called out directly on the offer or in its &ldquo;Why this
          option&rdquo; explanation.
        </p>
      </TrustSection>
    </TrustPageLayout>
  );
}
