import Link from "next/link";
import { EXAMPLE_SEARCHES } from "@/lib/search-prompts";

/** Compact example-query shortcuts that submit through the normal search flow, just like typing. */
export function ExampleSearches() {
  return (
    <section className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Try an example</h2>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {EXAMPLE_SEARCHES.map((example) => (
          <Link
            key={example.label}
            href={`/search?q=${encodeURIComponent(example.query)}`}
            className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-navy-800 transition hover:border-navy-800 hover:bg-panel"
          >
            {example.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
