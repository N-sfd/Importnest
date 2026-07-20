import Image from "next/image";
import Link from "next/link";
import { categoryDisplayTitle, categoryImageSrc } from "@/lib/category-visuals";
import { getCategoryDemoProducts } from "@/data/category-demo-products";

/**
 * Non-interactive discovery tiles for category browsing — see
 * .cursor/rules/homepage-demo-data.mdc. No price/offer/compare/save
 * affordances; every tile links to browsing the real category, never to a
 * fake product page. Hidden entirely when there's no demo content for this
 * category rather than rendering an empty section.
 */
export function CategoryDemoGrid({ categorySlug }: { categorySlug: string }) {
  const products = getCategoryDemoProducts(categorySlug);
  if (products.length === 0) return null;

  const categoryHeroImage = categoryImageSrc(categorySlug);
  const title = categoryDisplayTitle(categorySlug);
  const browseHref = `/search?category=${categorySlug}`;

  return (
    <section className="mt-8" aria-labelledby="category-demo-heading">
      <div className="flex items-end justify-between gap-3">
        <h2
          id="category-demo-heading"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          More to explore in {title}
        </h2>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const image = product.image ?? categoryHeroImage;
          return (
            <Link
              key={product.id}
              href={browseHref}
              className="group flex gap-3 rounded-xl border border-border bg-panel p-3 shadow-[var(--shadow-panel)] transition hover:-translate-y-0.5 hover:border-navy-800"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-navy-100">
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.04]"
                    sizes="96px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                {product.badge ? (
                  <span className="mb-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                    {product.badge}
                  </span>
                ) : null}
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted">
                  {product.brand}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-link">
                  {product.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{product.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
