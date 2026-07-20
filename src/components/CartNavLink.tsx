"use client";

import Link from "next/link";
import { CartIcon } from "@/components/AddToCartButton";
import { useCart } from "@/components/CartProvider";

/** Header nav item for the cart — live unit-count badge, no login required. */
export function CartNavLink() {
  const { count } = useCart();

  return (
    <Link href="/cart" className="header-action" aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}>
      <span className="relative inline-flex overflow-visible p-1">
        <CartIcon />
        {count > 0 ? (
          <span className="header-action-badge">{count > 99 ? "99+" : count}</span>
        ) : null}
      </span>
      <span className="label header-action-label">Cart</span>
    </Link>
  );
}
