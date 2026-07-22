import Image from "next/image";
import Link from "next/link";

export type CategoryImageCardProps = {
  name: string;
  desc: string;
  href: string;
  image: string;
  /** Up to 4 department-style browsing chips (e.g. "Phones", "Laptops"). */
  subcategories?: string[];
  /** Real live CanonicalProduct count for this category — omit when unknown, never fabricated. */
  productCount?: number | null;
};

/**
 * Category browsing card — image-forward with a light text panel
 * (no heavy dark gradient overlays). Amazon-style department chips and a
 * real product count (when known) make it read as a browsable department
 * rather than just a photo tile.
 */
export function CategoryImageCard({
  name,
  desc,
  href,
  image,
  subcategories = [],
  productCount,
}: CategoryImageCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-panel shadow-[var(--shadow-panel)] transition duration-200 hover:-translate-y-1 hover:border-accent/45 hover:shadow-[0_8px_22px_rgb(16_35_63/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition duration-300 ease-out group-hover:scale-[1.04]"
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
        <div>
          <div className="font-bold text-navy-900 group-hover:text-link">{name}</div>
          <div className="line-clamp-2 text-xs leading-snug text-muted">{desc}</div>
        </div>

        {subcategories.length > 0 ? (
          <ul className="flex flex-wrap gap-1" aria-label={`${name} subcategories`}>
            {subcategories.slice(0, 4).map((sub) => (
              <li
                key={sub}
                className="rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-semibold text-navy-800"
              >
                {sub}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {productCount != null && productCount > 0 ? (
            <span className="text-[11px] font-medium text-muted">
              {productCount} {productCount === 1 ? "product" : "products"}
            </span>
          ) : (
            <span />
          )}
          <span className="text-xs font-semibold text-link group-hover:underline">
            View category
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CategoryImageGrid({ items }: { items: CategoryImageCardProps[] }) {
  return (
    <div className="section-grid mt-4">
      {items.map((item) => (
        <CategoryImageCard key={item.name} {...item} />
      ))}
    </div>
  );
}
