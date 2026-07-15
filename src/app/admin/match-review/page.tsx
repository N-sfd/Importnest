import { LogoutButton } from "@/components/LogoutButton";
import { PageShell } from "@/components/PageShell";
import { prisma } from "@/lib/prisma";

const resultStyle: Record<string, string> = {
  match: "text-green-700",
  review: "text-amber-700",
  missing: "text-red-600",
  conflict: "text-red-600",
};

type ConflictAttribute = {
  attribute: string;
  canonicalValue: string;
  candidateValue: string;
  result: string;
};

export default async function MatchReviewPage() {
  const review = await prisma.matchReview.findFirst({
    include: {
      productMatch: {
        include: {
          canonicalProduct: true,
          listing: { include: { source: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const ranking = await prisma.rankingConfig.findFirst({
    orderBy: { version: "desc" },
  });

  if (!review) {
    return (
      <PageShell>
        <h1 className="text-2xl font-bold text-foreground">Product match review</h1>
        <p className="mt-4 text-sm text-gray-600">No pending match reviews.</p>
      </PageShell>
    );
  }

  const attributes = (JSON.parse(review.conflicts ?? "[]") as ConflictAttribute[]) ?? [];
  const confidence = review.productMatch.confidence;
  const threshold = ranking?.matchThreshold ?? 0.9;
  const productName = `${review.productMatch.canonicalProduct.modelName}`;
  const sourceName = review.productMatch.listing.source.name;

  return (
    <PageShell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product match review</h1>
          <p className="mt-1 text-sm text-gray-600">
            Operations workspace for low-confidence or conflicting matches.
          </p>
        </div>
        <LogoutButton />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {productName} · candidate from {sourceName}
      </p>

      <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <span className="font-semibold">Review required</span> — Confidence{" "}
        {confidence.toFixed(2)} is below the {threshold.toFixed(2)} exact-match threshold.
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-border bg-panel shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-navy-800 text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Attribute</th>
              <th className="px-4 py-3 font-semibold">Canonical product</th>
              <th className="px-4 py-3 font-semibold">Candidate listing</th>
              <th className="px-4 py-3 font-semibold">Result</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((a) => (
              <tr key={a.attribute} className="border-t border-border">
                <td className="px-4 py-3 text-gray-600">{a.attribute}</td>
                <td className="px-4 py-3 text-foreground">{a.canonicalValue}</td>
                <td className="px-4 py-3 text-foreground">{a.candidateValue}</td>
                <td
                  className={`px-4 py-3 font-semibold capitalize ${resultStyle[a.result] ?? ""}`}
                >
                  {a.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" className="btn-accent px-4 py-2 text-sm text-foreground">
          Reject match
        </button>
        <button type="button" className="btn-accent px-4 py-2 text-sm text-foreground">
          Mark comparable
        </button>
        <button type="button" className="btn-cta px-4 py-2 text-sm">
          Approve exact match
        </button>
      </div>
    </PageShell>
  );
}
