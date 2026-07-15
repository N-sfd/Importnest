import Image from "next/image";
import Link from "next/link";

export type DepartmentCardData = {
  name: string;
  desc: string;
  href: string;
  image: string;
};

export function DepartmentCard({ category }: { category: DepartmentCardData }) {
  return (
    <Link
      href={category.href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-panel shadow-[var(--shadow-panel)] transition duration-200 hover:-translate-y-1 hover:border-ring/55 hover:shadow-[0_10px_28px_rgb(4_25_53/0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] bg-navy-100">
        <Image
          src={category.image}
          alt=""
          fill
          className="object-cover transition duration-300 ease-out group-hover:scale-[1.06]"
          sizes="(max-width:640px) 50vw, 25vw"
        />
        {/* Stronger bottom scrim so titles stay readable on light imagery (e.g. footwear). */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/45 to-navy-950/5"
        />
        <div className="absolute inset-x-0 bottom-0 px-3.5 py-3.5">
          <div className="font-bold text-white drop-shadow-sm">{category.name}</div>
          <div className="text-xs text-white/90">{category.desc}</div>
        </div>
      </div>
    </Link>
  );
}

export function DepartmentGrid({ categories }: { categories: DepartmentCardData[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {categories.map((c) => (
        <DepartmentCard key={c.name} category={c} />
      ))}
    </div>
  );
}
