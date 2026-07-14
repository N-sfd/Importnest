"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sortCompareRows, totalKnownCost, type CompareRow } from "@/lib/compare-view";
import { sourceImageFor } from "@/lib/images";
import type { Priority } from "@/lib/types";

const priorities: { key: Priority; label: string }[] = [
  { key: "best-overall", label: "Best overall" },
  { key: "lowest-cost", label: "Lowest total cost" },
  { key: "fastest-delivery", label: "Fastest delivery" },
  { key: "best-returns", label: "Best returns" },
];

const badgeForPriority: Record<Priority, string> = {
  "best-overall": "Best overall",
  "lowest-cost": "Lowest cost",
  "fastest-delivery": "Fastest",
  "best-returns": "Best returns",
};

export function PriorityTabs({
  productId,
  rows,
}: {
  productId: string;
  rows: CompareRow[];
}) {
  const [priority, setPriority] = useState<Priority>("best-overall");
  const sorted = sortCompareRows(rows, priority);
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

      <p className="mt-3 text-xs text-gray-500 sm:hidden">
        Swipe left to see delivery, protection, and actions →
      </p>
      <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 sm:mt-4">
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
                <td className="max-w-[240px] px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <Image
                      src={listing.hasDistinctSeller ? "/brand/logo-mark.png" : sourceImageFor(listing.sourceId)}
                      alt=""
                      width={28}
                      height={28}
                      className="mt-0.5 shrink-0 rounded-md"
                    />
                    <div className="min-w-0">
                      <div
                        className="truncate font-medium text-navy-900"
                        title={listing.sourceName}
                      >
                        {listing.sourceName}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {listing.sourceTypeLabel && `${listing.sourceTypeLabel} · `}
                        {listing.freshnessMinutesAgo === 0
                          ? "synced just now"
                          : `synced ${listing.freshnessMinutesAgo}m ago`}
                        {process.env.NODE_ENV === "development"
                          ? ` · ${listing.dataCompletenessPct}% data`
                          : ""}
                      </p>
                      {listing.id === topId && (
                        <span className="mt-1 inline-block rounded bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-900">
                          {badgeForPriority[priority]}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-gray-600">
                  {listing.condition.replace(/-/g, " ")}
                </td>
                <td className="px-4 py-3 font-semibold text-navy-900">
                  ${totalKnownCost(listing).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-600">{listing.deliveryLabel}</td>
                <td className="px-4 py-3 text-gray-600">
                  {listing.warrantyLabel} · {listing.returnPolicyLabel}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/compare/${productId}/why/${listing.id}`}
                      className="rounded-md border border-navy-800 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-100"
                    >
                      Why this option
                    </Link>
                    {listing.url && (
                      <a
                        href={`/go/${listing.id}`}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800"
                      >
                        View offer
                      </a>
                    )}
                  </div>
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
