import { ProductCard, type ProductCardBadge } from "@/components/ProductCard";
import {
  homepageDemoBrowseHref,
  homepageDemoCategoryLabel,
  type HomepageDemoTopProduct,
} from "@/data/homepage-demo-products";
import type { PopularComparison } from "@/lib/popular-comparisons";

function topBadge(item: PopularComparison, indexHint?: number): ProductCardBadge {
  if (indexHint === 0) return "Top product";
  if (item.rating != null && item.rating >= 4.6) return "Featured";
  if (item.offerCount >= 3) return "Popular";
  return "Top product";
}

/** Listing-backed Top Product — full comparison card fields from real data only. */
export function TopProductCard({
  item,
  imageSrc,
  signedIn,
  index = 1,
}: {
  item: PopularComparison;
  imageSrc: string;
  signedIn: boolean;
  index?: number;
}) {
  const category = homepageDemoCategoryLabel(item.categorySlug);

  return (
    <ProductCard
      productId={item.productId}
      href={`/compare/${item.productId}`}
      imageSrc={imageSrc}
      brandName={item.brandName}
      productName={item.productName}
      subtitle={category}
      badge={topBadge(item, index)}
      rating={item.rating}
      fromPrice={item.lowestTotalCost}
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
 * Demo browse card — seeded visuals/prices only.
 * No Save / Compare / Cart (no listing). Labeled as demo.
 */
export function DemoTopProductCard({ item }: { item: HomepageDemoTopProduct }) {
  const href = homepageDemoBrowseHref(item.categorySlug, item.productName);
  const category = homepageDemoCategoryLabel(item.categorySlug);

  return (
    <ProductCard
      productId={item.id}
      href={href}
      imageSrc={item.imageSrc}
      brandName={item.brandName}
      productName={item.productName}
      subtitle={category}
      badge="Featured"
      extraBadges={["Demo browse"]}
      rating={item.rating}
      ratingNote={item.rating != null ? "(demo score)" : null}
      fromPrice={item.fromPrice}
      offerCount={item.offerCount}
      bestListing={null}
      showCommerceActions={false}
      primaryCtaLabel="Browse category"
      metaNote="browsing example"
    />
  );
}
