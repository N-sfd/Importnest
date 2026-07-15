import { describePriceHistoryForScreenReaders, type ProductPriceHistorySummary } from "@/lib/compare-data";
import { formatPriceChange } from "@/lib/price-change";

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

/**
 * Price history for the comparison page — real PriceHistory records only.
 * A product with fewer than two valid, in-window daily prices shows the
 * honest "not enough checks yet" message instead of a chart; nothing here is
 * ever interpolated or invented to fill the gap.
 */
export function PriceHistorySection({ summary }: { summary: ProductPriceHistorySummary }) {
  const hasChart = summary.points.length >= 2;
  const change = formatPriceChange(summary.lastChange);

  return (
    <section className="panel mt-4 p-4 sm:p-6">
      <h2 className="text-lg font-bold tracking-tight text-foreground">Price history</h2>
      {!hasChart ? (
        <p className="mt-3 text-sm text-muted">
          Price history will appear after more price checks.
        </p>
      ) : (
        <>
          <p className="sr-only">{describePriceHistoryForScreenReaders(summary)}</p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summary.currentLowest != null ? (
              <div>
                <dt className="text-xs font-medium text-muted">Current lowest</dt>
                <dd className="mt-0.5 text-base font-bold tabular-nums text-price">
                  ${summary.currentLowest.toFixed(2)}
                </dd>
              </div>
            ) : null}
            {summary.previousLowest != null ? (
              <div>
                <dt className="text-xs font-medium text-muted">Previous lowest price</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
                  ${summary.previousLowest.toFixed(2)}
                </dd>
              </div>
            ) : null}
            {summary.thirtyDayLow != null ? (
              <div>
                <dt className="text-xs font-medium text-muted">30-day low</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
                  ${summary.thirtyDayLow.toFixed(2)}
                </dd>
              </div>
            ) : null}
            {change ? (
              <div>
                <dt className="text-xs font-medium text-muted">Last price change</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
                  {change.text}
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
        </>
      )}
    </section>
  );
}
