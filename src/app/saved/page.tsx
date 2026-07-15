import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { productImageFor } from "@/lib/images";
import { prisma } from "@/lib/prisma";

const statusStyle: Record<string, string> = {
  watching: "bg-navy-100 text-navy-900",
  triggered: "bg-amber-100 text-amber-900",
  paused: "bg-surface text-muted ring-1 ring-border",
};

export default async function SavedPage() {
  const alerts = await prisma.alert.findMany({
    where: { userId: "user-demo" },
    include: { canonicalProduct: true },
    orderBy: { id: "asc" },
  });

  const items = await Promise.all(
    alerts.map(async (alert) => {
      const sourceCoverage = await prisma.listing.count({
        where: { canonicalProductId: alert.canonicalProductId },
      });
      const status = alert.isActive
        ? alert.type === "back-in-stock"
          ? "triggered"
          : "watching"
        : "paused";

      return {
        id: alert.id,
        productId: alert.canonicalProductId,
        productName: alert.canonicalProduct.modelName,
        currentValue: "—",
        target: alert.threshold ?? "—",
        status,
        sourceCoverage,
      };
    }),
  );

  return (
    <PageShell>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Saved products and alerts</h1>
      <p className="mt-1 text-sm text-muted">
        Track price, stock, and delivery changes across approved sources.
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
            Compare a product, then save it to watch price and stock changes from approved
            retailers.
          </p>
          <Link href="/" className="btn-cta mt-6 inline-block px-5 py-2.5 text-sm">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="panel offer-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                  <Image
                    src={productImageFor(item.productId)}
                    alt={item.productName}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.productName}</p>
                  <p className="mt-0.5 text-lg font-bold text-price">{item.currentValue}</p>
                  <p className="text-xs text-muted">Target: {item.target}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[item.status]}`}
                >
                  {item.status === "watching"
                    ? `Watching · ${item.sourceCoverage} sources`
                    : item.status === "triggered"
                      ? `Triggered · ${item.sourceCoverage} sources`
                      : "Paused"}
                </span>
                <Link
                  href={`/compare/${item.productId}`}
                  className="btn-cta px-4 py-2 text-xs"
                >
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
