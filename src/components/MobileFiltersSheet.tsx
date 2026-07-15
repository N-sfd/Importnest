"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

/**
 * Mobile-only bottom sheet for search filters. Desktop keeps the left sidebar.
 */
export function MobileFiltersSheet({
  children,
  activeCount = 0,
}: {
  children: ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useFocusTrap(open, panelRef, close);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex w-full items-center justify-between rounded-lg border border-border bg-panel px-4 py-3 text-sm font-semibold text-navy-900 shadow-[var(--shadow-panel)]"
      >
        <span>
          Filters
          {activeCount > 0 ? (
            <>
              <span aria-hidden> · {activeCount}</span>
              <span className="sr-only">, {activeCount} active</span>
            </>
          ) : null}
        </span>
        <span className="font-semibold text-link">Open</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-navy-900/40"
            aria-label="Close filters"
            tabIndex={-1}
            onClick={close}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative max-h-[85vh] overflow-y-auto rounded-t-2xl border border-border bg-white p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 id={titleId} className="text-base font-bold text-navy-900">
                  Filters
                </h2>
                <p id={descId} className="text-xs text-muted">
                  Apply filters to narrow product results. Press Escape to close.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-navy-900"
              >
                Done
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
