import Link from "next/link";
import type { RecentSearch } from "@/lib/recent-searches";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Compact recent-search shortcuts for returning (signed-in) shoppers. Renders nothing when empty. */
export function RecentSearches({ items }: { items: RecentSearch[] }) {
  if (items.length === 0) return null;

  return (
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
}
