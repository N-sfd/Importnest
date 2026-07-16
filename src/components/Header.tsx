import Link from "next/link";
import { BrandLink } from "@/components/BrandMark";
import { CategoryNav } from "@/components/CategoryNav";
import { HeaderLocation } from "@/components/HeaderLocation";
import { HeaderSearch } from "@/components/HeaderSearch";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAuthUser } from "@/lib/auth";

export async function Header() {
  const user = await getAuthUser();

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-white/10 bg-navy-900 text-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-2 px-3 py-3 sm:flex-nowrap sm:gap-3 sm:px-4">
          <BrandLink logo="logo9" />
          <HeaderLocation />

          <HeaderSearch />

          <nav className="order-2 ml-auto flex shrink-0 items-center gap-0.5 text-sm sm:order-none sm:gap-1">
            <ThemeToggle />
            <Link
              href="/saved"
              className="rounded-xl px-2.5 py-1.5 transition hover:bg-white/10 sm:px-3"
            >
              <span className="block text-[10px] font-medium uppercase tracking-wider text-white/55">
                Lists
              </span>
              <span className="font-semibold leading-tight">Saved</span>
            </Link>
            <Link
              href={user ? "/saved" : "/login?next=/saved"}
              className="rounded-xl px-2.5 py-1.5 transition hover:bg-white/10 sm:px-3"
            >
              <span className="block text-[10px] font-medium uppercase tracking-wider text-white/55">
                Prices
              </span>
              <span className="font-semibold leading-tight">Alerts</span>
            </Link>
            {user ? (
              <LogoutButton variant="compact" />
            ) : (
              <Link
                href="/login"
                className="rounded-xl px-2.5 py-1.5 transition hover:bg-white/10 sm:px-3"
              >
                <span className="block text-[10px] font-medium uppercase tracking-wider text-white/55">
                  Account
                </span>
                <span className="font-semibold leading-tight">Sign in</span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      <CategoryNav />
    </header>
  );
}
