"use client";

import Image from "next/image";
import Link from "next/link";
import { useRecentlyViewed } from "@/components/RecentlyViewedProvider";
import { productThumbClass } from "@/lib/images";

export function RecentlyViewedSection({
  compact = false,
  framed = false,
}: {
  compact?: boolean;
  framed?: boolean;
}) {
  const { items } = useRecentlyViewed();

  if (items.length === 0) return null;

  const body = compact ? (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted">
        Recently viewed
      </h2>
      <ul className="mt-2 space-y-2">
        {items.slice(0, 4).map((item) => (
          <li key={item.id}>
            <Link
              href={`/compare/${item.id}`}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-1.5 transition hover:border-navy-800"
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                <Image
                  src={item.imageSrc}
                  alt={item.name}
                  fill
                  className={productThumbClass(item.imageSrc)}
                  sizes="44px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] text-muted">{item.brandName}</p>
                <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                  {item.name}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  ) : (
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

  if (compact && framed) {
    return (
      <div className="rounded-2xl border border-border bg-panel p-3.5 shadow-[var(--shadow-panel)]">
        {body}
      </div>
    );
  }
  return body;
}
