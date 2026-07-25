"use client";

import { useEffect } from "react";

/** Shared floating confirmation shell — bottom bar on mobile, bottom-right card on desktop. */
export function Toast({
  onDismiss,
  children,
}: {
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fade-up fixed inset-x-0 bottom-0 z-50 border-t border-border bg-panel p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgb(15_42_74/0.12)] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:max-w-sm sm:rounded-2xl sm:border sm:p-4 sm:shadow-lg"
    >
      {children}
    </div>
  );
}
