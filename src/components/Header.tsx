import Link from "next/link";
import { BrandLink } from "@/components/BrandMark";
import { HeaderSearch } from "@/components/HeaderSearch";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAuthUser } from "@/lib/auth";

const categories = [
  { name: "Electronics", href: "/search?category=electronics" },
  { name: "Appliances", href: "/search?category=appliances" },
  { name: "Footwear", href: "/search?category=footwear" },
  { name: "Home", href: "/search?category=home" },
];

export async function Header() {
  const user = await getAuthUser();

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-white/10 bg-navy-900/95 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-3 py-3 sm:gap-5 sm:px-4">
          <BrandLink logo="nest" />

          <HeaderSearch />

          <nav className="ml-auto flex shrink-0 items-center gap-0.5 text-sm sm:gap-1">
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

      <div className="border-b border-border bg-navy-800 text-white/95">
        <div className="mx-auto flex max-w-[1200px] items-center gap-1 overflow-x-auto px-3 py-2 text-sm sm:px-4">
          <Link
            href="/compare/cp-apex-ah4200"
            className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-cta"
          >
            Live demo
          </Link>
          {categories.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="shrink-0 rounded-lg px-2.5 py-1 text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
