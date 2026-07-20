"use client";

import Link from "next/link";
import { categoryDisplayTitle, normalizeCategoryKey } from "@/lib/category-visuals";
import {
  getCategoryDemoProducts,
  getCategoryDemoSubtypes,
} from "@/data/category-demo-products";
import { ProductImage } from "@/components/ProductImage";

/**
 * Image-rich discovery tiles for category browsing — distinct subtype photos.
 * Not live listings: no invented prices/offers.
 * Always scoped to the requested category only (never mixes departments).
 */
export function CategoryDemoGrid({
  categorySlug,
  prominence = "secondary",
}: {
  categorySlug: string;
  /** primary = main browse grid when live results are empty; secondary = “More to explore” */
  prominence?: "primary" | "secondary";
}) {
  const key = normalizeCategoryKey(categorySlug);
  const products = getCategoryDemoProducts(categorySlug).filter(
    (p) => normalizeCategoryKey(p.categorySlug) === key,
  );
  if (products.length === 0) return null;

  const title = categoryDisplayTitle(categorySlug);
  const browseHref = `/search/results?category=${encodeURIComponent(categorySlug)}`;
  const subtypes = getCategoryDemoSubtypes(categorySlug);
  const headingId = prominence === "primary" ? "category-browse-heading" : "category-demo-heading";

  return (
    <section className={prominence === "primary" ? "mt-2" : "mt-8"} aria-labelledby={headingId}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={headingId} className="text-lg font-bold tracking-tight text-navy-900 sm:text-xl">
            {prominence === "primary" ? `Explore ${title}` : `More to explore in ${title}`}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {products.length} {title} product types with distinct photos — browse ideas, then
            compare live offers when available.
          </p>
        </div>
        <Link href={browseHref} className="text-sm font-semibold text-link hover:underline">
          View all {title}
        </Link>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${title} product types`}>
        {subtypes.map((subtype) => (
          <li key={subtype}>
            <Link
              href={`/search/results?q=${encodeURIComponent(subtype)}&category=${encodeURIComponent(categorySlug)}`}
              className="inline-flex rounded-full border border-border bg-panel px-3 py-1 text-xs font-semibold capitalize text-navy-900 transition hover:border-accent hover:text-link"
            >
              {subtype}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <li key={product.id} className="min-w-0">
            <Link
              href={`/search/results?q=${encodeURIComponent(product.subtype)}&category=${encodeURIComponent(categorySlug)}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-panel shadow-[var(--shadow-panel)] transition hover:-translate-y-0.5 hover:border-accent/45"
            >
              <div className="relative mx-2 mt-2 overflow-hidden rounded-[14px]">
                <ProductImage
                  src={product.image}
                  category={product.categorySlug}
                  subtype={product.subtype}
                  title={product.title}
                  subtitle={product.subtitle}
                  size="card"
                  className="transition duration-300 group-hover:scale-[1.04]"
                  sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
                />
                {product.badge ? (
                  <span className="badge-accent absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold">
                    {product.badge}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-0.5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {product.brand}
                </p>
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-navy-900 group-hover:text-link">
                  {product.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs capitalize text-muted">{product.subtype}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{product.subtitle}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
