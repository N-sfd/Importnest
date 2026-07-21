"use client";

import { useEffect, useId, useState } from "react";
import { BackendLinks } from "@/components/BackendLinks";

/**
 * Dev-only entry to Prisma Studio / Supabase — kept out of the consumer footer.
 * Visible only when NODE_ENV=development or NEXT_PUBLIC_SHOW_DEV_TOOLS=true.
 */
export function DevToolsModal() {
  const enabled =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === "true";
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enabled, open]);

  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="dev-tools-fab"
        title="Developer tools"
        aria-label="Open developer tools"
      >
        Dev
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="dev-tools-backdrop"
            aria-label="Close developer tools"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Developer tools"
            className="dev-tools-modal"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-navy-900">Developer tools</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <BackendLinks compact className="mt-3" />
          </div>
        </>
      ) : null}
    </>
  );
}
