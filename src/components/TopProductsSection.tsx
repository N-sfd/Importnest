import Image from "next/image";
import Link from "next/link";
import type { PopularComparison } from "@/lib/popular-comparisons";
import { productThumbClass } from "@/lib/images";

export type TopProductBadge = "Bestseller" | "Popular" | "Top rated";

export type TopProductCard = PopularComparison & {
  badge: TopProductBadge;
  supportingLine: string;
};

function badgeClass(badge: TopProductBadge) {
  if (badge === "Bestseller") return "bg-cta text-white";
  if (badge === "Top rated") return "bg-navy-900 text-white";
  return "bg-accent/15 text-accent";
}

/** Dense product cards for homepage “Top Products” — real totals only. */
export function TopProductsSection({ items }: { items: TopProductCard[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="top-products-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="top-products-heading"
            className="text-xl font-bold tracking-tight text-navy-900"
          >
            Top Products
          </h2>
          <p className="mt-1 text-sm text-muted">
            Most compared items from approved retailers — prices are Total Known Cost.
          </p>
        </div>
        <Link href="/search" className="text-sm font-semibold text-link hover:underline">
          Browse all
        </Link>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((item) => (
          <li key={item.productId}>
            <Link
              href={`/compare/${item.productId}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-panel shadow-[var(--shadow-panel)] transition hover:-translate-y-0.5 hover:border-accent/40"
            >
              <div className="relative aspect-square bg-white">
                <Image
                  src={item.imageSrc}
                  alt={item.productName}
                  fill
                  className={productThumbClass(item.imageSrc)}
                  sizes="(max-width:640px) 50vw, 16vw"
                />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass(item.badge)}`}
                >
                  {item.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-navy-900 group-hover:text-link">
                  {item.productName}
                </p>
                <p className="line-clamp-2 text-xs text-muted">{item.supportingLine}</p>
                {item.rating != null ? (
                  <p className="text-xs font-semibold text-navy-900">
                    Score {item.rating.toFixed(1)}
                  </p>
                ) : (
                  <p className="text-xs text-muted">
                    {item.offerCount} {item.offerCount === 1 ? "offer" : "offers"} compared
                  </p>
                )}
                <p className="mt-auto pt-1 text-base font-extrabold tabular-nums text-navy-900">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-accent">
                    From{" "}
                  </span>
                  ${item.lowestTotalCost.toFixed(2)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Assign display badges from ranking signals — never invent ratings. */
export function withTopProductBadges(items: PopularComparison[]): TopProductCard[] {
  return items.map((item, index) => {
    let badge: TopProductBadge = "Popular";
    if (index === 0) badge = "Bestseller";
    else if (item.rating != null) badge = "Top rated";
    else if (item.offerCount >= 3) badge = "Popular";
    else if (index <= 1) badge = "Bestseller";

    return {
      ...item,
      badge,
      supportingLine: `${item.brandName} · ${item.offerCount} approved ${
        item.offerCount === 1 ? "offer" : "offers"
      }`,
    };
  });
}
