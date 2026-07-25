import { PageShell } from "@/components/PageShell";

function CardSkeleton() {
  return (
    <div className="product-card animate-pulse">
      <div className="aspect-square w-full bg-surface" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 rounded bg-surface" />
        <div className="h-3 w-1/2 rounded bg-surface" />
        <div className="h-6 w-2/3 rounded bg-surface" />
      </div>
    </div>
  );
}

export default function SearchResultsLoading() {
  return (
    <PageShell>
      <div className="flex flex-col gap-4 pb-20 lg:flex-row lg:items-start lg:gap-6 lg:pb-0">
        <div className="hidden w-64 shrink-0 animate-pulse space-y-3 lg:block">
          <div className="h-6 w-1/2 rounded bg-surface" />
          <div className="h-32 rounded-xl bg-surface" />
          <div className="h-32 rounded-xl bg-surface" />
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <div className="h-9 w-full animate-pulse rounded-lg bg-surface" />
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <li key={i}>
                <CardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
