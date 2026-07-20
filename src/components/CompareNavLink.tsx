"use client";

import Link from "next/link";
import { CompareIcon } from "@/components/AddToCompareButton";
import { useCompareBasket } from "@/components/CompareBasketProvider";

/** Header nav item for the compare basket — live count badge, no login required. */
export function CompareNavLink() {
  const { count } = useCompareBasket();

  return (
    <Link href="/compare/list" className="header-action">
      <span className="relative inline-flex">
        <CompareIcon />
        {count > 0 ? (
          <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="label">Compare</span>
    </Link>
  );
}
