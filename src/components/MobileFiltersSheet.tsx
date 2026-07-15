import type { ReactNode } from "react";
import { BottomSheet } from "@/components/BottomSheet";

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
  return (
    <BottomSheet
      title="Filters"
      description="Apply filters to narrow product results. Press Escape to close."
      label={
        <span>
          Filters
          {activeCount > 0 ? (
            <>
              <span aria-hidden> · {activeCount}</span>
              <span className="sr-only">, {activeCount} active</span>
            </>
          ) : null}
        </span>
      }
    >
      {children}
    </BottomSheet>
  );
}
