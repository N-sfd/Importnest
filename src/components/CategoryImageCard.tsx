import Image from "next/image";
import Link from "next/link";

export type CategoryImageCardProps = {
  name: string;
  desc: string;
  href: string;
  image: string;
};

/** Category browsing card with product imagery — used on homepage Shop by Category. */
export function CategoryImageCard({ name, desc, href, image }: CategoryImageCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-panel shadow-[var(--shadow-panel)] transition duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_10px_28px_rgb(4_25_53/0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition duration-300 ease-out group-hover:scale-[1.05]"
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-navy-900/55 via-navy-900/15 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 px-3.5 py-3.5">
          <div className="font-bold text-white drop-shadow-sm">{name}</div>
          <div className="line-clamp-2 text-xs text-white/90">{desc}</div>
        </div>
      </div>
    </Link>
  );
}

export function CategoryImageGrid({ items }: { items: CategoryImageCardProps[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => (
        <CategoryImageCard key={item.name} {...item} />
      ))}
    </div>
  );
}
