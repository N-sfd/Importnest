import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { productImageFor } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import type { SearchIntent } from "@/lib/search-intent";

export async function SearchNoMatch({
  query,
  intent,
  comparableCandidates,
}: {
  query: string;
  intent?: Partial<SearchIntent>;
  comparableCandidates: string[];
}) {
  const products =
    comparableCandidates.length > 1
      ? await prisma.canonicalProduct.findMany({
          where: { id: { in: comparableCandidates } },
          include: { brand: true },
        })
      : [];

  return (
    <PageShell>
      {products.length > 1 ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            A few comparable options
          </h1>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t find an exact match for &ldquo;{query}&rdquo;, but these are
            comparable alternatives.
          </p>
          <div className="mt-6 space-y-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/compare/${p.id}?comparable=1`}
                className="panel offer-card flex items-center gap-4 p-4 transition hover:border-navy-800"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                  <Image
                    src={productImageFor(p.id)}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{p.modelName}</p>
                  <p className="text-sm text-muted">{p.brand.name}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                  Comparable
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="panel mt-2 px-6 py-12 text-center">
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={56}
            height={56}
            className="mx-auto rounded-xl border border-border bg-white p-1"
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">No matching product yet</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            We couldn&apos;t match &ldquo;{query}&rdquo; to a product we track. Try a different
            name, the exact model number, or a UPC.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-cta px-5 py-2.5 text-sm">
              Try another search
            </Link>
            <Link
              href="/compare/cp-apex-ah4200"
              className="rounded-full border border-border bg-panel px-5 py-2.5 text-sm font-semibold hover:border-navy-800"
            >
              Open live demo
            </Link>
          </div>
        </div>
      )}
      {intent && (
        <div className="panel mt-4 bg-surface p-4 shadow-none">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            What we captured
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {intent.budgetMax != null && (
              <span className="rounded-full bg-panel px-3 py-1 text-xs font-medium ring-1 ring-border">
                Under ${intent.budgetMax}
              </span>
            )}
            {intent.condition && (
              <span className="rounded-full bg-panel px-3 py-1 text-xs font-medium ring-1 ring-border">
                Condition: {intent.condition.replace(/_/g, " ")}
              </span>
            )}
            {intent.allowComparableAlternatives != null && (
              <span className="rounded-full bg-panel px-3 py-1 text-xs font-medium ring-1 ring-border">
                {intent.allowComparableAlternatives
                  ? "Comparable alternatives OK"
                  : "Exact model only"}
              </span>
            )}
            {intent.deliveryBy && (
              <span className="rounded-full bg-panel px-3 py-1 text-xs font-medium ring-1 ring-border">
                Needed by: {intent.deliveryBy}
              </span>
            )}
          </div>
        </div>
      )}
      {products.length > 1 && (
        <Link href="/" className="btn-cta mt-6 inline-block px-5 py-2.5 text-sm">
          Try another search
        </Link>
      )}
    </PageShell>
  );
}
