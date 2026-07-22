import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout, TrustSection } from "@/components/TrustPageLayout";

export const metadata: Metadata = {
  title: "How to use Importnest — Importnest",
  description: "A short guide to searching, comparing, and tracking prices on Importnest.",
};

export default function HowToUsePage() {
  return (
    <TrustPageLayout
      title="How to use Importnest"
      intro="A quick guide to finding products, comparing offers, and tracking prices."
    >
      <TrustSection title="Finding products">
        <p>
          <strong className="text-foreground">Natural language search:</strong> use the search bar
          at the top of the page (or the hero search on the homepage). You can type a specific
          product, model number, or UPC — or describe what you need in plain English, like{" "}
          <Link href="/search?q=Quiet%20dishwasher%20under%20%24900" className="text-link hover:underline">
            &ldquo;Quiet dishwasher under $900&rdquo;
          </Link>{" "}
          or{" "}
          <Link href="/search?q=College%20backpack%20under%20%24100" className="text-link hover:underline">
            &ldquo;College backpack under $100&rdquo;
          </Link>
          .
        </p>
        <p className="mt-2">
          <strong className="text-foreground">Browse by category:</strong> use the top navigation
          bar or the &ldquo;Shop by Category&rdquo; section on the homepage to explore a department
          directly — Electronics (phones, laptops, audio), Appliances (dishwashers, refrigerators,
          vacuums), Kitchen (cookware, coffee makers, blenders), Footwear, Beauty Devices,
          Accessories, Automotive, and Outdoors.
        </p>
      </TrustSection>

      <TrustSection title="Comparing offers & deals">
        <p>
          <strong className="text-foreground">Top Products &amp; Best Deals:</strong> the homepage
          surfaces items with tracked price drops — look for a &ldquo;Save X%&rdquo; badge, shown
          only when we have real price history behind it.
        </p>
        <p className="mt-2">
          <strong className="text-foreground">Side-by-side offer view:</strong> click{" "}
          <span className="font-semibold text-navy-900">View offers</span> on any product card to
          see every approved retailer listing for that product in one place, so you can compare
          price, shipping, and delivery timelines directly.
        </p>
      </TrustSection>

      <TrustSection title="Total Known Cost (TKC)">
        <p>
          <span className="font-semibold text-navy-900">
            Total Known Cost = item price + shipping + mandatory fees.
          </span>{" "}
          Unlike sites that only show the sticker price, Importnest totals up what a retailer
          actually discloses up front, so you can compare offers on the number that matters before
          you click through. Taxes aren&apos;t included — they&apos;re calculated at checkout by
          the retailer, and we say so on every offer rather than guess at a number we don&apos;t
          have.
        </p>
      </TrustSection>

      <TrustSection title="Price alerts & watchlists">
        <p>
          <strong className="text-foreground">Save a product:</strong> click the heart icon on any
          product card to add it to your watchlist (sign-in required).
        </p>
        <p className="mt-2">
          <strong className="text-foreground">Set a target price:</strong> on a saved product,
          open the price-alert control and enter a Total Known Cost target — for example, alert me
          when this dishwasher&apos;s TKC drops below $750.
        </p>
        <p className="mt-2">
          <strong className="text-foreground">Checking alerts:</strong> your{" "}
          <Link href="/saved" className="text-link hover:underline">
            Saved products &amp; alerts
          </Link>{" "}
          page shows each alert&apos;s status — watching, triggered, or paused — evaluated live
          against current approved listings whenever you visit. Alerts don&apos;t send email or
          push notifications yet; check back on the saved page to see if your target has been met.
        </p>
      </TrustSection>
    </TrustPageLayout>
  );
}
