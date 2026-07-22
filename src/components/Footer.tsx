import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-navy-900 text-white">
      <div className="footer-inner mx-auto grid max-w-[1200px] gap-10 py-12 sm:grid-cols-[minmax(0,1.35fr)_1fr_1fr_1fr]">
        <div className="footer-brand min-w-0">
          <BrandMark logo="logo9" onDark height={64} className="footer-logo" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            AI-powered shopping comparison—transparent total cost, delivery, and protection across
            approved retailers.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Explore</p>
          <ul className="mt-3 space-y-2.5 text-sm text-white/80">
            <li>
              <Link href="/how-to-use" className="transition hover:text-cta">
                How Importnest works
              </Link>
            </li>
            <li>
              <Link href="/search?category=appliances" className="transition hover:text-cta">
                Browse appliances
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
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Trust</p>
          <ul className="mt-3 space-y-2.5 text-sm text-white/80">
            <li>
              <Link href="/how-ranking-works" className="transition hover:text-cta">
                How ranking works
              </Link>
            </li>
            <li>
              <Link href="/data-freshness" className="transition hover:text-cta">
                Data freshness policy
              </Link>
            </li>
            <li>
              <Link href="/affiliate-disclosure" className="transition hover:text-cta">
                Affiliate disclosure
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:text-cta">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition hover:text-cta">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/report-incorrect-information" className="transition hover:text-cta">
                Report incorrect information
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
