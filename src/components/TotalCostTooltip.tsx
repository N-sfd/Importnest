"use client";

import { useId, useState } from "react";
import { formatCostBreakdownLine, type CostBreakdownInput } from "@/lib/cost-breakdown";

function line(value: CostBreakdownInput, signed = false) {
  return formatCostBreakdownLine(value, { signed }).text;
}

/**
 * Compact Total Known Cost with hover/focus (desktop) and tap (mobile) breakdown.
 * Uses only real stored line items — never fabricates $0.00 for missing values.
 */
export function TotalCostTooltip({
  itemPrice,
  shipping,
  mandatoryFees,
  verifiedDiscount,
  total,
}: {
  itemPrice: CostBreakdownInput;
  shipping: CostBreakdownInput;
  mandatoryFees: CostBreakdownInput;
  verifiedDiscount: CostBreakdownInput;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const tipId = useId();

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={tipId}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg px-1 py-0.5 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="block text-[10px] font-bold uppercase tracking-wider text-accent">
          Total known cost
        </span>
        <span className="text-lg font-extrabold tabular-nums text-navy-900 underline decoration-dotted decoration-muted underline-offset-4">
          ${total.toFixed(2)}
        </span>
      </button>

      {open ? (
        <div
          id={tipId}
          role="tooltip"
          className="absolute left-0 top-full z-30 mt-2 w-[15.5rem] rounded-xl border border-border bg-panel p-3 text-xs shadow-[var(--shadow-panel)]"
        >
          <dl className="space-y-1.5 font-mono tabular-nums">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Base price</dt>
              <dd className="font-semibold text-navy-900">{line(itemPrice)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-semibold text-navy-900">{line(shipping)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Fees/taxes</dt>
              <dd className="font-semibold text-navy-900">{line(mandatoryFees)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Discount</dt>
              <dd className="font-semibold text-navy-900">{line(verifiedDiscount, true)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-border pt-1.5">
              <dt className="font-bold text-navy-900">Total</dt>
              <dd className="font-extrabold text-navy-900">${total.toFixed(2)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[10px] leading-snug text-muted">
            Taxes may be calculated at checkout if not available here.
          </p>
        </div>
      ) : null}
    </div>
  );
}
