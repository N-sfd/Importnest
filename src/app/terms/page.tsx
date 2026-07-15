import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout, TrustSection } from "@/components/TrustPageLayout";

export const metadata: Metadata = {
  title: "Terms — Importnest",
  description: "The plain-language basics of using Importnest.",
};

export default function TermsPage() {
  return (
    <TrustPageLayout
      title="Terms"
      intro="The basics of using Importnest, written in plain language rather than dense legal text."
    >
      <TrustSection title="What Importnest is">
        <p>
          Importnest compares offers from approved retailer sources and links you to them.
          Purchases happen on the retailer&apos;s own site, under their own terms — Importnest
          doesn&apos;t sell products directly.
        </p>
      </TrustSection>

      <TrustSection title="Prices and availability can change">
        <p>
          We show real listing data with an honest last-checked time, but prices, stock, and
          delivery details can change between our last check and when you check out. Always
          confirm the final price on the retailer&apos;s site before buying — see our{" "}
          <Link href="/data-freshness" className="font-medium text-link hover:underline">
            data freshness policy
          </Link>
          .
        </p>
      </TrustSection>

      <TrustSection title="Using an account">
        <p>
          If you create an account to save products or set price alerts, you&apos;re responsible
          for keeping your login secure. You can remove saved products and alerts at any time.
        </p>
      </TrustSection>

      <TrustSection title="No guarantees">
        <p>
          Importnest is provided as-is. We work to keep comparisons accurate and honest, but we
          can&apos;t guarantee a retailer&apos;s stock, pricing, or service after you leave our
          site.
        </p>
      </TrustSection>
    </TrustPageLayout>
  );
}
