import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { ProductImage } from "@/components/ProductImage";
import { formatConditionLabel } from "@/lib/compare-view";
import { formatFreshness, isFreshnessStale } from "@/lib/freshness";
import { productImageAlt } from "@/lib/product-images";
import { saveProductAction, unsaveProductAction } from "@/lib/saved-actions";

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
};

function badgeToneClass(badge: string) {
  const key = badge.toLowerCase();
  if (key.includes("deal") || key.includes("save") || key.includes("%") || key === "demo") {
    return key === "demo" || key.includes("demo")
      ? "border border-border bg-white/95 text-navy-800"
      : "badge-savings";
  }
  return "badge-accent";
}

/**
 * Professional comparison-site product card.
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
}: ProductCardProps) {
  const saveRedirect = redirectTo ?? href;
  const showOffers = offerCount != null && offerCount > 0;
  const showSources = sourceCount != null && sourceCount > 0;
  const showPrice = fromPrice != null;
  const showRating = rating != null;
  /** Caller omitted the prop → hide; null → show “Freshness unknown”. */
  const hasFreshnessField = freshnessMinutesAgo !== undefined;
  const stale = hasFreshnessField && isFreshnessStale(freshnessMinutesAgo);
  const subtitleText = subtitle?.trim() || null;
  const imageAlt = productImageAlt({
    title: `${brandName} ${productName}`,
    productName,
  });

  const metaParts: string[] = [];
  if (showOffers) {
    metaParts.push(offerCount === 1 ? "1 offer" : `${offerCount} offers`);
  }
  if (showSources) {
    metaParts.push(sourceCount === 1 ? "1 source" : `${sourceCount} sources`);
  }
  if (hasFreshnessField) {
    metaParts.push(formatFreshness(freshnessMinutesAgo));
  }
  if (metaNote?.trim()) {
    metaParts.push(metaNote.trim());
  }

  const commerce = showCommerceActions;

  return (
    <article className="product-card group">
      <Link
        href={href}
        className="relative mx-3 mt-3 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative">
          <ProductImage
            src={imageSrc}
            alt={imageAlt}
            category={categorySlug}
            title={productName}
            subtitle={subtitleText}
            size="card"
            className="transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
          />
          {badge ? (
            <span
              className={`absolute left-2 top-2 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-bold leading-tight ${badgeToneClass(badge)}`}
            >
              {badge}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="product-card-body">
        {extraBadges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {extraBadges.slice(0, 3).map((label) => (
              <span
                key={label}
                className="inline-flex rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-semibold text-navy-800"
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {brandName}
          </p>
          <Link
            href={href}
            className="line-clamp-2 text-sm font-bold leading-snug text-navy-900 hover:text-link"
          >
            {productName}
          </Link>
          {subtitleText ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted">{subtitleText}</p>
          ) : null}
        </div>

        {showRating ? (
          <p className="text-xs font-semibold text-navy-900">
            <span aria-hidden="true">★ </span>
            {rating.toFixed(1)}
            {ratingNote ? (
              <span className="font-medium text-muted"> {ratingNote}</span>
            ) : null}
          </p>
        ) : null}

        {showPrice ? (
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-lg price-text">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
                {commerce ? "From · TKC " : "From "}
              </span>
              ${fromPrice.toFixed(2)}
            </p>
            {previousPrice != null ? (
              <p className="text-xs tabular-nums text-muted line-through">
                ${previousPrice.toFixed(2)}
              </p>
            ) : null}
          </div>
        ) : null}

        {metaParts.length > 0 ? (
          <p className="text-xs leading-relaxed text-muted">{metaParts.join(" · ")}</p>
        ) : null}
        {stale ? (
          <p className="text-xs font-medium text-amber-800">Data may be outdated</p>
        ) : null}
        {offerCount === 0 ? (
          <p className="text-xs font-medium text-navy-800">No offers</p>
        ) : null}

        <div className="product-card-actions">
          {commerce ? (
            <>
              {signedIn ? (
                <form
                  action={
                    isSaved
                      ? unsaveProductAction.bind(null, productId, saveRedirect)
                      : saveProductAction.bind(null, productId, saveRedirect)
                  }
                >
                  <button
                    type="submit"
                    className={`flex min-h-9 w-full items-center justify-center rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      isSaved
                        ? "border-border bg-surface text-navy-800"
                        : "border-border bg-white text-navy-900 hover:border-navy-800"
                    }`}
                  >
                    {isSaved ? "Saved ✓" : "Save"}
                  </button>
                </form>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(saveRedirect)}`}
                  className="flex min-h-9 w-full items-center justify-center rounded-full border border-border bg-white px-3 py-2 text-sm font-semibold text-navy-900 hover:border-navy-800"
                >
                  Save
                </Link>
              )}

              <AddToCompareButton productId={productId} productName={productName} labeled />

              {bestListing ? (
                <div className="product-card-action-wide">
                  <AddToCartButton
                    listingId={bestListing.listingId}
                    productId={productId}
                    title={productName}
                    brand={brandName}
                    imageUrl={imageSrc}
                    retailerName={bestListing.sourceName}
                    condition={formatConditionLabel(bestListing.condition)}
                    itemPrice={bestListing.price}
                    shipping={bestListing.shipping}
                    fees={bestListing.fees}
                    totalKnownCost={
                      bestListing.price + bestListing.shipping + bestListing.fees
                    }
                    label="Add to cart"
                  />
                </div>
              ) : null}
            </>
          ) : null}

          <Link
            href={href}
            className="product-card-action-wide btn-cta flex min-h-9 items-center justify-center px-3 py-2 text-center text-sm"
          >
            {primaryCtaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
