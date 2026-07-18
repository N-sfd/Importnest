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
      className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-semibold text-navy-900 transition hover:bg-navy-100 sm:px-3"
    >
      <CompareIcon />
      Compare
      {count > 0 ? (
        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
