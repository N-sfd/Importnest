import Link from "next/link";
import { Suspense } from "react";
import { BrandLink } from "@/components/BrandMark";
import { CartNavLink } from "@/components/CartNavLink";
import { CategoryNav } from "@/components/CategoryNav";
import { CompareNavLink } from "@/components/CompareNavLink";
import { HeaderLocation } from "@/components/HeaderLocation";
import { HeaderSearch } from "@/components/HeaderSearch";
import { getAuthUser } from "@/lib/auth";

/** Shared 16px stroke icons for Saved / Alerts / Account. */
const navIconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function BookmarkIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M18 8a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14 18 8z" />
      <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...navIconProps}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link href={href} className="header-action">
      {icon}
      <span className="label">{label}</span>
    </Link>
  );
}

export async function Header({ hideSearch = false }: { hideSearch?: boolean }) {
  const user = await getAuthUser();

  return (
    <header className="sticky top-0 z-40 overflow-visible">
      <div className="header-top border-b border-border bg-white text-navy-900 overflow-visible">
        <div className="header-top-inner header-container">
          <div className="header-logo header-logo-wrapper shrink-0 overflow-visible">
            <BrandLink logo="logo9" />
          </div>

          <HeaderLocation />

          {hideSearch ? <div className="header-search" aria-hidden /> : <HeaderSearch />}

          <nav className="header-actions" aria-label="Account and shopping">
            <NavLink
              href={user ? "/saved" : "/login?next=/saved"}
              icon={<BookmarkIcon />}
              label="Saved"
            />
            <NavLink
              href={user ? "/saved" : "/login?next=/saved"}
              icon={<BellIcon />}
              label="Alerts"
            />
            <CompareNavLink />
            <CartNavLink />
            {user ? (
              <NavLink href="/account" icon={<UserIcon />} label="Account" />
            ) : (
              <NavLink href="/login" icon={<UserIcon />} label="Sign in" />
            )}
          </nav>
        </div>
      </div>

      <Suspense fallback={<div className="category-nav border-b border-black/10" aria-hidden />}>
        <CategoryNav />
      </Suspense>
    </header>
  );
}
