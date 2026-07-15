"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  buildRecommendationPanel,
  formatConditionLabel,
  formatFreshness,
  isStaleFreshness,
  PRIORITY_LABELS,
  sortCompareRows,
  totalKnownCost,
  type CompareRow,
  type RecommendationPanelModel,
} from "@/lib/compare-view";
import { sourceImageFor } from "@/lib/images";
import type { Priority } from "@/lib/types";
import { StatusBanner, StatusPanel, PrimaryAction, SecondaryAction } from "@/components/StatusPanel";

const PRIORITIES: Priority[] = [
  "best-overall",
  "lowest-cost",
  "fastest-delivery",
  "best-condition",
  "best-protection",
];

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="inline text-muted">{label}: </dt>
      <dd className="inline capitalize">{value}</dd>
    </div>
  );
}

function RecommendationPanel({
  model,
  productId,
}: {
  model: RecommendationPanelModel;
  productId: string;
}) {
  return (
    <div className="rounded-2xl border border-cta/40 bg-cta/10 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-800">Recommended</p>
          <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">{model.label}</h3>
          <p className="mt-1 text-sm font-medium text-foreground">{model.retailerName}</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {model.rationale}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted">Total known cost</p>
          <p className="text-xl font-bold tabular-nums text-price">
            ${model.totalKnownCost.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {formatFreshness(model.lastCheckedMinutesAgo)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-border/80 pt-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-navy-900">Positive factors</p>
          {model.positiveFactors.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
              {model.positiveFactors.map((f) => (
                <li key={f.label}>
                  <span className="font-medium text-foreground">{f.label}</span>
                  <span className="block text-xs text-muted">{f.detail}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No positive ranking factors for this priority.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-navy-900">Trade-offs</p>
          {model.tradeOffs.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
              {model.tradeOffs.map((f) => (
                <li key={f.label}>
                  <span className="font-medium text-foreground">{f.label}</span>
                  <span className="block text-xs text-muted">{f.detail}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No material trade-offs versus compared offers.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-navy-900">
            Missing information
          </p>
          {model.missingInformation.length > 0 ? (
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
              {model.missingInformation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No notable data gaps on this offer.</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-3">
        <p className="max-w-2xl text-xs text-muted">
          Affiliate disclosure: Importnest may earn a commission when you buy through retailer
          links. This does not change ranking or which offer is recommended.
        </p>
        <Link
          href={`/compare/${productId}/why/${model.listingId}`}
          className="text-sm font-semibold text-link hover:underline"
        >
          Full explanation
        </Link>
      </div>
    </div>
  );
}

function OfferCard({
  productId,
  row,
  isTop,
  recommendationLabel,
}: {
  productId: string;
  row: CompareRow;
  isTop: boolean;
  recommendationLabel: string;
}) {
  const { listing, recommendation } = row;
  const total = totalKnownCost(listing);
  const logoSrc = listing.hasDistinctSeller
    ? "/brand/logo-mark.png"
    : sourceImageFor(listing.sourceId);
  const fulfillment = listing.pickupAvailable
    ? listing.deliveryLabel !== "Delivery estimate unavailable"
      ? listing.deliveryLabel
      : "Pickup available"
    : listing.deliveryLabel;
  const stale = isStaleFreshness(listing.freshnessMinutesAgo);

  return (
    <li
      className={`offer-card rounded-2xl border bg-panel p-4 shadow-[var(--shadow-panel)] ${
        isTop ? "border-cta ring-2 ring-cta/25" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <Image
            src={logoSrc}
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
              {isTop ? (
                <span className="rounded-full bg-cta/30 px-2.5 py-0.5 text-xs font-bold text-navy-900">
                  {recommendationLabel}
                </span>
              ) : (
                <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">
                  {recommendation.label}
                </span>
              )}
              {listing.isAuthorizedSource ? (
                <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-900">
                  Approved source
                </span>
              ) : null}
              {stale ? (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-950">
                  Data may be stale
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {listing.sourceTypeLabel ? `${listing.sourceTypeLabel} · ` : ""}
              {formatFreshness(listing.freshnessMinutesAgo)}
            </p>
            <dl className="mt-2 grid gap-1 text-sm text-foreground/80 sm:grid-cols-2">
              <MetaCell label="Condition" value={formatConditionLabel(listing.condition)} />
              <MetaCell label="Availability" value={listing.availabilityLabel} />
              <MetaCell label="Delivery / pickup" value={fulfillment} />
              <MetaCell
                label="Item price"
                value={`$${listing.price.toFixed(2)}${
                  listing.shipping === 0 ? " · Free shipping" : ` · +$${listing.shipping.toFixed(2)} ship`
                }`}
              />
              <MetaCell label="Warranty" value={listing.warrantyLabel} />
              <MetaCell label="Returns" value={listing.returnPolicyLabel} />
            </dl>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium text-muted">Total known cost</p>
            <p className="text-xl font-bold tabular-nums text-price">${total.toFixed(2)}</p>
          </div>
          <Link
            href={`/compare/${productId}/why/${listing.id}`}
            className="text-sm font-semibold text-link hover:underline"
          >
            Why this option
          </Link>
          {listing.url ? (
            <a
              href={`/go/${listing.id}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-cta px-4 py-2.5 text-center text-sm sm:min-w-[8.5rem]"
            >
              View offer
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

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
  const recommendationLabel = PRIORITY_LABELS[priority];
  const panel = buildRecommendationPanel(sorted, priority);
  const anyStale = sorted.some((r) => isStaleFreshness(r.listing.freshnessMinutesAgo));
  const sourceCount = new Set(sorted.map((r) => r.listing.sourceId)).size;

  if (sorted.length === 0) {
    return (
      <StatusPanel
        tone="warn"
        title="Source temporarily unavailable"
        description="No approved buying options are available for this product right now. Retailer feeds may be refreshing — try again shortly."
        actions={
          <>
            <PrimaryAction href={`/compare/${productId}`}>Refresh comparison</PrimaryAction>
            <SecondaryAction href="/search">Search again</SecondaryAction>
          </>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <span className="mr-1 text-sm font-semibold text-foreground">Sort by</span>
        {PRIORITIES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setPriority(key)}
            aria-pressed={priority === key}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              priority === key
                ? "bg-navy-900 text-white shadow-sm"
                : "border border-border bg-surface text-muted hover:border-navy-800 hover:text-foreground"
            }`}
          >
            {PRIORITY_LABELS[key]}
          </button>
        ))}
      </div>

      {anyStale ? (
        <div className="mt-4">
          <StatusBanner
            tone="warn"
            title="Some prices look stale"
            description="At least one offer has not refreshed within the last hour. Treat those totals as possibly outdated."
          />
        </div>
      ) : null}

      {panel ? (
        <div className="mt-4">
          <RecommendationPanel model={panel} productId={productId} />
        </div>
      ) : null}

      <p className="mt-4 text-sm text-muted">
        {sorted.length} {sorted.length === 1 ? "offer" : "offers"} from {sourceCount}{" "}
        {sourceCount === 1 ? "source" : "sources"}
      </p>

      <ul className="mt-3 space-y-3 pb-24 lg:pb-0">
        {sorted.map((row) => (
          <OfferCard
            key={row.listing.id}
            productId={productId}
            row={row}
            isTop={row.listing.id === topId}
            recommendationLabel={recommendationLabel}
          />
        ))}
      </ul>

      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
        Sponsored offers are shown separately and do not influence organic ranking. Checkout happens
        on the retailer&apos;s site.
      </p>
    </div>
  );
}
