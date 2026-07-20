import Image from "next/image";
import {
  categoryDescriptionFor,
  categoryDisplayTitle,
  categoryHasImage,
  categoryImageAlt,
  categoryImageSrc,
  normalizeCategoryKey,
} from "@/lib/category-visuals";
import { getCategoryCollageImages } from "@/lib/images";

export type CategoryVisualCardProps = {
  category: string;
  title?: string;
  description?: string;
  /** Original search query — used to tailor kitchen+appliances copy/collage. */
  query?: string;
  compact?: boolean;
  className?: string;
};

function CategoryPlaceholderIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-muted"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 14.5 10.2 12l2.3 2.3L16.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.25" fill="currentColor" />
    </svg>
  );
}

function resolveCopy(category: string, query: string | undefined, title?: string, description?: string) {
  const key = normalizeCategoryKey(category);
  const q = (query ?? "").toLowerCase();

  if (key === "appliances" && q.includes("kitchen")) {
    return {
      displayTitle: title?.trim() || "Appliances for kitchen needs",
      displayDescription:
        description?.trim() ||
        "Compare kitchen, laundry, cleaning, and home appliance offers from approved sources.",
    };
  }

  return {
    displayTitle: categoryDisplayTitle(category, title),
    displayDescription: categoryDescriptionFor(category, description),
  };
}

/**
 * Compact category visual for clarify / results / empty states.
 * Uses a subtype collage when available so pages feel richer than a single hero.
 */
export function CategoryVisualCard({
  category,
  title,
  description,
  query,
  compact = true,
  className = "",
}: CategoryVisualCardProps) {
  const { displayTitle, displayDescription } = resolveCopy(category, query, title, description);
  const collage = getCategoryCollageImages(category, query).slice(0, 4);
  const heroSrc = categoryImageSrc(category);
  const showHero = Boolean(heroSrc && categoryHasImage(category));
  const useCollage = collage.length >= 4;

  return (
    <aside
      className={`flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 shadow-[var(--shadow-panel)] sm:gap-4 sm:px-4 ${className}`}
      aria-label={`Category: ${displayTitle}`}
    >
      {useCollage ? (
        <div className="category-visual-grid shrink-0" aria-hidden={false}>
          {collage.map((src, i) => (
            <div key={`${src}-${i}`} className="relative overflow-hidden rounded-[10px] border border-border bg-[#F4F7FA]">
              <Image
                src={src}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
                sizes="48px"
              />
            </div>
          ))}
          <span className="sr-only">{displayTitle} category visuals</span>
        </div>
      ) : (
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl border border-border bg-panel ${
            compact ? "h-14 w-14 sm:h-16 sm:w-16" : "h-20 w-20"
          }`}
        >
          {showHero && heroSrc ? (
            <Image
              src={heroSrc}
              alt={categoryImageAlt(category, displayTitle)}
              fill
              className="object-cover"
              sizes={compact ? "64px" : "80px"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-panel">
              <CategoryPlaceholderIcon />
              <span className="sr-only">{displayTitle} category</span>
            </div>
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Category</p>
        <p className="truncate text-sm font-bold text-navy-900 sm:text-base">{displayTitle}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted sm:text-sm">
          {displayDescription}
        </p>
      </div>
    </aside>
  );
}
