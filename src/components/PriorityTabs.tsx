"use client";

import { useState } from "react";
import Link from "next/link";
import { getListingsWithRecommendations, totalKnownCost } from "@/lib/mock-data";
import type { Priority } from "@/lib/types";

const priorities: { key: Priority; label: string }[] = [
  { key: "best-overall", label: "Best overall" },
  { key: "lowest-cost", label: "Lowest total cost" },
  { key: "fastest-delivery", label: "Fastest delivery" },
  { key: "best-returns", label: "Best returns" },
];

const sortKey: Record<Priority, (a: (typeof rows)[number], b: (typeof rows)[number]) => number> = {
  "best-overall": (a, b) => a.recommendation.rank - b.recommendation.rank,
  "lowest-cost": (a, b) => totalKnownCost(a.listing) - totalKnownCost(b.listing),
  "fastest-delivery": (a, b) => (a.listing.pickupAvailable === b.listing.pickupAvailable ? 0 : a.listing.pickupAvailable ? -1 : 1),
  "best-returns": (a, b) => b.listing.returnWindowDays - a.listing.returnWindowDays,
};

const rows = getListingsWithRecommendations();

const badgeForPriority: Record<Priority, string> = {
  "best-overall": "Best overall",
  "lowest-cost": "Lowest cost",
  "fastest-delivery": "Fastest",
  "best-returns": "Best returns",
};

export function PriorityTabs({ productId }: { productId: string }) {
  const [priority, setPriority] = useState<Priority>("best-overall");
  const sorted = [...rows].sort(sortKey[priority]);
  const topId = sorted[0]?.listing.id;

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
        {priorities.map((p) => (
          <button
            key={p.key}
            onClick={() => setPriority(p.key)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              priority === p.key ? "bg-navy-900 text-white" : "text-gray-600 hover:bg-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-navy-900 text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Retailer</th>
              <th className="px-4 py-3 font-semibold">Condition</th>
              <th className="px-4 py-3 font-semibold">Total cost</th>
              <th className="px-4 py-3 font-semibold">Delivery</th>
              <th className="px-4 py-3 font-semibold">Protection</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ listing }) => (
              <tr key={listing.id} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  <div className="font-medium text-navy-900">{listing.sourceName}</div>
                  {listing.id === topId && (
                    <span className="mt-1 inline-block rounded bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-900">
                      {badgeForPriority[priority]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 capitalize text-gray-600">{listing.condition.replace("-", " ")}</td>
                <td className="px-4 py-3 font-semibold text-navy-900">${totalKnownCost(listing).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600">{listing.deliveryLabel}</td>
                <td className="px-4 py-3 text-gray-600">
                  {listing.warrantyLabel} · {listing.returnWindowDays}-day returns
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/compare/${productId}/why/${listing.id}`}
                    className="rounded-md border border-navy-800 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-100"
                  >
                    Why this option
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 rounded-md bg-amber-50 px-4 py-2 text-xs text-amber-800">
        Sponsored offers are shown separately and do not influence organic ranking.
      </p>
    </div>
  );
}
