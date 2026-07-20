import Image from "next/image";
import Link from "next/link";

export type CategoryImageCardProps = {
  name: string;
  desc: string;
  href: string;
  image: string;
};

/**
 * Category browsing card — image-forward with a light text panel
 * (no heavy dark gradient overlays).
 */
export function CategoryImageCard({ name, desc, href, image }: CategoryImageCardProps) {
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
      <div className="flex flex-1 flex-col gap-0.5 px-3.5 py-3">
        <div className="font-bold text-navy-900 group-hover:text-link">{name}</div>
        <div className="line-clamp-2 text-xs leading-snug text-muted">{desc}</div>
      </div>
    </Link>
  );
}

export function CategoryImageGrid({ items }: { items: CategoryImageCardProps[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item) => (
        <CategoryImageCard key={item.name} {...item} />
      ))}
    </div>
  );
}
