import Link from "next/link";
import { ProductCardActions } from "@/components/ProductCardActions";
import { ProductImage } from "@/components/ProductImage";
import { RefreshPricesButton } from "@/components/RefreshPricesButton";
import { colorSwatchStyle } from "@/lib/color-swatches";
import {
  formatFreshness,
  getFreshnessWarningLevel,
  needsFreshnessWarning,
  freshnessWarningLabel,
} from "@/lib/freshness";
import { productImageAlt } from "@/lib/product-images";

function swatchCss(label: string): string {
  return colorSwatchStyle(label).background;
}

export type ProductCardBadge = "Popular" | "Best deal" | "Top product" | "Featured";

export type ProductCardListing = {
  listingId: string;
  sourceName: string;
  condition: string;
  price: number;
  shipping: number;
  fees: number;
};

export type ProductCardProps = {
  productId: string;
  href: string;
  imageSrc: string;
  brandName: string;
  productName: string;
  /** Short supporting line — omitted when empty. */
  subtitle?: string | null;
  badge?: ProductCardBadge | string | null;
  rating?: number | null;
  /** Real review count — only when provided by catalog. */
  ratingCount?: number | null;
  /** Spec rows for list view — real ProductAttribute values only. */
  specAttributes?: { key: string; value: string; unit: string | null }[];
  /** Color variants from catalog attributes — accessories/electronics. */
  colorSwatches?: string[];
  /** Category-intent badges (fitment, IPX, FDA, etc.) — real attributes only. */
  intentBadges?: string[];
  /** Honest availability signals from listings — never invent stock counts or ETAs. */
  availability?: {
    hasOffers: boolean;
    hasPickup?: boolean;
    hasFreeShipping?: boolean;
    deliveryLabel?: string | null;
  } | null;
  /** Lowest Total Known Cost — hidden when null. */
  fromPrice?: number | null;
  /** Prior price for strikethrough — only when real history / seeded demo exists. */
  previousPrice?: number | null;
  offerCount?: number | null;
  sourceCount?: number | null;
  freshnessMinutesAgo?: number | null;
  /** Category slug for subtype image fallbacks when imageSrc errors. */
  categorySlug?: string | null;
  bestListing?: ProductCardListing | null;
  isSaved?: boolean;
  signedIn?: boolean;
  redirectTo?: string;
  /** Extra match/status chips — never fabricated. */
  extraBadges?: string[];
  /**
   * When false, hide Save / Compare / Add to cart (demo browse cards).
   * Prices/ratings still render only if the caller passes real seeded values.
   */
  showCommerceActions?: boolean;
  /** Override primary CTA label (default “View offers”). */
  primaryCtaLabel?: string;
  /** Optional note under rating (e.g. “demo score”). */
  ratingNote?: string | null;
  /** Optional note after meta line (e.g. “browsing example”). */
  metaNote?: string | null;
  /** Idealo-style deal rationale — only when backed by real history / multi-offer data. */
  dealReason?: string | null;
  /** Horizontal list layout for search results density toggle. */
  compactList?: boolean;
};

function badgeToneClass(badge: string) {
  const key = badge.toLowerCase();
  if (key.includes("deal") || key.includes("save") || key.includes("%") || key === "demo") {
    return key === "demo" || key.includes("demo")
      ? "border border-border bg-white/95 text-navy-800"
      : "badge-savings";
  }
  if (key.includes("top")) return "badge-top";
  if (key.includes("popular")) return "badge-popular";
  return "badge-accent";
}

function shipFeesLine(listing: ProductCardListing): string | null {
  const shipFees = listing.shipping + listing.fees;
  if (shipFees <= 0.009) return null;
  return `$${listing.price.toFixed(2)} + $${shipFees.toFixed(2)} ship/fees`;
}

/**
 * Visual-first comparison-site product card.
 * Never invents price, offer, source, or rating values — omit when unavailable.
 */
