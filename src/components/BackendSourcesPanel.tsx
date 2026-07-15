import Image from "next/image";
import { BackendLinks } from "@/components/BackendLinks";
import { Freshness } from "@/components/Freshness";
import { isPublicApprovedSource } from "@/lib/approved-sources";
import type { CompareSourceSummary } from "@/lib/compare-view";
import { sourceImageFor } from "@/lib/images";

export function BackendSourcesPanel({ sources }: { sources: CompareSourceSummary[] }) {
  const visible = sources.filter((s) => isPublicApprovedSource(s.sourceId));
  if (visible.length === 0) return null;

  return (
    <div className="panel mt-6 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-foreground">Approved sources</h2>
      <p className="mt-1 text-xs text-muted">
        Live listings from trusted connectors. Freshness updates as sources sync.
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {visible.map((source) => (
          <li
            key={source.sourceId}
            className="flex items-center gap-3 rounded-xl border border-border bg-panel p-3"
          >
            <Image
              src={sourceImageFor(source.sourceId)}
              alt=""
              width={36}
              height={36}
              className="rounded-lg border border-border bg-white object-contain p-0.5"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{source.sourceName}</p>
              <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted">
                <span>
                  {source.sourceTypeLabel} · {source.listingCount}{" "}
                  {source.listingCount === 1 ? "listing" : "listings"} ·
                </span>
                <Freshness minutesAgo={source.freshnessMinutesAgo} />
              </p>
            </div>
          </li>
        ))}
      </ul>

      <BackendLinks className="mt-4 border-t border-border pt-4" compact />
    </div>
  );
}
