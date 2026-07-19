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
    <section className="mt-6" aria-labelledby="category-demo-heading">
      <h2 id="category-demo-heading" className="text-sm font-bold uppercase tracking-wide text-muted">
        More to explore in {title}
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const image = product.image ?? categoryHeroImage;
          return (
            <Link
              key={product.id}
              href={browseHref}
              className="group flex gap-3 rounded-xl border border-border bg-panel p-3 transition hover:border-navy-800"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                {image ? (
                  <Image src={image} alt="" fill className="object-cover" sizes="64px" />
                ) : null}
              </div>
              <div className="min-w-0">
                {product.badge ? (
                  <span className="mb-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                    {product.badge}
                  </span>
                ) : null}
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted">
                  {product.brand}
                </p>
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-link">
                  {product.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted">{product.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
