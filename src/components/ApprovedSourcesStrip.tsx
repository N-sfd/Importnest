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
          href="/how-to-use"
          className="text-xs font-semibold text-link hover:underline sm:text-sm"
        >
          How Importnest works
        </Link>
      </div>

      <ul
        className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5"
        aria-label="Approved retailer sources"
      >
        {visible.map((source) => (
          <li
            key={source.id}
            className="group relative flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2.5"
          >
            <Image
              src={sourceImageFor(source.id)}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-lg"
            />
            <div className="min-w-0">
              <p
                tabIndex={0}
                title={source.trust.trustHint}
                className="cursor-help truncate text-sm font-semibold text-foreground outline-none"
              >
                {source.trust.label}
              </p>
              <p className="truncate text-[11px] font-medium text-muted">{source.trust.badge}</p>
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

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted">
        <li>Sponsored results are labeled separately</li>
        <li>Prices checked regularly</li>
        <li>No hidden ranking influence</li>
      </ul>
    </section>
  );
}
