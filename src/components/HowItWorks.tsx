import Link from "next/link";

function MiniSearchPreview() {
  return (
    <div
      className="rounded-full border border-border bg-white px-3 py-2 shadow-sm dark:bg-panel"
      aria-hidden
    >
      <p className="truncate text-[11px] text-muted">
        <span className="text-foreground/80">quiet dishwasher under $900…</span>
        <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-accent align-middle" />
      </p>
    </div>
  );
}

function MiniApprovedPreview() {
  return (
    <ul className="space-y-1.5" aria-hidden>
      {[
        { name: "Manufacturer store", badge: "Official" },
        { name: "Authorized dealer", badge: "Verified" },
        { name: "Licensed marketplace", badge: "Reviewed" },
      ].map((row) => (
        <li
          key={row.name}
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] dark:bg-panel"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-cta/35 text-[10px] font-bold text-navy-900">
            ✓
          </span>
          <span className="min-w-0 flex-1 truncate font-medium text-foreground">{row.name}</span>
          <span className="shrink-0 rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-bold text-muted">
            {row.badge}
          </span>
        </li>
      ))}
    </ul>
  );
}

function MiniComparePreview() {
  return (
    <div
      className="rounded-xl border border-border bg-white px-3 py-2.5 shadow-sm dark:bg-panel"
      aria-hidden
    >
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        Preview
      </p>
      <div className="flex justify-between text-[11px] text-muted">
        <span>Item price</span>
        <span className="font-medium text-foreground">···</span>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>+ Shipping</span>
        <span className="font-medium text-foreground">···</span>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>+ Protection</span>
        <span className="font-medium text-foreground">···</span>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          Total known cost
        </span>
        <span className="rounded-full bg-cta/30 px-2 py-0.5 text-xs font-bold text-navy-900">
          One clear number
        </span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    label: "Describe what you need",
    detail: "Search by natural language, model number, UPC, or product URL.",
    Preview: MiniSearchPreview,
  },
  {
    n: "02",
    label: "Match approved listings",
    detail: "Importnest compares listings from reviewed sources and avoids unsafe matches.",
    Preview: MiniApprovedPreview,
  },
  {
    n: "03",
    label: "Compare with clarity",
    detail:
      "See total known cost, delivery, condition, protection, and freshness in one view.",
    Preview: MiniComparePreview,
  },
] as const;

export function HowItWorks() {
  return (
    <section className="panel mt-10 p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">How it works</h2>
        <Link href="/how-to-use" className="text-sm font-semibold text-link hover:underline">
          How Importnest works →
        </Link>
      </div>
      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ n, label, detail, Preview }) => (
          <li
            key={n}
            className="rounded-xl border border-border bg-surface/80 px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-ring/40 hover:shadow-md"
          >
            <span className="text-xs font-bold tracking-[0.16em] text-accent">{n}</span>
            <div className="mt-3">
              <Preview />
            </div>
            <p className="mt-3 font-semibold text-foreground">{label}</p>
            <p className="mt-1 text-sm text-muted">
              {detail}
              {n === "02" ? (
                <>
                  {" "}
                  <Link
                    href="#approved-sources"
                    className="font-semibold text-link hover:underline"
                  >
                    What we verify →
                  </Link>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ol>

      <div
        id="approved-sources"
        className="mt-5 scroll-mt-28 rounded-xl border border-border bg-surface/80 px-4 py-3"
      >
        <p className="text-sm font-semibold text-foreground">What “approved” means</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Importnest only surfaces listings from active source connectors we onboard and review.
          Criteria include authorized or licensed merchant status where available, documented
          return policies when provided by the source, and freshness from connected feeds—not open
          web scraping of unverified sellers. Sponsored placements never change organic ranking.
        </p>
      </div>
    </section>
  );
}
