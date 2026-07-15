"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

/**
 * Shared mobile-only bottom sheet: a trigger button that opens a focus-trapped,
 * Escape-to-close modal panel anchored to the bottom of the screen. Desktop
 * and tablet callers render their own inline UI instead — this component is
 * hidden at `lg` and up so it never changes the desktop layout.
 */
export function BottomSheet({
  label,
  title,
  description,
  children,
}: {
  /** Trigger button content (left side; "Open" is appended automatically). */
  label: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
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
        className="flex min-h-11 w-full items-center justify-between rounded-lg border border-border bg-panel px-4 py-3 text-sm font-semibold text-navy-900 shadow-[var(--shadow-panel)]"
      >
        {label}
        <span className="font-semibold text-link">Open</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-navy-900/40"
            aria-label={`Close ${title.toLowerCase()}`}
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
                  {title}
                </h2>
                <p id={descId} className="text-xs text-muted">
                  {description}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="min-h-11 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-navy-900"
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
