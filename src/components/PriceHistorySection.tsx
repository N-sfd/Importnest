import type { ProductPriceHistorySummary } from "@/lib/compare-data";

function PriceTrendChart({
  points,
  stroke = "#00b8d4",
}: {
  points: { day: string; total: number }[];
  stroke?: string;
}) {
  const width = 320;
  const height = 110;
  const padX = 8;
  const padY = 12;
  const totals = points.map((p) => p.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (width - padX * 2);
    const y = height - padY - ((p.total - min) / range) * (height - padY * 2);
    return { x, y };
  });
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 max-w-md"
      role="img"
      aria-label={`Price trend from $${totals[0]!.toFixed(2)} to $${totals[totals.length - 1]!.toFixed(2)}`}
    >
      <polygon fill={`${stroke}22`} points={area} />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line}
      />
      {coords.map((c, i) =>
        i === coords.length - 1 || i === 0 ? (
          <circle key={i} cx={c.x} cy={c.y} r="3.2" fill={stroke} />
        ) : null,
      )}
    </svg>
  );
}

export function PriceHistorySection({ summary }: { summary: ProductPriceHistorySummary }) {
  const hasChart = summary.points.length >= 2;

  return (
    <section className="panel mt-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Price history</h2>
        {summary.isIllustrative ? (
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-muted ring-1 ring-border">
            Illustrative 14-day trend
          </span>
        ) : null}
      </div>
      {!hasChart ? (
        <p className="mt-3 text-sm text-muted">
          Price history will appear after more price checks.
        </p>
      ) : (
        <>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summary.currentLowest != null ? (
              <div>
                <dt className="text-xs font-medium text-muted">Current lowest</dt>
                <dd className="mt-0.5 text-base font-bold tabular-nums text-price">
                  ${summary.currentLowest.toFixed(2)}
                </dd>
              </div>
            ) : null}
            {summary.previousPrice != null ? (
              <div>
                <dt className="text-xs font-medium text-muted">Previous price</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
                  ${summary.previousPrice.toFixed(2)}
                </dd>
              </div>
            ) : null}
            {summary.lowestRecorded != null ? (
              <div>
                <dt className="text-xs font-medium text-muted">Lowest recorded</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
                  ${summary.lowestRecorded.toFixed(2)}
                </dd>
              </div>
            ) : null}
            {summary.lastChange != null ? (
              <div>
                <dt className="text-xs font-medium text-muted">Last price change</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
                  {Math.abs(summary.lastChange) < 0.005
                    ? "No change"
                    : summary.lastChange < 0
                      ? `Down $${Math.abs(summary.lastChange).toFixed(2)}`
                      : `Up $${summary.lastChange.toFixed(2)}`}
                  {summary.lastChangeAt ? (
                    <span className="mt-0.5 block text-xs font-normal text-muted">
                      {summary.lastChangeAt}
                    </span>
                  ) : null}
                </dd>
              </div>
            ) : null}
          </dl>
          <PriceTrendChart points={summary.points} />
          {summary.isIllustrative ? (
            <p className="mt-2 text-xs text-muted">
              Sampled trend for this demo product. Live syncs replace this with real Total Known Cost
              history.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
