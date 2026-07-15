import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout, TrustSection } from "@/components/TrustPageLayout";

export const metadata: Metadata = {
  title: "Privacy — Importnest",
  description: "What Importnest collects and why, in plain language.",
};

export default function PrivacyPage() {
  return (
    <TrustPageLayout
      title="Privacy"
      intro="A short, plain-language summary of what we collect and why — not a wall of legal text."
    >
      <TrustSection title="What we collect">
        <p>
          If you create an account, we store your email and the products you save or set price
          alerts on. If you search, we keep the query and any preferences you give us (budget,
          condition, timing) so we can show relevant results and, if you sign in, personalize your
          saved list.
        </p>
      </TrustSection>

      <TrustSection title="What we don't do">
        <p>
          We don&apos;t sell your data. We don&apos;t share your saved products or alerts with
          retailers. We don&apos;t track you across other sites for advertising.
        </p>
      </TrustSection>

      <TrustSection title="Retailer links">
        <p>
          When you click through to a retailer, you leave Importnest and that retailer&apos;s own
          privacy practices apply to your purchase. See our{" "}
          <Link href="/affiliate-disclosure" className="font-medium text-link hover:underline">
            affiliate disclosure
          </Link>{" "}
          for how those links work.
        </p>
      </TrustSection>

      <TrustSection title="Questions">
        <p>
          This is a short summary rather than a formal legal policy. If you have questions about
          your data, use the &ldquo;Report incorrect information&rdquo; page to reach us.
        </p>
      </TrustSection>
    </TrustPageLayout>
  );
}
