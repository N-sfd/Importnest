"use client";

import Link from "next/link";
import { CartIcon } from "@/components/AddToCartButton";
import { useCart } from "@/components/CartProvider";

/** Header nav item for the cart — live unit-count badge, no login required. */
export function CartNavLink() {
  const { count } = useCart();

  return (
    <Link href="/cart" className="header-action">
      <span className="relative inline-flex">
        <CartIcon />
        {count > 0 ? (
          <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="label">Cart</span>
    </Link>
  );
}
