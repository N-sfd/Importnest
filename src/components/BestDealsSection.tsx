import Image from "next/image";
import Link from "next/link";
import { productThumbClass } from "@/lib/images";
import type { BestDealItem } from "@/lib/best-deals";
import { saveProductAction, unsaveProductAction } from "@/lib/saved-actions";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-6.7-4.35-9.33-7.6C.5 10.9 1.1 7.4 3.7 5.7 5.7 4.4 8.2 4.8 10 6.4L12 8.2l2-1.8c1.8-1.6 4.3-2 6.3-.7 2.6 1.7 3.2 5.2 1.03 7.7C18.7 16.65 12 21 12 21z"
      />
    </svg>
  );
}

/** Compact Best Deals grid — light background, real Total Known Cost only. */
export function BestDealsSection({
  items,
  signedIn,
}: {
  items: BestDealItem[];
  signedIn: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section
      className="mt-8 rounded-2xl border border-border bg-surface px-4 py-6 sm:px-6 sm:py-7"
      aria-labelledby="best-deals-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="best-deals-heading"
            className="text-xl font-bold tracking-tight text-navy-900"
          >
            Best Deals
          </h2>
          <p className="mt-1 text-sm text-muted">
            Totals include item + shipping + fees. Struck prices appear only from real price history.
          </p>
        </div>
        <Link
          href="/search?q=deals"
          className="text-sm font-semibold text-link hover:underline"
        >
          See more deals
        </Link>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((item) => (
          <li key={item.productId} className="relative">
            <Link
              href={`/compare/${item.productId}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-panel shadow-sm transition hover:border-accent/40"
            >
              <div className="relative aspect-[4/5] bg-white sm:aspect-square">
                <Image
                  src={item.imageSrc}
                  alt={item.productName}
                  fill
                  className={productThumbClass(item.imageSrc)}
                  sizes="(max-width:640px) 50vw, 16vw"
                />
                <span className="absolute left-2 top-2 rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-white">
                  {item.dealBadge}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3 pr-10">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-navy-900 group-hover:text-link">
                  {item.productName}
                </p>
                <p className="text-[11px] text-muted">{item.brandName}</p>
                <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-1">
                  <p className="text-base font-extrabold tabular-nums text-navy-900">
                    ${item.currentTotal.toFixed(2)}
                  </p>
                  {item.previousTotal != null ? (
                    <p className="text-xs tabular-nums text-muted line-through">
                      ${item.previousTotal.toFixed(2)}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>

            {signedIn ? (
              <form
                action={
                  item.isSaved
                    ? unsaveProductAction.bind(null, item.productId, "/")
                    : saveProductAction.bind(null, item.productId, "/")
                }
                className="absolute right-2 top-2 z-10"
              >
                <button
                  type="submit"
                  aria-label={item.isSaved ? `Unsave ${item.productName}` : `Save ${item.productName}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-panel/95 shadow-sm transition hover:border-accent ${
                    item.isSaved ? "text-cta" : "text-navy-900"
                  }`}
                >
                  <HeartIcon filled={item.isSaved} />
                </button>
              </form>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(`/compare/${item.productId}`)}`}
                aria-label={`Sign in to save ${item.productName}`}
                className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-panel/95 text-navy-900 shadow-sm transition hover:border-accent"
              >
                <HeartIcon filled={false} />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
