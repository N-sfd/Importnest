"use client";

import Image from "next/image";
import Link from "next/link";
import { useRecentlyViewed } from "@/components/RecentlyViewedProvider";
import { productThumbClass } from "@/lib/images";

export function RecentlyViewedSection() {
  const { items } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Recently viewed</h2>
      <div className="mt-2.5 flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/compare/${item.id}`}
            className="flex w-32 shrink-0 flex-col gap-1.5 rounded-xl border border-border bg-panel p-2.5 transition hover:border-navy-800"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
              <Image
                src={item.imageSrc}
                alt={item.name}
                fill
                className={productThumbClass(item.imageSrc)}
                sizes="128px"
              />
            </div>
            <p className="truncate text-[11px] text-muted">{item.brandName}</p>
            <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
              {item.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
