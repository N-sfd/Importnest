import Image from "next/image";
import { Freshness } from "@/components/Freshness";
import { isPublicApprovedSource, retailerTrustFor } from "@/lib/approved-sources";
import type { CompareSourceSummary } from "@/lib/compare-view";
import { sourceImageFor } from "@/lib/images";

export function BackendSourcesPanel({ sources }: { sources: CompareSourceSummary[] }) {
  const visible = sources.filter((s) => isPublicApprovedSource(s.sourceId));
  if (visible.length === 0) return null;

  return (
    <div className="panel p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-foreground">Approved sources</h2>
      <p className="mt-1 text-xs text-muted">
        Live listings from trusted connectors. Freshness updates as sources sync.
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {visible.map((source) => {
          const trust = retailerTrustFor(source.sourceId, source.sourceName);
          return (
            <li
              key={source.sourceId}
              className="flex items-center gap-3 rounded-xl border border-border bg-panel p-3"
              title={trust.trustHint}
            >
              <Image
                src={sourceImageFor(source.sourceId)}
                alt=""
                width={36}
                height={36}
                className="rounded-lg border border-border bg-white object-contain p-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{trust.label}</p>
                <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted">
                  <span className="rounded-full bg-cta/15 px-1.5 py-0.5 text-[10px] font-bold text-navy-800">
                    {trust.badge}
                  </span>
                  <span>
                    · {source.listingCount}{" "}
                    {source.listingCount === 1 ? "listing" : "listings"} ·
                  </span>
                  <Freshness minutesAgo={source.freshnessMinutesAgo} />
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
