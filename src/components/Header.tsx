import Link from "next/link";
import { BrandLink } from "@/components/BrandMark";
import { CartNavLink } from "@/components/CartNavLink";
import { CategoryNav } from "@/components/CategoryNav";
import { CompareNavLink } from "@/components/CompareNavLink";
import { HeaderLocation } from "@/components/HeaderLocation";
import { HeaderSearch } from "@/components/HeaderSearch";
import { getAuthUser } from "@/lib/auth";

/** Shared 22px stroke icon style so Saved/Alerts/Account line up visually with Compare/Cart's icons. */
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

/** Icon-always, label-hidden-below-sm nav item — the same compact pattern CompareNavLink/CartNavLink use. */
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
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-semibold text-navy-900 transition hover:bg-navy-100 sm:px-3"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export async function Header({ hideSearch = false }: { hideSearch?: boolean }) {
  const user = await getAuthUser();

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-border bg-white text-navy-900">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:grid lg:grid-cols-[auto_auto_minmax(320px,1fr)_auto] lg:items-center lg:gap-4 lg:px-4">
          <BrandLink logo="logo9" onDark={false} />
          <HeaderLocation />

          {hideSearch ? null : <HeaderSearch />}

          <nav className="order-2 ml-auto flex shrink-0 items-center gap-1 text-sm sm:order-none lg:ml-0">
            <NavLink href={user ? "/saved" : "/login?next=/saved"} icon={<BookmarkIcon />} label="Saved" />
            <NavLink href={user ? "/saved" : "/login?next=/saved"} icon={<BellIcon />} label="Alerts" />
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

      <CategoryNav />
    </header>
  );
}
