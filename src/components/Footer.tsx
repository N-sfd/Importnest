import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-navy-900 text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:grid-cols-[1.2fr_1fr_1fr] sm:px-6">
        <div>
          <BrandMark logo="nest" size="xl" showWordmark layout="stacked" onDark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            AI-powered shopping comparison—transparent total cost, delivery, and protection across
            approved retailers.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Explore</p>
          <ul className="mt-3 space-y-2.5 text-sm text-white/80">
            <li>
              <Link href="/" className="transition hover:text-cta">
                How comparison works
              </Link>
            </li>
            <li>
              <Link href="/search?category=appliances" className="transition hover:text-cta">
                Browse appliances
              </Link>
            </li>
            <li>
              <Link href="/compare/cp-apex-ah4200" className="transition hover:text-cta">
                Live demo product
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Account</p>
          <ul className="mt-3 space-y-2.5 text-sm text-white/80">
            <li>
              <Link href="/saved" className="transition hover:text-cta">
                Saved products & alerts
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition hover:text-cta">
                Admin sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} Importnest · AI-Powered Shopping
      </div>
    </footer>
  );
}
