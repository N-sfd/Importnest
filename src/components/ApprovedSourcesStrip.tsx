import Image from "next/image";
import Link from "next/link";
import { isPublicApprovedSource, retailerTrustFor } from "@/lib/approved-sources";
import { sourceImageFor } from "@/lib/images";

export type ApprovedSourceItem = {
  id: string;
  name: string;
};

/**
 * Compact trust strip under the homepage hero.
 * Recognizable labels + badge tooltips explaining why each source is trusted.
 */
export function ApprovedSourcesStrip({ sources }: { sources: ApprovedSourceItem[] }) {
  const visible = sources
    .filter((s) => isPublicApprovedSource(s.id))
    .map((s) => ({ ...s, trust: retailerTrustFor(s.id, s.name) }));

  if (visible.length === 0) return null;

  const count = visible.length;

  return (
    <section className="mt-6 rounded-2xl border border-border bg-panel px-4 py-4 shadow-[var(--shadow-panel)] sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Approved retailers only</p>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            {count} verified {count === 1 ? "source" : "sources"}
          </p>
        </div>
        <Link
          href="/#approved-sources"
          className="text-xs font-semibold text-link hover:underline sm:text-sm"
        >
          See source standards
        </Link>
      </div>

      <ul
        className="mt-3 flex flex-wrap gap-2.5"
        aria-label="Approved retailer sources"
      >
        {visible.map((source) => (
          <li
            key={source.id}
            className="group relative flex shrink-0 items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2"
          >
            <Image
              src={sourceImageFor(source.id)}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg border border-border bg-white object-contain p-0.5"
            />
            <span
              tabIndex={0}
              title={source.trust.trustHint}
              className="cursor-help text-xs font-semibold text-foreground outline-none"
            >
              {source.trust.label}
            </span>
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
    </section>
  );
}