export function ProductCard({
  productId,
  href,
  imageSrc,
  brandName,
  productName,
  subtitle,
  badge,
  rating,
  ratingCount,
  specAttributes = [],
  colorSwatches = [],
  intentBadges = [],
  availability = null,
  fromPrice,
  previousPrice,
  offerCount,
  sourceCount,
  freshnessMinutesAgo,
  categorySlug,
  bestListing,
  isSaved = false,
  signedIn = false,
  redirectTo,
  extraBadges = [],
  showCommerceActions = true,
  primaryCtaLabel = "View offers",
  ratingNote,
  metaNote,
  dealReason,
  compactList = false,
}: ProductCardProps) {
  const saveRedirect = redirectTo ?? href;
  const showOffers = offerCount != null && offerCount > 0;
  const showSources = sourceCount != null && sourceCount > 0;
  const showPrice = fromPrice != null;
  const showRating = rating != null;
  const hasFreshnessField = freshnessMinutesAgo !== undefined;
  const showFreshnessWarning = hasFreshnessField && needsFreshnessWarning(freshnessMinutesAgo);
  const subtitleText = subtitle?.trim() || null;
  const imageAlt = productImageAlt({
    title: `${brandName} ${productName}`,
    productName,
  });
  const commerce = showCommerceActions;
  const offerLabel = showOffers
    ? offerCount === 1
      ? "1 offer"
      : `${offerCount} offers`
    : null;
  const sourceLabel = showSources
    ? sourceCount === 1
      ? "1 source"
      : `${sourceCount} sources`
    : null;
  const breakdownLine = bestListing ? shipFeesLine(bestListing) : null;

  return (
    <article className={`product-card group ${compactList ? "product-card-list" : ""}`}>
      <div className="product-card-media-wrap">
        <Link
          href={href}
          className="product-card-media focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <ProductImage
            src={imageSrc}
            alt={imageAlt}
            category={categorySlug}
            title={productName}
            subtitle={subtitleText}
            size="card"
            className="transition duration-300 group-hover:scale-[1.04]"
            sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
          />
          {badge ? (
            <span
              className={`product-card-badge absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-bold leading-tight shadow-sm ${badgeToneClass(badge)}`}
            >
              {badge}
            </span>
          ) : null}
        </Link>
      </div>

      <div className="product-card-body">
        <div className="min-w-0 space-y-1">
          <p className="product-card-brand">{brandName}</p>
          <Link href={href} className="product-card-title line-clamp-2 hover:text-link">
            {productName}
          </Link>
          {subtitleText ? (
            <p className="line-clamp-1 text-xs leading-relaxed text-muted">{subtitleText}</p>
          ) : null}
        </div>

        {extraBadges.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {extraBadges.slice(0, 2).map((label) => (
              <span key={label} className="product-card-chip">
                {label}
              </span>
            ))}
          </div>
        ) : null}

        {showRating ? (
          <p className="product-card-rating">
            <span className="product-card-rating-stars" aria-hidden="true">
              ★
            </span>
            <span>{rating.toFixed(1)}</span>
            {ratingCount != null && ratingCount > 0 ? (
              <span className="font-medium text-muted"> ({ratingCount})</span>
            ) : null}
            {ratingNote ? (
              <span className="font-medium text-muted"> {ratingNote}</span>
            ) : null}
          </p>
        ) : null}

        {intentBadges.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {intentBadges.map((label) => (
              <span key={label} className="product-card-intent-badge">
                {label}
              </span>
            ))}
          </div>
        ) : null}

        {colorSwatches.length > 0 ? (
          <ul className="product-card-swatches" aria-label="Available colors">
            {colorSwatches.slice(0, 5).map((c) => (
              <li key={c} title={c}>
                <span
                  className="product-card-swatch"
                  style={
                    // lazy import avoided — inline known swatches via CSS var fallback
                    { background: swatchCss(c) }
                  }
                />
              </li>
            ))}
          </ul>
        ) : null}

        {availability ? (
          <ul className="product-card-status" aria-label="Availability">
            {availability.hasOffers ? (
              <li className="product-card-status-ok">Offers available</li>
            ) : (
              <li className="product-card-status-warn">No live offers</li>
            )}
            {availability.hasFreeShipping ? (
              <li className="product-card-status-ok">Free shipping</li>
            ) : null}
            {availability.hasPickup ? (
              <li className="product-card-status-ok">Pickup available</li>
            ) : null}
            {availability.deliveryLabel?.trim() ? (
              <li className="product-card-status-info">{availability.deliveryLabel.trim()}</li>
            ) : null}
          </ul>
        ) : null}

        {compactList && specAttributes.length > 0 ? (
          <ul className="product-card-specs">
            {specAttributes.slice(0, 5).map((a) => (
              <li key={`${a.key}-${a.value}`}>
                <span className="product-card-spec-key">{a.key}</span>
                <span>
                  {a.value}
                  {a.unit ? ` ${a.unit}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {showPrice ? (
          <div className="product-card-price-block">
            <div className="product-card-price-row">
              <div className="product-card-price">
                <span className="product-card-price-eyebrow">From</span>
                <span className="product-card-price-value">${fromPrice.toFixed(2)}</span>
              </div>
              {previousPrice != null ? (
                <p className="product-card-price-was">${previousPrice.toFixed(2)}</p>
              ) : null}
            </div>
            <p className="product-card-price-caption">Total Known Cost</p>
            <p className="product-card-tkc-badge" title="Item + shipping + mandatory fees from approved sources">
              Includes ship + fees
              <span className="product-card-tkc-info" aria-hidden="true">
                ⓘ
              </span>
            </p>
            {breakdownLine ? (
              <p className="product-card-tkc-breakdown">{breakdownLine}</p>
            ) : null}
          </div>
        ) : null}

        {(offerLabel ||
          sourceLabel ||
          hasFreshnessField ||
          metaNote?.trim() ||
          dealReason?.trim() ||
          offerCount === 0) ? (
          <div className="product-card-meta">
            {offerLabel ? (
              <p className="product-card-meta-line whitespace-nowrap">{offerLabel}</p>
            ) : null}
            {sourceLabel ? (
              <p className="product-card-meta-line whitespace-nowrap">{sourceLabel}</p>
            ) : null}
            {hasFreshnessField ? (
              <p className="product-card-meta-line">
                <span className="product-card-meta-label">Last checked</span>
                {formatFreshness(freshnessMinutesAgo)}
              </p>
            ) : null}
            {metaNote?.trim() ? (
              <p className="product-card-meta-line">{metaNote.trim()}</p>
            ) : null}
            {dealReason?.trim() ? (
              <p className="product-card-deal-reason text-xs font-semibold leading-snug text-navy-800">
                {dealReason.trim()}
              </p>
            ) : null}
            {offerCount === 0 ? (
              <p className="text-xs font-medium text-navy-800">No offers</p>
            ) : null}
            {showFreshnessWarning ? (
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-amber-800">
                {freshnessWarningLabel(freshnessMinutesAgo)}
                {commerce ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <RefreshPricesButton
                      productId={productId}
                      compact
                      emphasize={getFreshnessWarningLevel(freshnessMinutesAgo) === "outdated"}
                    />
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        ) : null}

        {commerce ? (
          <ProductCardActions
            productId={productId}
            productName={productName}
            brandName={brandName}
            imageSrc={imageSrc}
            href={href}
            bestListing={bestListing}
            primaryCtaLabel={primaryCtaLabel}
            isSaved={isSaved}
            signedIn={signedIn}
            redirectTo={saveRedirect}
          />
        ) : (
          <div className="product-card-actions">
            <Link
              href={href}
              className="product-card-action-wide btn-cta flex min-h-10 items-center justify-center px-3 py-2.5 text-center text-sm font-semibold"
            >
              {primaryCtaLabel}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
