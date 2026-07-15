import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import {
  PrimaryAction,
  SecondaryAction,
  StatusBanner,
  StatusPanel,
} from "@/components/StatusPanel";
import { productImageFor, productThumbClass } from "@/lib/images";
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
    comparableCandidates.length > 0
      ? await prisma.canonicalProduct.findMany({
          where: { id: { in: comparableCandidates } },
          include: { brand: true },
        })
      : [];

  const categorySlug =
    intent?.category ??
    (products[0]
      ? (
          await prisma.canonicalProduct.findUnique({
            where: { id: products[0].id },
            include: { category: true },
          })
        )?.category.slug
      : undefined);

  return (
    <PageShell>
      {products.length > 0 ? (
        <>
          <StatusBanner
            tone="accent"
            title="No exact match"
            description={`We could not find an exact match for “${query}”, but comparable products are available.`}
          />
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-navy-900">
            Comparable products available
          </h1>
          <p className="mt-1 text-sm text-muted">
            These alternatives share category or attribute overlap with your search.
          </p>
          <ul className="mt-6 space-y-3">
            {products.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/compare/${p.id}?comparable=1`}
                  className="panel offer-card flex items-center gap-4 p-4 transition hover:border-navy-800"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                    <Image
                      src={productImageFor(p.id)}
                      alt=""
                      fill
                      className={productThumbClass(productImageFor(p.id))}
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy-900">{p.modelName}</p>
                    <p className="text-sm text-muted">{p.brand.name}</p>
                  </div>
                  <span className="shrink-0 rounded border border-dashed border-navy-800/35 bg-surface px-2.5 py-1 text-xs font-semibold text-navy-800">
                    Comparable option
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryAction href="/">Edit search</PrimaryAction>
            {categorySlug ? (
              <SecondaryAction href={`/search/results?category=${categorySlug}`}>
                Browse category
              </SecondaryAction>
            ) : (
              <SecondaryAction href="/search/results">Browse all products</SecondaryAction>
            )}
          </div>
        </>
      ) : (
        <StatusPanel
          title="No matching product found"
          description={`We could not match “${query}” to a product we track. Try a different name, the exact model number, or a UPC.`}
          actions={
            <>
              <PrimaryAction href="/">Edit search</PrimaryAction>
              <SecondaryAction
                href={`/search/clarify?${new URLSearchParams({
                  q: query,
                  alt: "comparable",
                }).toString()}`}
              >
                Allow comparable alternatives
              </SecondaryAction>
              <SecondaryAction href="/search/results?category=appliances">
                Browse category
              </SecondaryAction>
            </>
          }
        />
      )}

      {intent ? (
        <div className="panel mt-4 bg-surface p-4 shadow-none">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            What we captured
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {intent.budgetMax != null ? (
              <span className="rounded-full bg-panel px-3 py-1 text-xs font-medium ring-1 ring-border">
                Under ${intent.budgetMax}
              </span>
            ) : null}
            {intent.condition ? (
              <span className="rounded-full bg-panel px-3 py-1 text-xs font-medium ring-1 ring-border">
                Condition: {intent.condition.replace(/_/g, " ")}
              </span>
            ) : null}
            {intent.allowComparableAlternatives != null ? (
              <span className="rounded-full bg-panel px-3 py-1 text-xs font-medium ring-1 ring-border">
                {intent.allowComparableAlternatives
                  ? "Comparable alternatives OK"
                  : "Exact model only"}
              </span>
            ) : null}
            {intent.deliveryBy ? (
              <span className="rounded-full bg-panel px-3 py-1 text-xs font-medium ring-1 ring-border">
                Needed by: {intent.deliveryBy}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
