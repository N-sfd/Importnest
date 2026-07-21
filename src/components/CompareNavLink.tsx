"use client";

import Link from "next/link";
import { CompareIcon } from "@/components/AddToCompareButton";
import { useCompareBasket } from "@/components/CompareBasketProvider";

/** Header nav item for the compare basket — live count badge, no login required. */
export function CompareNavLink() {
  const { count } = useCompareBasket();

  return (
    <Link
      href="/compare/list"
      className="header-action"
      aria-label={`Compare${count > 0 ? `, ${count} items` : ""}`}
    >
      <span className="relative inline-flex overflow-visible p-1">
        <CompareIcon />
        {count > 0 ? (
          <span className="header-action-badge">{count > 99 ? "99+" : count}</span>
        ) : null}
      </span>
      <span className="label header-action-label">Compare</span>
    </Link>
  );
}
