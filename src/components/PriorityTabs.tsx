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
  initialPriority,
}: {
  productId: string;
  rows: CompareRow[];
  initialPriority?: Priority;
}) {
  const [priority, setPriority] = useState<Priority>(initialPriority ?? "best-overall");
  const sorted = sortCompareRows(rows, priority);
  const topId = sorted[0]?.listing.id;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <span className="mr-1 text-sm font-semibold text-foreground">Sort by</span>
        {priorities.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPriority(p.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              priority === p.key
                ? "bg-navy-900 text-white shadow-sm"
                : "border border-border bg-surface text-muted hover:border-navy-800 hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted">
        {sorted.length} {sorted.length === 1 ? "offer" : "offers"} from approved sources
      </p>

      <ul className="mt-3 space-y-3">
        {sorted.map(({ listing }) => {
          const total = totalKnownCost(listing);
          const isTop = listing.id === topId;
          return (
            <li
              key={listing.id}
              className={`offer-card rounded-2xl border bg-panel p-4 shadow-[var(--shadow-panel)] ${
                isTop ? "border-cta ring-2 ring-cta/25" : "border-border"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 gap-3">
                  <Image
                    src={
                      listing.hasDistinctSeller
                        ? "/brand/logo-mark.png"
                        : sourceImageFor(listing.sourceId)
                    }
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-xl border border-border bg-white object-contain p-1"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="truncate text-base font-semibold text-foreground"
                        title={listing.sourceName}
                      >
                        {listing.sourceName}
                      </h3>
                      {isTop && (
                        <span className="rounded-full bg-cta/30 px-2.5 py-0.5 text-xs font-bold text-navy-900">
                          {badgeForPriority[priority]}
                        </span>
                      )}
                      {listing.isAuthorizedSource && (
                        <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-900">
                          Authorized
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {listing.sourceTypeLabel && `${listing.sourceTypeLabel} · `}
                      {listing.freshnessMinutesAgo === 0
                        ? "synced just now"
                        : `synced ${listing.freshnessMinutesAgo}m ago`}
                      {process.env.NODE_ENV === "development"
                        ? ` · ${listing.dataCompletenessPct}% data`
                        : ""}
                    </p>
                    <dl className="mt-2 grid gap-1 text-sm text-foreground/80 sm:grid-cols-2">
                      <div>
                        <dt className="inline text-muted">Condition: </dt>
                        <dd className="inline capitalize">
                          {listing.condition.replace(/-/g, " ")}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline text-muted">Delivery: </dt>
                        <dd className="inline">{listing.deliveryLabel}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="inline text-muted">Protection: </dt>
                        <dd className="inline">
                          {listing.warrantyLabel} · {listing.returnPolicyLabel}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-44 sm:items-end">
                  <p className="text-2xl font-bold tabular-nums text-price">${total.toFixed(2)}</p>
                  <p className="text-xs text-muted sm:text-right">Total known cost</p>
                  {listing.url ? (
                    <a
                      href={`/go/${listing.id}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="btn-cta px-4 py-2.5 text-center text-sm"
                    >
                      View offer
                    </a>
                  ) : (
                    <span className="rounded-full border border-border px-4 py-2 text-center text-sm text-muted">
                      Link unavailable
                    </span>
                  )}
                  <Link
                    href={`/compare/${productId}/why/${listing.id}`}
                    className="text-center text-sm font-semibold text-link hover:underline sm:text-right"
                  >
                    Why this option
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
        Sponsored offers are shown separately and do not influence organic ranking.
      </p>
    </div>
  );
}
