import Image from "next/image";
import {
  categoryDescriptionFor,
  categoryDisplayTitle,
  categoryHasImage,
  categoryImageAlt,
  categoryImageSrc,
} from "@/lib/category-visuals";

export type CategoryVisualCardProps = {
  category: string;
  title?: string;
  description?: string;
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

/**
 * Compact category visual for clarify / results / empty states.
 * Supports the page with imagery — text still carries the meaning.
 */
export function CategoryVisualCard({
  category,
  title,
  description,
  compact = true,
  className = "",
}: CategoryVisualCardProps) {
  const displayTitle = categoryDisplayTitle(category, title);
  const displayDescription = categoryDescriptionFor(category, description);
  const src = categoryImageSrc(category);
  const showImage = Boolean(src && categoryHasImage(category));
  const size = compact ? "h-14 w-14 sm:h-16 sm:w-16" : "h-20 w-20";

  return (
    <aside
      className={`flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 shadow-[var(--shadow-panel)] sm:gap-4 sm:px-4 ${className}`}
      aria-label={`Category: ${displayTitle}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl border border-border bg-panel ${size}`}
      >
        {showImage && src ? (
          <Image
            src={src}
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
