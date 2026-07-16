"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  formatConditionLabel,
  totalKnownCost,
  type CompareRow,
} from "@/lib/compare-view";

type MatrixSort = "total" | "item" | "shipping" | "delivery" | "condition";

const SORT_LABELS: Record<MatrixSort, string> = {
  total: "Total cost",
  item: "Item price",
  shipping: "Shipping",
  delivery: "Delivery",
  condition: "Condition",
};

function deliveryRank(label: string, pickup: boolean) {
  if (pickup) return 0;
  const lower = label.toLowerCase();
  if (lower.includes("tomorrow") || lower.includes("today")) return 1;
  if (lower.includes("unavailable")) return 99;
  return 5;
}

/**
 * Side-by-side comparison table for desktop. Sorts locally for exploration only —
 * ranking labels from the list view remain the server authority.
 */
export function CompareMatrixTable({
  productId,
  rows,
  topId,
}: {
  productId: string;
  rows: CompareRow[];
  topId?: string;
}) {
  const [sort, setSort] = useState<MatrixSort>("total");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const la = a.listing;
      const lb = b.listing;
      switch (sort) {
        case "item":
          return la.price - lb.price;
        case "shipping":
          return la.shipping - lb.shipping;
        case "delivery":
          return (
            deliveryRank(la.deliveryLabel, la.pickupAvailable) -
            deliveryRank(lb.deliveryLabel, lb.pickupAvailable)
          );
        case "condition":
          return formatConditionLabel(la.condition).localeCompare(
            formatConditionLabel(lb.condition),
          );
        case "total":
        default:
          return totalKnownCost(la) - totalKnownCost(lb);
      }
    });
    return copy;
  }, [rows, sort]);

  return (
    <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-panel">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <span className="text-xs font-semibold text-muted">Sort columns</span>
        {(Object.keys(SORT_LABELS) as MatrixSort[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSort(key)}
            aria-pressed={sort === key}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
              sort === key
                ? "bg-cta text-white"
                : "border border-border bg-panel text-muted hover:border-accent"
            }`}
          >
            {SORT_LABELS[key]}
          </button>
        ))}
      </div>
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-3 py-2.5 font-semibold">Retailer</th>
            <th className="px-3 py-2.5 font-semibold">Item</th>
            <th className="px-3 py-2.5 font-semibold">Ship</th>
            <th className="px-3 py-2.5 font-semibold">Fees</th>
            <th className="px-3 py-2.5 font-semibold">Total</th>
            <th className="px-3 py-2.5 font-semibold">Delivery</th>
            <th className="px-3 py-2.5 font-semibold">Condition</th>
            <th className="px-3 py-2.5 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const { listing } = row;
            const total = totalKnownCost(listing);
            const isTop = listing.id === topId;
            return (
              <tr
                key={listing.id}
                className={`border-t border-border ${isTop ? "bg-accent/5" : "bg-panel"}`}
              >
                <td className="px-3 py-3 font-semibold text-navy-900">{listing.sourceName}</td>
                <td className="px-3 py-3 tabular-nums">${listing.price.toFixed(2)}</td>
                <td className="px-3 py-3 tabular-nums">${listing.shipping.toFixed(2)}</td>
                <td className="px-3 py-3 tabular-nums">${listing.mandatoryFees.toFixed(2)}</td>
                <td className="px-3 py-3 font-extrabold tabular-nums text-navy-900">
                  ${total.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-muted">
                  {listing.pickupAvailable ? "Pickup" : listing.deliveryLabel}
                </td>
                <td className="px-3 py-3">{formatConditionLabel(listing.condition)}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/compare/${productId}/why/${listing.id}`}
                      className="text-xs font-semibold text-link hover:underline"
                    >
                      Why
                    </Link>
                    {listing.url ? (
                      <a
                        href={`/go/${listing.id}`}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="text-xs font-semibold text-link hover:underline"
                      >
                        View
                      </a>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-border px-3 py-2 text-[11px] text-muted">
        Table sorting is for exploration. Recommended badges follow the Sort by priority above.
      </p>
    </div>
  );
}
