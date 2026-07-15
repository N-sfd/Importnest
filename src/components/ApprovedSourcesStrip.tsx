import Image from "next/image";
import Link from "next/link";
import { isPublicApprovedSource } from "@/lib/approved-sources";
import { sourceImageFor } from "@/lib/images";

export type ApprovedSourceItem = {
  id: string;
  name: string;
};

/**
 * Trust strip under the homepage hero.
 * Only renders real active Source rows from the backend — never invents retailers.
 */
export function ApprovedSourcesStrip({ sources }: { sources: ApprovedSourceItem[] }) {
  const visible = sources.filter((s) => isPublicApprovedSource(s.id));
  if (visible.length === 0) return null;

  const count = visible.length;
  const loop = [...visible, ...visible];

  return (
    <section className="mt-6 rounded-2xl border border-border bg-panel px-4 py-4 shadow-[var(--shadow-panel)] sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Approved retailers</p>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Sourcing live offers from {count} approved{" "}
            {count === 1 ? "retailer" : "retailers"}
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
              className="flex w-40 shrink-0 items-center gap-2.5 rounded-xl border border-border bg-panel px-3 py-2.5"
              aria-hidden={i >= visible.length}
            >
              <Image
                src={sourceImageFor(source.id)}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg border border-border bg-white object-contain p-0.5"
              />
              <span className="truncate text-xs font-semibold text-foreground">{source.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
