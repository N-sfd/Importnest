import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import type { SearchIntent } from "@/lib/search-intent";

type SummaryRow = {
  label: string;
  value: string;
  editParams: string[];
};

function buildSummaryRows(intent: SearchIntent, categoryLabel?: string): SummaryRow[] {
  const rows: SummaryRow[] = [];

  if (categoryLabel) {
    rows.push({ label: "Category", value: categoryLabel, editParams: ["category"] });
  }
  rows.push({
    label: "Budget",
    value: intent.budgetMax != null ? `Up to $${intent.budgetMax}` : "Any budget",
    editParams: ["budgetMax"],
  });
  rows.push({
    label: "Condition",
    value: intent.condition ? intent.condition.replace(/_/g, " ") : "Any / No preference",
    editParams: ["condition"],
  });
  rows.push({
    label: "Delivery",
    value: intent.deliveryBy ?? "No rush",
    editParams: ["deliveryBy"],
  });
  rows.push({
    label: "Priority",
    value:
      intent.sortPriority && intent.sortPriority !== "best_overall"
        ? intent.sortPriority.replace(/_/g, " ")
        : "Best overall",
    editParams: ["priority"],
  });
  rows.push({
    label: "Alternatives",
    value: intent.allowComparableAlternatives === false ? "Exact model only" : "Allowed",
    editParams: ["alt"],
  });

  return rows;
}

export function SearchConfirmation({
  intent,
  currentParams,
  categoryLabel,
}: {
  intent: SearchIntent;
  currentParams: Record<string, string>;
  categoryLabel?: string;
}) {
  const rows = buildSummaryRows(intent, categoryLabel);

  function editHref(editParams: string[]) {
    const params = new URLSearchParams(currentParams);
    params.delete("continue");
    params.delete("confirmed");
    for (const key of editParams) params.delete(key);
    return `/search/clarify?${params.toString()}`;
  }

  const confirmParams = new URLSearchParams(currentParams);
  confirmParams.set("confirmed", "1");

  return (
    <PageShell width="narrow">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Confirm your search</h1>
      <p className="mt-1 text-sm text-muted">
        Here&apos;s what we&apos;ll use to find offers for &ldquo;{intent.query}&rdquo;.
      </p>

      <div className="panel mt-6 divide-y divide-border overflow-hidden">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{row.label}</p>
              <p className="text-sm font-medium text-foreground">{row.value}</p>
            </div>
            <Link
              href={editHref(row.editParams)}
              aria-label={`Edit ${row.label}`}
              className="text-xs font-semibold text-link hover:underline"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium hover:border-navy-800"
        >
          Start over
        </Link>
        <Link
          href={`/search/confirm?${confirmParams.toString()}`}
          className="btn-cta ml-auto inline-flex min-h-11 items-center px-5 py-2 text-sm"
        >
          Show comparison
        </Link>
      </div>
    </PageShell>
  );
}
