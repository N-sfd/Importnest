import Image from "next/image";
import Link from "next/link";
import { productThumbClass } from "@/lib/images";
import type { TopProductBadge } from "@/components/TopProductsSection";

export type TopProductCardProps = {
  href: string;
  imageSrc: string;
  productName: string;
  supportingLine: string;
  badge: TopProductBadge;
  fromPrice: number;
  rating: number | null;
  offerCount: number;
};

function badgeClass(badge: TopProductBadge) {
  if (badge === "Bestseller") return "bg-cta text-white";
  if (badge === "Top rated") return "bg-navy-900 text-white";
  return "bg-accent/15 text-accent";
}

/** Reusable dense Top Product card for homepage grids. */
export function TopProductCard({
  href,
  imageSrc,
  productName,
  supportingLine,
  badge,
  fromPrice,
  rating,
  offerCount,
}: TopProductCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-panel shadow-[var(--shadow-panel)] transition hover:-translate-y-0.5 hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={imageSrc}
          alt={productName}
          fill
          className={`${productThumbClass(imageSrc)} transition duration-300 group-hover:scale-[1.03]`}
          sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 16vw"
        />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass(badge)}`}
        >
          {badge}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-navy-900 group-hover:text-link">
          {productName}
        </p>
        <p className="line-clamp-2 text-xs text-muted">{supportingLine}</p>
        {rating != null ? (
          <p className="text-xs font-semibold text-navy-900">Score {rating.toFixed(1)}</p>
        ) : (
          <p className="text-xs text-muted">
            {offerCount} {offerCount === 1 ? "offer" : "offers"} compared
          </p>
        )}
        <p className="mt-auto pt-1 text-base font-extrabold tabular-nums text-navy-900">
          <span className="text-[11px] font-bold uppercase tracking-wide text-accent">From </span>$
          {fromPrice.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
