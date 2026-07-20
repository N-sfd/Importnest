import { ProductCard } from "@/components/ProductCard";
import {
  homepageDemoBrowseHref,
  homepageDemoCategoryLabel,
  type HomepageDemoDeal,
} from "@/data/homepage-demo-products";
import type { BestDealItem } from "@/lib/best-deals";

/** Listing-backed Best Deal — discount badge only when PriceHistory supports it. */
export function DealProductCard({
  item,
  imageSrc,
  signedIn,
}: {
  item: BestDealItem;
  imageSrc: string;
  signedIn: boolean;
}) {
  const category = homepageDemoCategoryLabel(item.categorySlug);
  const badge =
    item.discountPercent != null ? `Save ${item.discountPercent}%` : "Best deal";

  return (
    <ProductCard
      productId={item.productId}
      href={`/compare/${item.productId}`}
      imageSrc={imageSrc}
      brandName={item.brandName}
      productName={item.productName}
      subtitle={category}
      badge={badge}
      rating={item.rating}
      fromPrice={item.currentTotal}
      previousPrice={item.previousTotal}
      offerCount={item.offerCount}
      sourceCount={item.sourceCount}
      freshnessMinutesAgo={item.freshnessMinutesAgo}
      bestListing={item.bestListing}
      isSaved={item.isSaved}
      signedIn={signedIn}
      redirectTo="/"
    />
  );
}

/**
 * Demo browse deal — seeded discount visuals only.
 * No Save / Compare / Cart. Prices are demo totals.
 */
export function DemoDealCard({ item }: { item: HomepageDemoDeal }) {
  const href = homepageDemoBrowseHref(item.categorySlug, item.productName);
  const category = homepageDemoCategoryLabel(item.categorySlug);
  const badge =
    item.discountPercent != null
      ? `Save ${item.discountPercent}%`
      : "Best deal";

  return (
    <ProductCard
      productId={item.id}
      href={href}
      imageSrc={item.imageSrc}
      brandName={item.brandName}
      productName={item.productName}
      subtitle={category}
      badge={badge}
      extraBadges={["Demo browse"]}
      rating={null}
      fromPrice={item.currentPrice}
      previousPrice={item.previousPrice}
      offerCount={item.offerCount}
      bestListing={null}
      showCommerceActions={false}
      primaryCtaLabel="Browse category"
      metaNote="browsing example"
    />
  );
}
