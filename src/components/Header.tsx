import Link from "next/link";

export function Header() {
  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-wide">
          IMPORTNEST
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/compare/cp-apex-ah4200" className="hover:text-white/80">
            Compare
          </Link>
          <Link href="/saved" className="hover:text-white/80">
            Saved
          </Link>
          <Link href="/admin/match-review" className="hover:text-white/80">
            Account
          </Link>
        </nav>
      </div>
    </header>
  );
}
