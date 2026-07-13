import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { listings, recommendations, totalKnownCost } from "@/lib/mock-data";

export default async function WhyPage({
  params,
}: {
  params: Promise<{ productId: string; listingId: string }>;
}) {
  const { productId, listingId } = await params;
  const listing = listings.find((l) => l.id === listingId);
  const recommendation = recommendations[listingId];
  if (!listing || !recommendation) notFound();

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-navy-900">Why this offer is recommended</h1>
        <p className="mt-1 text-sm text-gray-600">A transparent explanation of the recommendation and trade-offs.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-5 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-800">{recommendation.label}</p>
            <h2 className="mt-1 text-lg font-bold text-navy-900">{listing.sourceName}</h2>
            <p className="text-sm text-gray-600">${totalKnownCost(listing).toFixed(2)} total known cost</p>

            <p className="mt-4 text-sm font-semibold text-gray-700">Why it fits your priorities</p>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
              {recommendation.factors
                .filter((f) => f.positive)
                .map((f) => (
                  <li key={f.label}>✓ {f.label}</li>
                ))}
            </ul>

            {recommendation.tradeOff && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-amber-700">Trade-off</p>
                <p className="mt-1 text-sm text-gray-600">{recommendation.tradeOff}</p>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700">Assumptions</p>
              <ul className="mt-1 list-inside list-disc text-xs text-gray-500">
                {recommendation.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm font-semibold text-navy-900">Cost breakdown</p>
            <dl className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <dt>Product price</dt>
                <dd>${listing.price.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Verified discount</dt>
                <dd>-${listing.verifiedDiscount.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>${listing.shipping.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Mandatory fees</dt>
                <dd>${listing.mandatoryFees.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold text-navy-900">
                <dt>Total</dt>
                <dd>${totalKnownCost(listing).toFixed(2)}</dd>
              </div>
            </dl>

            <button className="mt-6 w-full rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
              Continue to retailer
            </button>
            <p className="mt-2 text-center text-xs text-gray-400">
              Importnest may earn a referral fee. This does not affect the ranking.
            </p>
            <Link
              href={`/compare/${productId}`}
              className="mt-3 block text-center text-xs font-medium text-navy-800 hover:underline"
            >
              Compare another offer
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
