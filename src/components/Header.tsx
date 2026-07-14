import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 hover:opacity-90">
          <Image
            src="/brand/logo.svg"
            alt="Importnest"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="hidden text-lg font-bold tracking-wide sm:inline">IMPORTNEST</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
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
