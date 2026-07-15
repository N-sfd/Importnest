"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

type Offer = {
  id: string;
  retailer: string;
  item: number;
  shipping: number;
  fees: number;
  delivery: string;
};

const OFFERS: Offer[] = [
  {
    id: "a",
    retailer: "SportLane",
    item: 124,
    shipping: 0,
    fees: 8.5,
    delivery: "Fri, free",
  },
  {
    id: "b",
    retailer: "RunHouse",
    item: 119.95,
    shipping: 12.99,
    fees: 0,
    delivery: "3–4 days",
  },
  {
    id: "c",
    retailer: "Apex Outlet",
    item: 129,
    shipping: 0,
    fees: 0,
    delivery: "Tomorrow",
  },
];

function total(o: Offer) {
  return o.item + o.shipping + o.fees;
}

/** Interactive hero hook: sticker price ≠ Total Known Cost. */
export function TotalKnownCostHook() {
  const [selected, setSelected] = useState(OFFERS[1]!.id);
  const groupId = useId();
  const ranked = [...OFFERS].sort((a, b) => total(a) - total(b));
  const winner = ranked[0]!;
  const active = OFFERS.find((o) => o.id === selected) ?? winner;
  const activeTotal = total(active);

  return (
    <aside className="relative mt-7 w-full rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm sm:mt-0 sm:max-w-md sm:justify-self-end">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white">
          <Image
            src="/products/running-shoe.png"
            alt=""
            fill
            className="object-contain p-1"
            sizes="56px"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-cta">Total known cost</p>
          <p className="mt-0.5 text-sm font-semibold text-white">Stride Velocity Run · Size 9</p>
          <p className="mt-1 text-xs text-white/65">
            Item + shipping + fees — not just the sticker price.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2" role="radiogroup" aria-labelledby={`${groupId}-label`}>
        <span id={`${groupId}-label`} className="sr-only">
          Compare retailer totals
        </span>
        {OFFERS.map((offer) => {
          const t = total(offer);
          const isWinner = offer.id === winner.id;
          const isOn = offer.id === selected;
          return (
            <li key={offer.id}>
              <button
                type="button"
                role="radio"
                aria-checked={isOn}
                onClick={() => setSelected(offer.id)}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                  isOn
                    ? "border-cta bg-cta/15"
                    : "border-white/10 bg-navy-950/40 hover:border-white/25"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">{offer.retailer}</span>
                    {isWinner ? (
                      <span className="rounded-full bg-cta px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Lowest total
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-white/55">
                    ${offer.item.toFixed(2)} item
                    {offer.shipping > 0 ? ` + $${offer.shipping.toFixed(2)} ship` : " + free ship"}
                    {offer.fees > 0 ? ` + $${offer.fees.toFixed(2)} fees` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-extrabold tabular-nums text-white">
                    ${t.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-white/50">{offer.delivery}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 rounded-xl border border-white/10 bg-navy-950/50 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
          Why totals matter
        </p>
        <p className="mt-1 text-xs leading-relaxed text-white/80">
          {active.retailer} lists at{" "}
          <span className="font-semibold text-white">${active.item.toFixed(2)}</span>
          {active.id === winner.id ? (
            <>
              {" "}
              — and still wins on{" "}
              <span className="font-semibold text-cta">${activeTotal.toFixed(2)}</span> total known
              cost.
            </>
          ) : (
            <>
              , but after shipping/fees the total is{" "}
              <span className="font-semibold text-white">${activeTotal.toFixed(2)}</span>. The
              lowest sticker is not always the lowest final price.
            </>
          )}
        </p>
      </div>

      <Link
        href="/compare/cp-running-shoe"
        className="btn-cta mt-3 w-full px-3 py-2.5 text-center text-sm"
      >
        Open live shoe comparison
      </Link>
    </aside>
  );
}
