"use client";

import Link from "next/link";
import { CartIcon } from "@/components/AddToCartButton";
import { useCart } from "@/components/CartProvider";

/** Header nav item for the cart — live unit-count badge, no login required. */
export function CartNavLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-semibold text-navy-900 transition hover:bg-navy-100 sm:px-3"
    >
      <CartIcon />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 ? (
        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
