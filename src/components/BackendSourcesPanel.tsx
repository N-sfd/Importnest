import Image from "next/image";
import { BackendLinks } from "@/components/BackendLinks";
import type { CompareSourceSummary } from "@/lib/compare-view";
import { sourceImageFor } from "@/lib/images";

function freshnessLabel(minutes: number | null) {
  if (minutes == null) return "Not synced";
  if (minutes === 0) return "Synced just now";
  if (minutes === 1) return "Synced 1 minute ago";
  return `Synced ${minutes} minutes ago`;
}

export function BackendSourcesPanel({ sources }: { sources: CompareSourceSummary[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="text-sm font-semibold text-navy-900">Backend data sources</h2>
      <p className="mt-1 text-xs text-gray-500">
        Live listings loaded from approved connectors and stored in Postgres.
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {sources.map((source) => (
          <li
            key={source.sourceId}
            className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3"
          >
            <Image
              src={sourceImageFor(source.sourceId)}
              alt=""
              width={36}
              height={36}
              className="rounded-md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy-900">{source.sourceName}</p>
              <p className="text-xs text-gray-500">
                {source.sourceTypeLabel} · {source.listingCount}{" "}
                {source.listingCount === 1 ? "listing" : "listings"} ·{" "}
                {freshnessLabel(source.freshnessMinutesAgo)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <BackendLinks className="mt-4 border-t border-gray-200 pt-4" compact />
    </div>
  );
}
