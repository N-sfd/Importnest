import Image from "next/image";
import Link from "next/link";
import { isPublicApprovedSource, retailerTrustFor } from "@/lib/approved-sources";
import { sourceImageFor } from "@/lib/images";

export type ApprovedSourceItem = {
  id: string;
  name: string;
};

/**
 * Trust strip under the homepage hero.
 * Recognizable labels + badge tooltips explaining why each source is trusted.
 */
export function ApprovedSourcesStrip({ sources }: { sources: ApprovedSourceItem[] }) {
  const visible = sources
    .filter((s) => isPublicApprovedSource(s.id))
    .map((s) => ({ ...s, trust: retailerTrustFor(s.id, s.name) }));

  if (visible.length === 0) return null;

  const count = visible.length;
  const loop = [...visible, ...visible];

  return (
    <section className="mt-6 rounded-2xl border border-border bg-panel px-4 py-4 shadow-[var(--shadow-panel)] sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Approved retailers only</p>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            {count} verified{" "}
            {count === 1 ? "source" : "sources"} — hover a badge to see why we trust them
          </p>
        </div>
        <Link
          href="/#approved-sources"
          className="text-xs font-semibold text-link hover:underline sm:text-sm"
        >
          What “approved” means
        </Link>
      </div>

      <div className="relative mt-4 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-panel to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-panel to-transparent"
          aria-hidden
        />
        <ul
          className="approved-marquee flex w-max gap-3 motion-reduce:animate-none motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center"
          aria-label="Approved retailer sources"
        >
          {loop.map((source, i) => (
            <li
              key={`${source.id}-${i}`}
              className="group relative flex w-[13.5rem] shrink-0 items-center gap-2.5 rounded-xl border border-border bg-panel px-3 py-2.5"
              aria-hidden={i >= visible.length}
            >
              <Image
                src={sourceImageFor(source.id)}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg border border-border bg-white object-contain p-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {source.trust.label}
                </p>
                <span
                  tabIndex={i < visible.length ? 0 : -1}
                  title={source.trust.trustHint}
                  className="mt-0.5 inline-flex cursor-help rounded-full bg-cta/15 px-1.5 py-0.5 text-[10px] font-bold text-navy-800 outline-none ring-cta focus-visible:ring-2"
                >
                  {source.trust.badge}
                </span>
              </div>
              {/* Hover / focus tooltip */}
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 hidden w-52 -translate-x-1/2 rounded-lg border border-border bg-navy-900 px-2.5 py-2 text-[11px] leading-snug text-white shadow-lg group-hover:block group-focus-within:block"
              >
                {source.trust.trustHint}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
