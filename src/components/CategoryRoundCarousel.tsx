import Image from "next/image";
import Link from "next/link";
import { categoryDisplayTitle, normalizeCategoryKey } from "@/lib/category-visuals";

export type CategoryRoundCarouselItem = {
  label: string;
  /** Lowercase identifier compared against `activeSubtype`; "" means the reset/all tile. */
  slug: string;
  imageUrl: string;
  href: string;
  badge?: string;
};

export type CategoryRoundCarouselProps = {
  categorySlug: string;
  items: CategoryRoundCarouselItem[];
  /** Current subtype/query driving the highlighted tile; "" or omitted highlights the reset tile. */
  activeSubtype?: string | null;
  heading?: string;
  subtitle?: string;
  className?: string;
};

/**
 * Round image tiles for browsing a category's subtypes (e.g. Refrigerators,
 * Dishwashers) — scrolls horizontally instead of wrapping so it stays a single
 * compact row on every viewport.
 */
export function CategoryRoundCarousel({
  categorySlug,
  items,
  activeSubtype,
  heading,
  subtitle,
  className,
}: CategoryRoundCarouselProps) {
  if (items.length === 0) return null;

  const title = categoryDisplayTitle(categorySlug);
  const headingText = heading ?? `Explore ${title}`;
  const subtitleText =
    subtitle ?? `Browse ${title.toLowerCase()} types, then compare real offers by Total Known Cost.`;
  const headingId = `round-carousel-${normalizeCategoryKey(categorySlug)}-heading`;
  const active = (activeSubtype ?? "").trim().toLowerCase();

  return (
    <section aria-labelledby={headingId} className={className ? `space-y-1 ${className}` : "space-y-1"}>
      <div>
        <h2 id={headingId} className="text-lg font-bold tracking-tight text-navy-900 sm:text-xl">
          {headingText}
        </h2>
        <p className="mt-1 text-sm text-muted">{subtitleText}</p>
      </div>
      <ul className="round-category-carousel" aria-label={`${title} subcategories`}>
        {items.map((item) => {
          const isActive = item.slug.toLowerCase() === active;
          return (
            <li
              key={item.slug || "all"}
              className={isActive ? "round-category-tile active" : "round-category-tile"}
            >
              <Link href={item.href} aria-current={isActive ? "true" : undefined}>
                <span className="round-category-image">
                  <Image
                    src={item.imageUrl}
                    alt={item.label}
                    width={116}
                    height={116}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                  {item.badge ? <span className="round-category-badge">{item.badge}</span> : null}
                </span>
                <span className="round-category-label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
