"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BottomSheet } from "@/components/BottomSheet";
import {
  formatConditionLabel,
  isStaleFreshness,
  NO_RECOMMENDATION_TEXT,
  totalKnownCost,
  type CompareRow,
  type RecommendationPanelModel,
} from "@/lib/compare-view";
import { CostBreakdown } from "@/components/CostBreakdown";
import { Freshness } from "@/components/Freshness";
import { ProtectionDetails } from "@/components/ProtectionDetails";
import { BRAND_FALLBACK_IMAGE, sourceImageFor } from "@/lib/images";
import type { Priority } from "@/lib/types";
import { RefreshPricesButton } from "@/components/RefreshPricesButton";
import { StatusBanner, StatusPanel, PrimaryAction, SecondaryAction } from "@/components/StatusPanel";
import { formatFreshness } from "@/lib/freshness";

/** Single pill style shared by every card badge — only the tone color varies. */
function Badge({
  tone,
  children,
}: {
  tone: "top" | "authorized" | "neutral" | "fresh" | "stale";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "top"
      ? "bg-cta/30 text-navy-900"
      : tone === "authorized"
        ? "bg-navy-100 text-navy-900"
          : tone === "fresh"
          ? "badge-savings"
          : tone === "stale"
            ? "bg-amber-100 text-amber-900"
            : "bg-surface text-muted";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

/** Fixed-width label column so values line up at the same position on every card. */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="w-24 shrink-0 text-xs font-medium text-muted sm:w-28">{label}</span>
      <span className="min-w-0 flex-1 text-foreground/85">{children}</span>
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
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-800">
            Why recommended
          </p>
          <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">{model.label}</h3>
          <p className="mt-1 text-sm font-medium text-foreground">{model.retailerName}</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {model.rationale}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted">Total known cost</p>
          <p className="text-xl price-text">
            ${model.totalKnownCost.toFixed(2)}
          </p>
          <div className="mt-1">
            <Freshness minutesAgo={model.lastCheckedMinutesAgo} />
          </div>
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
          <p className="text-xs font-bold uppercase tracking-wide text-navy-900">Trade-off</p>
          <p className="mt-2 text-sm text-foreground/85">
            {model.tradeOffLine ?? "No material trade-off versus the cheapest compared offer."}
          </p>
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
  productName,
  brandName,
  productImageSrc,
  row,
  isTop,
  recommendationLabel,
}: {
  productId: string;
  productName: string;
  brandName: string;
  productImageSrc: string;
  row: CompareRow;
  isTop: boolean;
  recommendationLabel: string;
}) {
  const { listing, recommendation } = row;
  const total = totalKnownCost(listing);
  const logoSrc = listing.hasDistinctSeller
    ? BRAND_FALLBACK_IMAGE
    : sourceImageFor(listing.sourceId);
  const fulfillment = listing.pickupAvailable
    ? listing.deliveryLabel !== "Delivery estimate unavailable"
      ? listing.deliveryLabel
      : "Pickup available"
    : listing.deliveryLabel;

  return (
    <li
      className={`offer-card rounded-2xl border bg-panel p-4 transition shadow-[var(--shadow-panel)] ${
        isTop ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40"
      }`}
    >
      {/* Retailer or source, plus recommendation badge(s) */}
      <div className="flex min-w-0 items-start gap-3">
        <Image
          src={logoSrc}
          alt={`${listing.sourceName} logo`}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-xl border border-border bg-white object-contain p-1"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="truncate text-base font-semibold text-navy-900"
              title={listing.sourceName}
            >
              {listing.sourceName}
            </h3>
            {isTop ? (
              <Badge tone="top">{recommendationLabel}</Badge>
            ) : (
              <Badge tone="neutral">{recommendation.label}</Badge>
            )}
            {listing.isAuthorizedSource ? <Badge tone="authorized">Approved source</Badge> : null}
            {isStaleFreshness(listing.freshnessMinutesAgo) ? (
              <Badge tone="stale">Data may be outdated</Badge>
            ) : (
              <Badge tone="fresh">Updated recently</Badge>
            )}
          </div>
          {listing.sourceTypeLabel ? (
            <>
              {/* Desktop/tablet: always visible, unchanged. */}
              <p className="mt-0.5 hidden text-[11px] uppercase tracking-wide text-muted sm:block">
                {listing.sourceTypeLabel}
              </p>
              {/* Mobile: collapsed by default to keep the card compact. */}
              <details className="mt-0.5 sm:hidden">
                <summary className="cursor-pointer text-[11px] font-medium text-muted">
                  Source details
                </summary>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">
                  {listing.sourceTypeLabel}
                </p>
              </details>
            </>
          ) : null}
        </div>
      </div>

      {/* Condition · Total known cost · Delivery/pickup · Protection · Freshness, one order on every card */}
      <div className="mt-3 space-y-2">
        <FieldRow label="Condition">{formatConditionLabel(listing.condition)}</FieldRow>
        <CostBreakdown
          itemPrice={listing.price}
          shipping={listing.shipping}
          mandatoryFees={listing.mandatoryFees}
          verifiedDiscount={listing.verifiedDiscount}
          totalKnownCost={total}
        />
        <FieldRow label="Delivery / pickup">{fulfillment}</FieldRow>
        <FieldRow label="Protection">
          <ProtectionDetails details={listing.protectionDetails} />
        </FieldRow>
        <FieldRow label="Freshness">
          <Freshness minutesAgo={listing.freshnessMinutesAgo} />
        </FieldRow>
      </div>

      {/* Why this option · View offer (hidden without a valid retailer URL) */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href={`/compare/${productId}/why/${listing.id}`}
          className="flex min-h-11 items-center text-sm font-semibold text-link hover:underline"
        >
          Why this option
        </Link>
        {listing.url ? (
          <a
            href={`/go/${listing.id}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-cta min-h-11 px-4 py-2 text-center text-sm"
          >
            View retailer offer
          </a>
        ) : null}
        <AddToCartButton
          label="Add this offer to cart"
          listingId={listing.id}
          productId={productId}
          title={productName}
          brand={brandName}
          imageUrl={productImageSrc}
          retailerName={listing.sourceName}
          condition={formatConditionLabel(listing.condition)}
          itemPrice={listing.price}
          shipping={listing.shipping}
          fees={listing.mandatoryFees}
          totalKnownCost={total}
        />
      </div>
    </li>
  );
}

export function PriorityTabs({
  productId,
  productName,
  brandName,
  productImageSrc,
  rows,
  priority,
  priorityOptions,
  panel,
}: {
  productId: string;
  productName: string;
  brandName: string;
  productImageSrc: string;
  /** Already ranked server-side for `priority` — this component never re-sorts. */
  rows: CompareRow[];
  priority: Priority;
  /** Tabs to render — server-filtered (e.g. Best protection dropped when no listing has structured data), with a navigable href per option. */
  priorityOptions: { key: Priority; label: string; href: string }[];
  /** Precomputed server-side from the same sorted `rows`; null means nothing to rank or a genuine tie for first. */
  panel: RecommendationPanelModel | null;
}) {
  // No badge/highlight at all when there's no reliable recommendation (tie,
  // or nothing to rank) — an arbitrary sort-order pick must never look like
  // a confident claim.
  const topId = panel ? rows[0]?.listing.id : undefined;
  const recommendationLabel = panel?.label ?? "";
  const anyStale = rows.some((r) => isStaleFreshness(r.listing.freshnessMinutesAgo));
  const oldestMinutes = Math.max(0, ...rows.map((r) => r.listing.freshnessMinutesAgo ?? 0));
  const sourceCount = new Set(rows.map((r) => r.listing.sourceId)).size;

  if (rows.length === 0) {
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
      {/* Recommendation summary */}
      {anyStale ? (
        <StatusBanner
          tone="info"
          title={`Prices last checked: ${formatFreshness(oldestMinutes).replace(/^Updated /i, "")}`}
          description="Totals still reflect the last sync. Refresh for the latest item, shipping, and fee figures before you buy."
          action={<RefreshPricesButton productId={productId} />}
        />
      ) : null}

      {panel ? (
        <div className={anyStale ? "mt-4" : ""}>
          <RecommendationPanel model={panel} productId={productId} />
        </div>
      ) : (
        <div className={anyStale ? "mt-4" : ""}>
          <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
            {NO_RECOMMENDATION_TEXT}
          </p>
        </div>
      )}

      {/* Priority controls — segment bar on desktop, bottom sheet on mobile.
          Every option is a link to a pre-ranked URL; choosing one never
          re-sorts in the browser, it navigates and the server returns the
          new order. */}
      <div className="mt-4 border-y border-border py-3">
        <span className="hidden text-sm font-semibold text-foreground sm:mr-3 sm:inline">
          Sort by
        </span>
        <div className="sm:hidden">
          <BottomSheet
            title="Sort by"
            description="Choose how offers are ranked. Press Escape to close."
            label={
              <span>
                Sort by
                <span aria-hidden> · {priorityOptions.find((o) => o.key === priority)?.label}</span>
              </span>
            }
          >
            <ul className="space-y-1">
              {priorityOptions.map((option) => (
                <li key={option.key}>
                  <Link
                    href={option.href}
                    aria-current={priority === option.key ? "true" : undefined}
                    className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      priority === option.key
                        ? "bg-cta text-white"
                        : "text-navy-900 hover:bg-surface"
                    }`}
                  >
                    {option.label}
                  </Link>
                </li>
              ))}
            </ul>
          </BottomSheet>
        </div>
        <div
          role="tablist"
          aria-label="Sort priority"
          className="mt-2 hidden rounded-full border border-border bg-surface p-1 sm:inline-flex sm:flex-wrap"
        >
          {priorityOptions.map((option) => (
            <Link
              key={option.key}
              href={option.href}
              role="tab"
              aria-selected={priority === option.key}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                priority === option.key
                  ? "bg-cta text-white shadow-sm"
                  : "text-muted hover:bg-panel hover:text-foreground"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Offer cards */}
      <p className="mt-4 text-sm text-muted">
        {rows.length} {rows.length === 1 ? "offer" : "offers"} from {sourceCount}{" "}
        {sourceCount === 1 ? "source" : "sources"}
      </p>

      <ul className="mt-3 space-y-3 pb-24 lg:pb-0">
        {rows.map((row) => (
          <OfferCard
            key={row.listing.id}
            productId={productId}
            productName={productName}
            brandName={brandName}
            productImageSrc={productImageSrc}
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
