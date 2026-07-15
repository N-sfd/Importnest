import Link from "next/link";

/** Teaser for price alerts / save search — motivates account creation. */
export function PriceAlertTeaser({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-navy-900 to-navy-800 px-5 py-6 text-white shadow-[var(--shadow-panel)] sm:px-7 sm:py-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-cta">
            Multi-day decisions
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Track Total Known Cost — get notified when it drops
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Save a product or search, set a price alert, and Importnest watches approved retailers
            for you. When item + shipping + fees fall, you hear about it first.
          </p>
          <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80">
            <span className="rounded-full bg-cta/25 px-2 py-0.5 font-bold text-cta">Example</span>
            <span>
              Alert: Apex dishwasher · total under <strong className="text-white">$860</strong>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {signedIn ? (
            <>
              <Link href="/saved" className="btn-cta px-5 py-2.5 text-center text-sm">
                Open saved & alerts
              </Link>
              <Link
                href="/compare/cp-apex-ah4200"
                className="text-center text-sm font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline"
              >
                Try Track Price on a live product →
              </Link>
            </>
          ) : (
            <>
              <Link href="/login?next=/saved" className="btn-cta px-5 py-2.5 text-center text-sm">
                Create free alerts
              </Link>
              <Link
                href="/compare/cp-apex-ah4200"
                className="text-center text-sm font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline"
              >
                Preview Track Price without signing in →
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
