"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  categoryDescriptionFor,
  categoryDisplayTitle,
  normalizeCategoryKey,
} from "@/lib/category-visuals";
import { getCategorySubtypeChips } from "@/data/category-demo-products";

/**
 * Category browse intro: title, short description, and subtype icon chips.
 */
export function CategoryBrowseHeader({ categorySlug }: { categorySlug: string }) {
  const searchParams = useSearchParams();
  const activeSubtype = (searchParams.get("q") ?? "").trim().toLowerCase();
  const title = categoryDisplayTitle(categorySlug);
  const description = categoryDescriptionFor(categorySlug);
  const chips = getCategorySubtypeChips(categorySlug);
  const key = normalizeCategoryKey(categorySlug);

  if (chips.length === 0) {
    return (
      <header className="category-browse-header">
        <h1 className="category-browse-title">{title}</h1>
        <p className="category-browse-description">{description}</p>
      </header>
    );
  }

  return (
    <header className="category-browse-header" aria-labelledby="category-browse-title">
      <h1 id="category-browse-title" className="category-browse-title">
        {title}
      </h1>
      <p className="category-browse-description">{description}</p>

      <ul className="category-subtype-strip mt-4" aria-label={`${title} subcategories`}>
        {chips.map((chip) => {
          const selected =
            activeSubtype === chip.subtype.toLowerCase() ||
            activeSubtype === chip.label.toLowerCase();
          return (
            <li key={`${key}-${chip.subtype}`}>
              <Link
                href={`/search/results?q=${encodeURIComponent(chip.subtype)}&category=${encodeURIComponent(categorySlug)}`}
                className={`category-subtype-chip ${selected ? "category-subtype-chip-active" : ""}`}
              >
                <span className="category-subtype-thumb">
                  <Image
                    src={chip.image}
                    alt=""
                    width={28}
                    height={28}
                    unoptimized
                    className="h-7 w-7 object-contain"
                  />
                </span>
                <span>{chip.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </header>
  );
}
