"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompareBasket } from "@/components/CompareBasketProvider";
import { PrimaryAction, StatusPanel } from "@/components/StatusPanel";
import { formatFreshness } from "@/lib/freshness";
import { productThumbClass } from "@/lib/images";
import type { CompareBasketItem } from "@/lib/compare-basket";

export function CompareListClient() {
  const { items: basketItems, remove, clear } = useCompareBasket();
  const [products, setProducts] = useState<CompareBasketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const ids = basketItems.map((item) => item.id);
  const idsKey = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/compare-basket?ids=${encodeURIComponent(idsKey)}`)
      .then((res) => res.json())
      .then((data: { items: CompareBasketItem[] }) => {
        if (!cancelled) setProducts(data.items ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  if (loading) {
    return <p className="text-sm text-muted">Loading compare list…</p>;
  }

  if (products.length === 0) {
    return (
      <StatusPanel
        title="Nothing to compare yet"
        description="Add products from search results or product pages to compare them side by side."
        actions={<PrimaryAction href="/search">Start searching</PrimaryAction>}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-navy-900">Compare list</h1>
        <button
          type="button"
          onClick={clear}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
        >
          Clear all
        </button>
      </div>

      {products.length === 1 ? (
        <p className="mt-2 text-sm text-muted">Add another product to compare side by side.</p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <article key={product.id} className="panel flex flex-col gap-2 p-4">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-white">
              <Image
                src={product.imageSrc}
                alt={product.name}
                fill
                className={productThumbClass(product.imageSrc)}
                sizes="(max-width:640px) 50vw, 25vw"
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {product.brandName}
            </p>
            <p className="line-clamp-2 text-sm font-bold leading-snug text-navy-900">
              {product.name}
            </p>
            <p className="text-xs text-muted">{product.categoryName}</p>

            <dl className="mt-1 space-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Lowest known price</dt>
                <dd className="font-semibold tabular-nums text-navy-900">
                  {product.lowestKnownPrice != null ? `$${product.lowestKnownPrice.toFixed(2)}` : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Offers</dt>
                <dd className="font-semibold text-navy-900">{product.offerCount}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Condition</dt>
                <dd className="text-right font-semibold text-navy-900">
                  {product.conditions.length > 0 ? product.conditions.join(", ") : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Last checked</dt>
                <dd className="text-right font-semibold text-navy-900">
                  {formatFreshness(product.lastCheckedMinutesAgo)}
                </dd>
              </div>
            </dl>

            <div className="mt-2 flex gap-2">
              <Link href={`/compare/${product.id}`} className="btn-cta flex-1 px-3 py-1.5 text-center text-xs">
                View product comparison
              </Link>
              <button
                type="button"
                onClick={() => remove(product.id)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
