import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { productImageFor } from "@/lib/images";
import { getOrCreateAppUser } from "@/lib/auth";
import { getUserWatchlist } from "@/lib/saved-data";
import { removeAlertAction, toggleAlertActiveAction, unsaveProductAction } from "@/lib/saved-actions";

const statusStyle: Record<string, string> = {
  watching: "bg-navy-100 text-navy-900",
  triggered: "bg-amber-100 text-amber-900",
  paused: "bg-surface text-muted ring-1 ring-border",
};

const statusLabel: Record<string, string> = {
  watching: "Watching",
  triggered: "Price drop!",
  paused: "Paused",
};

export default async function SavedPage() {
  // Middleware already redirects unauthenticated visitors to /login, but a
  // page-level check keeps this route safe even if reached another way.
  const user = await getOrCreateAppUser();
  if (!user) {
    return (
      <PageShell>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Saved products and alerts</h1>
        <p className="mt-4 text-sm text-muted">
          <Link href="/login?next=/saved" className="font-medium text-link hover:underline">
            Sign in
          </Link>{" "}
          to see your saved products and price alerts.
        </p>
      </PageShell>
    );
  }

  const items = await getUserWatchlist(user.id);
  const redirectTo = "/saved";

  return (
    <PageShell>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Saved products and alerts</h1>
      <p className="mt-1 text-sm text-muted">
        Track price changes across approved sources.
      </p>

      {items.length === 0 ? (
        <div className="panel mt-8 px-6 py-12 text-center">
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={56}
            height={56}
            className="mx-auto rounded-xl border border-border bg-white p-1"
          />
          <h2 className="mt-4 text-lg font-semibold">Nothing saved yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Compare a product, then save it to watch price changes from approved retailers.
          </p>
          <Link href="/" className="btn-cta mt-6 inline-block px-5 py-2.5 text-sm">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.canonicalProductId}
              className="panel offer-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                  <Image
                    src={productImageFor(item.canonicalProductId)}
                    alt={item.productName}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.productName}</p>
                  <p className="mt-0.5 text-lg font-bold text-price">
                    {item.currentPrice != null ? `$${item.currentPrice.toFixed(2)}` : "Unavailable"}
                  </p>
                  {item.threshold && (
                    <p className="text-xs text-muted">Notify below: ${item.threshold}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.alertId && item.alertType && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[item.status]}`}
                  >
                    {statusLabel[item.status]} · {item.sourceCoverage} sources
                  </span>
                )}
                {item.alertId && item.alertType && (
                  <>
                    <form
                      action={toggleAlertActiveAction.bind(null, item.canonicalProductId, item.alertType, redirectTo)}
                    >
                      <button
                        type="submit"
                        className="min-h-11 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-navy-800"
                      >
                        {item.status === "paused" ? "Resume" : "Pause"}
                      </button>
                    </form>
                    <form
                      action={removeAlertAction.bind(null, item.canonicalProductId, item.alertType, redirectTo)}
                    >
                      <button
                        type="submit"
                        className="min-h-11 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-navy-800"
                      >
                        Remove alert
                      </button>
                    </form>
                  </>
                )}
                {item.savedProductId && (
                  <form action={unsaveProductAction.bind(null, item.canonicalProductId, redirectTo)}>
                    <button
                      type="submit"
                      className="min-h-11 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-navy-800"
                    >
                      Unsave
                    </button>
                  </form>
                )}
                <Link href={`/compare/${item.canonicalProductId}`} className="btn-cta px-4 py-2 text-xs">
                  View comparison
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
