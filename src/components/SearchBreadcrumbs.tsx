import Link from "next/link";
import { categoryDisplayTitle } from "@/lib/category-visuals";

/** Home › Category › Query trail for search results. */
export function SearchBreadcrumbs({
  category,
  query,
}: {
  category?: string | null;
  query?: string | null;
}) {
  const parts: { label: string; href?: string }[] = [{ label: "Home", href: "/" }];

  if (category) {
    parts.push({
      label: categoryDisplayTitle(category),
      href: `/search/results?category=${encodeURIComponent(category)}`,
    });
  } else {
    parts.push({ label: "Search results", href: "/search/results" });
  }

  if (query?.trim()) {
    parts.push({ label: query.trim() });
  }

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {parts.map((part, i) => (
          <li key={`${part.label}-${i}`} className="inline-flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden="true">›</span> : null}
            {part.href && i < parts.length - 1 ? (
              <Link href={part.href} className="font-semibold text-link hover:underline">
                {part.label}
              </Link>
            ) : (
              <span className="font-semibold text-navy-900">{part.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
