"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompareBasket } from "@/components/CompareBasketProvider";
import { PrimaryAction, StatusPanel } from "@/components/StatusPanel";
import {
  formatFreshness,
  freshnessWarningLabel,
  needsFreshnessWarning,
} from "@/lib/freshness";
import { productThumbClass } from "@/lib/images";
import type { CompareBasketItem } from "@/lib/compare-basket";

function money(value: number | null): string {
  return value != null ? `$${value.toFixed(2)}` : "—";
}

/**
 * Side-by-side comparison tool for the compare basket.
 * Columns are comparison attributes; each product is a row.
 */
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
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">
            Compare products
          </h1>
          <p className="mt-1 text-sm text-muted">
            {products.length === 1
              ? "Add another product to unlock the full side-by-side table."
              : `Side-by-side comparison of ${products.length} products using live Total Known Cost.`}
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
        >
          Clear all
        </button>
      </div>

      {/* Desktop: full side-by-side table */}
      <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-border bg-panel shadow-[var(--shadow-panel)] md:block">
        <table className="compare-tool-table min-w-[960px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Image
              </th>
              <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Product
              </th>
              <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Brand
              </th>
              <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Lowest Total Known Cost
              </th>
              <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Offer count
              </th>
              <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Condition
              </th>
              <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Delivery / pickup
              </th>
              <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Source freshness
              </th>
              <th scope="col" className="min-w-[180px] px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Best reason
              </th>
              <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const warn = needsFreshnessWarning(product.lastCheckedMinutesAgo);
              return (
                <tr key={product.id} className="border-b border-border last:border-b-0 align-top">
                  <td className="px-3 py-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-[#F7FAFC]">
                      <Image
                        src={product.imageSrc}
                        alt=""
                        fill
                        className={productThumbClass(product.imageSrc)}
                        sizes="64px"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="max-w-[200px] font-bold leading-snug text-navy-900">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{product.categoryName}</p>
                  </td>
                  <td className="px-3 py-3 font-semibold text-navy-900">{product.brandName}</td>
                  <td className="px-3 py-3 text-base font-extrabold tabular-nums text-navy-900">
                    {money(product.lowestKnownPrice)}
                  </td>
                  <td className="px-3 py-3 font-semibold text-navy-900">
                    {product.offerCount > 0 ? product.offerCount : "—"}
                    {product.sourceCount > 0 ? (
                      <span className="mt-0.5 block text-xs font-normal text-muted">
                        {product.sourceCount} {product.sourceCount === 1 ? "source" : "sources"}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-navy-900">
                    {product.conditions.length > 0 ? product.conditions.join(", ") : "—"}
                  </td>
                  <td className="px-3 py-3 text-navy-900">
                    {product.deliverySummary ?? "Not provided"}
                  </td>
                  <td className="px-3 py-3 text-muted">
                    <span className="block text-navy-900">
                      {formatFreshness(product.lastCheckedMinutesAgo)}
                    </span>
                    {warn ? (
                      <span className="mt-0.5 block text-xs font-medium text-amber-800">
                        {freshnessWarningLabel(product.lastCheckedMinutesAgo)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-xs leading-relaxed text-muted">
                    {product.bestReason ?? "No clear top offer among current listings."}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex min-w-[7.5rem] flex-col gap-1.5">
                      <Link
                        href={`/compare/${product.id}`}
                        className="btn-cta px-3 py-1.5 text-center text-xs"
                      >
                        View offers
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-800"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/tablet: stacked comparison cards instead of a table */}
      <div className="mt-4 grid gap-3 md:hidden">
        {products.map((product) => {
          const warn = needsFreshnessWarning(product.lastCheckedMinutesAgo);
          return (
            <div
              key={product.id}
              className="rounded-2xl border border-border bg-panel p-4 shadow-[var(--shadow-panel)]"
            >
              <div className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-[#F7FAFC]">
                  <Image
                    src={product.imageSrc}
                    alt=""
                    fill
                    className={productThumbClass(product.imageSrc)}
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug text-navy-900">{product.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {product.brandName} · {product.categoryName}
                  </p>
                  <p className="mt-1 text-lg font-extrabold tabular-nums text-navy-900">
                    {money(product.lowestKnownPrice)}
                  </p>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <dt className="text-muted">Offers</dt>
                  <dd className="mt-0.5 font-semibold text-navy-900">
                    {product.offerCount > 0 ? product.offerCount : "—"}
                    {product.sourceCount > 0
                      ? ` · ${product.sourceCount} ${product.sourceCount === 1 ? "source" : "sources"}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Condition</dt>
                  <dd className="mt-0.5 font-semibold text-navy-900">
                    {product.conditions.length > 0 ? product.conditions.join(", ") : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Delivery</dt>
                  <dd className="mt-0.5 font-semibold text-navy-900">
                    {product.deliverySummary ?? "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Freshness</dt>
                  <dd className="mt-0.5 font-semibold text-navy-900">
                    {formatFreshness(product.lastCheckedMinutesAgo)}
                    {warn ? (
                      <span className="mt-0.5 block font-medium text-amber-800">
                        {freshnessWarningLabel(product.lastCheckedMinutesAgo)}
                      </span>
                    ) : null}
                  </dd>
                </div>
              </dl>

              {product.bestReason ? (
                <p className="mt-2.5 text-xs leading-relaxed text-muted">{product.bestReason}</p>
              ) : null}

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/compare/${product.id}`}
                  className="btn-cta min-h-10 flex-1 px-3 py-2 text-center text-xs"
                >
                  View offers
                </Link>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="min-h-10 rounded-full border border-border px-3 py-2 text-xs font-semibold text-navy-900 hover:border-navy-800"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 1 ? (
        <p className="mt-3 text-sm text-muted">
          Tip: use <span className="font-semibold text-navy-900">Compare</span> on product cards to
          add a second item.
        </p>
      ) : null}
    </div>
  );
}
