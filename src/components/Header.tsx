import Link from "next/link";
import { BrandLink } from "@/components/BrandMark";
import { CategoryNav } from "@/components/CategoryNav";
import { CompareNavLink } from "@/components/CompareNavLink";
import { HeaderLocation } from "@/components/HeaderLocation";
import { HeaderSearch } from "@/components/HeaderSearch";
import { LogoutButton } from "@/components/LogoutButton";
import { getAuthUser } from "@/lib/auth";

export async function Header({ hideSearch = false }: { hideSearch?: boolean }) {
  const user = await getAuthUser();

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-border bg-white text-navy-900">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:flex-nowrap">
          <BrandLink logo="logo9" onDark={false} />
          <HeaderLocation />

          {hideSearch ? null : <HeaderSearch />}

          <nav className="order-2 ml-auto flex shrink-0 items-center gap-1 text-sm sm:order-none">
            <Link
              href={user ? "/saved" : "/login?next=/saved"}
              className="rounded-xl px-2.5 py-1.5 font-semibold text-navy-900 transition hover:bg-navy-100 sm:px-3"
            >
              Saved
            </Link>
            <Link
              href={user ? "/saved" : "/login?next=/saved"}
              className="rounded-xl px-2.5 py-1.5 font-semibold text-navy-900 transition hover:bg-navy-100 sm:px-3"
            >
              Alerts
            </Link>
            <CompareNavLink />
            {user ? (
              <LogoutButton variant="compact" />
            ) : (
              <Link
                href="/login"
                className="rounded-xl px-2.5 py-1.5 font-semibold text-navy-900 transition hover:bg-navy-100 sm:px-3"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>

      <CategoryNav />
    </header>
  );
}
