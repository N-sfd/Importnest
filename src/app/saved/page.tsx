import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { StatusBanner, StatusPanel, PrimaryAction, SecondaryAction } from "@/components/StatusPanel";
import { WatchlistProductCard } from "@/components/WatchlistProductCard";
import { getOrCreateAppUser } from "@/lib/auth";
import { productImageFor } from "@/lib/images";
import { getUserWatchlist } from "@/lib/saved-data";

const EMPTY_SUGGESTIONS = [
  { id: "cp-apex-ah4200", label: "Apex Quiet Dishwasher" },
  { id: "cp-running-shoe", label: "Stride Velocity Run" },
  { id: "cp-air-purifier", label: "Aura Pure HEPA" },
  { id: "cp-cordless-vacuum", label: "Apex Stick Vacuum" },
] as const;

export default async function SavedPage() {
  const user = await getOrCreateAppUser();
  if (!user) {
    return (
      <PageShell>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Saved products and alerts
        </h1>
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
  const withAlerts = items.filter((i) => i.alertId != null);
  const watching = items.filter((i) => i.status === "watching" || i.status === "triggered").length;
  const triggered = items.filter((i) => i.status === "triggered").length;

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Saved products and alerts
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track price changes across approved sources.
          </p>
        </div>
        {items.length > 0 ? (
          <p className="text-sm text-muted">
            {items.length} {items.length === 1 ? "product" : "products"}
            {watching > 0 ? ` · ${watching} active alerts` : null}
            {triggered > 0 ? ` · ${triggered} triggered` : null}
          </p>
        ) : null}
      </div>

      <div id="alerts" className="scroll-mt-24" />

      {items.length === 0 ? (
        <div className="mt-8 space-y-4">
          <StatusPanel
            title="You have not saved any products yet."
            description="Compare a product, then save it to watch price changes from approved retailers."
            actions={
              <>
                <PrimaryAction href="/">Start shopping</PrimaryAction>
                <SecondaryAction href="/search">Search products</SecondaryAction>
              </>
            }
          >
            <ul className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-3">
              {EMPTY_SUGGESTIONS.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/compare/${p.id}`}
                    className="flex w-[6.5rem] flex-col items-center gap-2 rounded-xl border border-border bg-surface p-2 transition hover:border-accent"
                  >
                    <span className="relative block h-14 w-14 overflow-hidden rounded-lg bg-white">
                      <Image
                        src={productImageFor(p.id)}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </span>
                    <span className="line-clamp-2 text-center text-[11px] font-semibold text-navy-900">
                      {p.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </StatusPanel>
          <StatusBanner
            tone="info"
            title="No alerts yet"
            description="After you save a product, set a target price to get notified when the best known total cost drops."
          />
        </div>
      ) : (
        <>
          {withAlerts.length === 0 ? (
            <div className="mt-6">
              <StatusBanner
                tone="info"
                title="No alerts"
                description="You have saved products, but no price alerts are active. Edit any card to set a target price."
              />
            </div>
          ) : null}
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li key={item.canonicalProductId}>
                <WatchlistProductCard item={item} />
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  );
}
