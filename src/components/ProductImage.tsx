"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  BRAND_FALLBACK_IMAGE,
  categoryFallbackImage,
  getProductDisplayImage,
  productImageAlt,
  productThumbClass,
  subtypeFallbackImage,
  type ProductImageSource,
} from "@/lib/product-images";

export type ProductImageProps = {
  src?: string | null;
  alt?: string;
  category?: string | null;
  subtype?: string | null;
  title?: string | null;
  subtitle?: string | null;
  className?: string;
  /** Extra classes for the wrapping frame (background / radius). */
  frameClassName?: string;
  /** Visual size preset — maps to shared CSS helpers. */
  size?: "card" | "compact" | "result" | "summary" | "fill";
  /** Next/Image sizes attribute when using fill. */
  sizes?: string;
  priority?: boolean;
  /** Optional product bag used to rebuild the fallback chain. */
  product?: ProductImageSource;
};

function buildFallbackChain(opts: {
  src?: string | null;
  category?: string | null;
  subtype?: string | null;
  title?: string | null;
  subtitle?: string | null;
  product?: ProductImageSource;
}): string[] {
  const chain: string[] = [];
  const push = (value?: string | null) => {
    const v = value?.trim();
    if (v && !chain.includes(v)) chain.push(v);
  };

  push(opts.src);
  if (opts.product) {
    push(getProductDisplayImage(opts.product));
  }
  if (opts.subtype && opts.category) {
    push(
      subtypeFallbackImage(opts.category, opts.title, opts.subtitle, [opts.subtype]),
    );
  }
  push(subtypeFallbackImage(opts.category ?? undefined, opts.title, opts.subtitle, opts.subtype ? [opts.subtype] : null));
  if (opts.category) push(categoryFallbackImage(opts.category));
  push(BRAND_FALLBACK_IMAGE);
  return chain.length > 0 ? chain : [BRAND_FALLBACK_IMAGE];
}

function frameClassFor(size: ProductImageProps["size"]) {
  switch (size) {
    case "compact":
      return "compact-product-image";
    case "result":
      return "result-product-image";
    case "summary":
      return "relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-[#F7FAFC] sm:h-36 sm:w-36";
    case "fill":
      return "relative h-full w-full overflow-hidden bg-[#F7FAFC]";
    case "card":
    default:
      return "product-card-image";
  }
}

/**
 * Product thumbnail with automatic onError fallback:
 * src → subtype → category → brand mark. Never leaves a broken image icon.
 */
export function ProductImage({
  src,
  alt,
  category,
  subtype,
  title,
  subtitle,
  className = "",
  frameClassName = "",
  size = "card",
  sizes = "(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw",
  priority = false,
  product,
}: ProductImageProps) {
  const chain = useMemo(
    () =>
      buildFallbackChain({
        src,
        category,
        subtype,
        title,
        subtitle,
        product,
      }),
    [src, category, subtype, title, subtitle, product],
  );
  const [index, setIndex] = useState(0);
  const current = chain[Math.min(index, chain.length - 1)] ?? BRAND_FALLBACK_IMAGE;
  const resolvedAlt =
    alt?.trim() ||
    productImageAlt({
      title,
      categorySlug: category,
      subtype,
      ...product,
    });

  return (
    <div className={`${frameClassFor(size)} ${frameClassName}`.trim()}>
      <Image
        src={current}
        alt={resolvedAlt}
        fill
        priority={priority}
        sizes={sizes}
        className={`${productThumbClass(current)} ${className}`.trim()}
        onError={() => {
          setIndex((i) => (i + 1 < chain.length ? i + 1 : i));
        }}
      />
    </div>
  );
}
