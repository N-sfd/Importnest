import Link from "next/link";
import { ProductCardActions } from "@/components/ProductCardActions";
import { ProductCardSaveButton } from "@/components/ProductCardSaveButton";
import { ProductImage } from "@/components/ProductImage";
import { formatFreshness, needsFreshnessWarning, freshnessWarningLabel } from "@/lib/freshness";
import { productImageAlt } from "@/lib/product-images";

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
  /**
   * When provided with signedIn, shows a compact Set price alert control.
   * suggestedAlert is a prefilled target from real current TKC.
   */
  priceAlert?: {
    suggestedAlert: string;
    currentLowestPrice: number | null;
    alert?: { threshold: string | null; isActive: boolean } | null;
  } | null;
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
  priceAlert,
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
    <article className="product-card group">
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
        {commerce ? (
          <ProductCardSaveButton
            productId={productId}
            isSaved={isSaved}
            signedIn={signedIn}
            redirectTo={saveRedirect}
          />
        ) : null}
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
            {ratingNote ? (
              <span className="font-medium text-muted"> {ratingNote}</span>
            ) : null}
          </p>
        ) : null}

        {showPrice ? (
          <div className="product-card-price-block">
            <div className="product-card-price-row">
              <p className="product-card-price">
                <span className="product-card-price-label">From · Total Known Cost</span>
                <span className="product-card-price-value">${fromPrice.toFixed(2)}</span>
              </p>
              {previousPrice != null ? (
                <p className="product-card-price-was">${previousPrice.toFixed(2)}</p>
              ) : null}
            </div>
            <p className="product-card-tkc-badge" title="Item + shipping + mandatory fees from approved sources">
              Includes ship + fees
              <span className="product-card-tkc-info" aria-hidden="true">
                ⓘ
              </span>
            </p>
            {breakdownLine ? (
              <p className="product-card-tkc-breakdown">{breakdownLine}</p>
            ) : null}
            {previousPrice != null && fromPrice != null && previousPrice > fromPrice + 0.009 ? (
              <p className="product-card-tkc-callout">
                Lower Total Known Cost than recent tracked price (${previousPrice.toFixed(2)}).
              </p>
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
            {offerLabel ? <p className="product-card-meta-line">{offerLabel}</p> : null}
            {sourceLabel ? <p className="product-card-meta-line">{sourceLabel}</p> : null}
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
              <div className="product-card-deal-reason">
                <p className="text-[10px] font-bold uppercase tracking-wide text-navy-800">
                  Why this deal?
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted">{dealReason.trim()}</p>
              </div>
            ) : null}
            {offerCount === 0 ? (
              <p className="text-xs font-medium text-navy-800">No offers</p>
            ) : null}
            {showFreshnessWarning ? (
              <p className="text-xs font-medium text-amber-800">{freshnessWarningLabel()}</p>
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
            signedIn={signedIn}
            redirectTo={saveRedirect}
            freshnessMinutesAgo={freshnessMinutesAgo}
            priceAlert={priceAlert}
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
