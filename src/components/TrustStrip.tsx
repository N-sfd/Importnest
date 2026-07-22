import Link from "next/link";

const POINTS = [
  "Approved sources only",
  "Total Known Cost shown clearly",
  "Sponsored results labeled",
  "Price alerts available",
];

/**
 * Slim horizontal trust band placed between homepage product rails — a
 * lighter-weight, always-visible counterpart to `HomeTrustCard` (which only
 * appears as a personalization-rail fallback). Reinforces the same trust
 * message at a natural breather point instead of leaving it to the hero and
 * footer alone.
 */
export function TrustStrip() {
  return (
    <div
      className="home-section flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-border bg-panel px-5 py-4 sm:px-6"
      aria-label="Compare with confidence"
    >
      <p className="text-sm font-bold tracking-tight text-navy-900 sm:shrink-0">
        Compare with confidence
      </p>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted sm:text-sm">
        {POINTS.map((point) => (
          <li key={point} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
      <Link
        href="#approved-sources"
        className="text-xs font-semibold text-link hover:underline sm:text-sm"
      >
        See approved retailers →
      </Link>
    </div>
  );
}
