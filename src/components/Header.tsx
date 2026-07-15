import Link from "next/link";
import { BrandLink } from "@/components/BrandMark";
import { LogoutButton } from "@/components/LogoutButton";
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
          <BrandLink logo="in" />

          <form
            action="/search"
            className="flex min-w-0 flex-1 items-center overflow-hidden rounded-full bg-white focus-within:ring-2 focus-within:ring-ring"
          >
            <label htmlFor="header-q" className="sr-only">
              Search Importnest
            </label>
            <input
              id="header-q"
              name="q"
              type="search"
              placeholder="Search products, models, or UPCs"
              className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted sm:px-4"
            />
            <button
              type="submit"
              className="btn-cta m-1 h-9 shrink-0 px-3.5 text-sm leading-none sm:px-4"
            >
              Search
            </button>
          </form>

          <nav className="flex shrink-0 items-center gap-1 text-sm sm:gap-2">
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
