"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Priority = "lowest-cost" | "fastest";

type DemoOffer = {
  id: string;
  retailer: string;
  total: number;
  delivery: string;
  pickup: boolean;
  image: string;
};

const DEMO_OFFERS: DemoOffer[] = [
  {
    id: "official",
    retailer: "Apex Home Store",
    total: 899,
    delivery: "Thu, free",
    pickup: false,
    image: "/images/products/dishwasher.png",
  },
  {
    id: "retail",
    retailer: "Best Buy",
    total: 879.99,
    delivery: "Tomorrow",
    pickup: false,
    image: "/images/products/dishwasher.png",
  },
  {
    id: "local",
    retailer: "Local Apex Dealer",
    total: 842,
    delivery: "Pickup today",
    pickup: true,
    image: "/images/products/dishwasher.png",
  },
];

function sortOffers(priority: Priority) {
  const copy = [...DEMO_OFFERS];
  if (priority === "fastest") {
    return copy.sort((a, b) => Number(b.pickup) - Number(a.pickup) || a.total - b.total);
  }
  return copy.sort((a, b) => a.total - b.total);
}

/** Mid-page interactive compare demo — try ranking before searching. */
export function HomepageCompareDemo() {
  const [priority, setPriority] = useState<Priority>("lowest-cost");
  const sorted = useMemo(() => sortOffers(priority), [priority]);
  const top = sorted[0]!;

  return (
    <section className="panel mt-8 overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent">Try it live</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
            Compare demo — same dishwasher, three totals
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Toggle how Importnest ranks offers. Lowest sticker price is not always the best fit.
          </p>
        </div>
        <Link
          href="/compare/cp-apex-ah4200"
          className="text-sm font-semibold text-link hover:underline"
        >
          Full comparison →
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Ranking priority">
        <button
          type="button"
          aria-pressed={priority === "lowest-cost"}
          onClick={() => setPriority("lowest-cost")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
            priority === "lowest-cost"
              ? "bg-cta text-white"
              : "border border-border bg-surface text-muted hover:border-accent hover:text-foreground"
          }`}
        >
          Lowest total cost
        </button>
        <button
          type="button"
          aria-pressed={priority === "fastest"}
          onClick={() => setPriority("fastest")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
            priority === "fastest"
              ? "bg-cta text-white"
              : "border border-border bg-surface text-muted hover:border-accent hover:text-foreground"
          }`}
        >
          Fastest shipping
        </button>
      </div>

      <ul className="mt-4 space-y-2.5">
        {sorted.map((offer, index) => {
          const isTop = offer.id === top.id;
          return (
            <li
              key={offer.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                isTop ? "border-cta/50 bg-cta/10" : "border-border bg-surface"
              }`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                <Image src={offer.image} alt="" fill className="object-contain p-1" sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{offer.retailer}</p>
                  {isTop ? (
                    <span className="rounded-full bg-cta px-2 py-0.5 text-[10px] font-bold text-white">
                      {priority === "fastest" ? "Fastest" : "Best total"}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted">#{index + 1}</span>
                  )}
                </div>
                <p className="text-xs text-muted">{offer.delivery}</p>
              </div>
              <p className="shrink-0 text-right text-base font-extrabold tabular-nums text-foreground">
                ${offer.total.toFixed(2)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
