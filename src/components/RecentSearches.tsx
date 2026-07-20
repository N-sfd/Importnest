import Link from "next/link";
import type { RecentSearch } from "@/lib/recent-searches";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Compact recent-search shortcuts. Renders nothing when empty. */
export function RecentSearches({
  items,
  compact = false,
  framed = false,
}: {
  items: RecentSearch[];
  compact?: boolean;
  framed?: boolean;
}) {
  if (items.length === 0) return null;

  const body = compact ? (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted">
        Recent searches
      </h2>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.continueHref}
              className="block rounded-lg border border-border bg-surface px-2.5 py-2 transition hover:border-navy-800"
            >
              <span className="line-clamp-1 text-sm font-semibold text-foreground">
                {item.query}
              </span>
              <span className="mt-0.5 block text-[11px] text-muted">
                {formatDate(item.createdAt)}
                {item.budgetMax != null ? ` · $${item.budgetMax}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  ) : (
    <section className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Recent searches</h2>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.continueHref}
            className="panel flex flex-col gap-1 p-3 transition hover:border-navy-800"
          >
            <span className="truncate text-sm font-semibold text-foreground">{item.query}</span>
            <span className="text-xs text-muted">
              {formatDate(item.createdAt)}
              {item.budgetMax != null ? ` · Budget $${item.budgetMax}` : ""}
            </span>
            <span className="text-xs font-semibold text-link">Continue search →</span>
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
