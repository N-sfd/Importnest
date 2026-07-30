import Image from "next/image";
import Link from "next/link";

const SIZES = {
  sm: { fullH: 36, icon: 28 },
  md: { fullH: 48, icon: 36 },
  lg: { fullH: 64, icon: 48 },
  xl: { fullH: 96, icon: 72 },
  /** Footer marketing lockup — tweak via `height` prop or FOOTER_LOGO_HEIGHT */
  footer: { fullH: 110, icon: 48 },
} as const;

/** Default footer logo height in px — change here or pass `height` on BrandMark. */
export const FOOTER_LOGO_HEIGHT = 110;

export type BrandLogo = "in" | "nest" | "logo9" | "logo1" | "logo2";
export type BrandLayout = "horizontal" | "stacked" | "header";

/**
 * Brand assets:
 * - header  → icon + IMPORTNEST only (no tagline) — top navigation
 * - full    → icon + wordmark + tagline — footer / hero / marketing
 * - logo1   → full lockup on navy plate (footer / dark surfaces)
 * - logo2   → full lockup on light plate (light surfaces)
 * - icon    → mark only — favicon / mobile compact
 */
const ASSETS = {
  /** Navy-plate full lockup (icon + IMPORTNEST + tagline) — preferred for dark footer */
  logo1: {
    header: "/brand/importnest-header-logo-v3.png",
    horizontal: "/brand/importnest-logo-light.png",
    /** Transparent mark + wordmark (no plate / border) for navy footer */
    horizontalOnDark: "/brand/importnest-logo-dark.png",
    stacked: "/brand/importnest-logo-dark.png",
    icon: "/brand/importnest-icon.png",
    iconDark: "/brand/importnest-icon.png",
    circle: "/brand/importnest-icon.png",
    circleDark: "/brand/importnest-icon.png",
    headerAspect: 5.33,
    /** Cropped transparent lockup */
    horizontalAspect: 3.86,
    stackedAspect: 3.59,
  },
  /** Light-plate full lockup — use on white / light panels */
  logo2: {
    header: "/brand/importnest-header-logo-v3.png",
    horizontal: "/brand/importnest-logo-light.png",
    horizontalOnDark: "/brand/importnest-logo-dark.png",
    stacked: "/brand/importnest-logo-light.png",
    icon: "/brand/importnest-icon.png",
    iconDark: "/brand/importnest-icon.png",
    circle: "/brand/importnest-icon.png",
    circleDark: "/brand/importnest-icon.png",
    headerAspect: 5.33,
    horizontalAspect: 3.86,
    stackedAspect: 3.86,
  },
  logo9: {
    header: "/brand/importnest-header-logo-v3.png",
    /** Dark wordmark for light surfaces */
    horizontal: "/brand/importnest-logo-light.png",
    /** White/gold wordmark for navy footer & dark plates */
    horizontalOnDark: "/brand/importnest-logo-dark.png",
    stacked: "/brand/importnest-logo-dark.png",
    icon: "/brand/importnest-icon.png",
    iconDark: "/brand/importnest-icon.png",
    circle: "/brand/importnest-icon.png",
    circleDark: "/brand/importnest-icon.png",
    /** Compact lockup (icon + IMPORTNEST, no tagline) */
    headerAspect: 5.33,
    /** Full lockup with tagline on light */
    horizontalAspect: 3.86,
    stackedAspect: 3.59,
  },
  nest: {
    header: "/brand/importnest-header-logo-v3.png",
    horizontal: "/brand/importnest-logo-light.png",
    horizontalOnDark: "/brand/importnest-logo-dark.png",
    stacked: "/brand/importnest-logo-dark.png",
    icon: "/brand/importnest-icon.png",
    iconDark: "/brand/importnest-icon.png",
    circle: "/brand/importnest-icon.png",
    circleDark: "/brand/importnest-icon.png",
    headerAspect: 5.33,
    horizontalAspect: 3.86,
    stackedAspect: 3.59,
  },
  in: {
    header: "/brand/logo8-full-dark.png",
    horizontal: "/brand/logo8-full-dark.png",
    stacked: "/brand/logo8-full.png",
    icon: "/brand/logo8-icon.png",
    iconDark: "/brand/logo8-icon-dark.png",
    circle: "/brand/logo8-mark.png",
    circleDark: "/brand/logo8-mark-dark.png",
    headerAspect: 1.55,
    horizontalAspect: 1.55,
    stackedAspect: 1.55,
  },
} as const;

/** Importnest brand mark — header uses compact lockup; full tagline only for large surfaces. */
export function BrandMark({
  logo = "logo9",
  showWordmark = true,
  size = "md",
  onDark = false,
  layout = "horizontal",
  height,
  className = "",
}: {
  logo?: BrandLogo;
  /** @deprecated kept for call-site compat */
  variant?: "onDark" | "onLight";
  showWordmark?: boolean;
  size?: keyof typeof SIZES;
  /** Pixel height override — takes precedence over `size` for adjustable placement */
  height?: number;
  onDark?: boolean;
  /** header = compact (no tagline); horizontal/stacked = full marketing lockup */
  layout?: BrandLayout;
  className?: string;
}) {
  const dims = SIZES[size];
  const fullH = height ?? dims.fullH;
  const asset = ASSETS[logo];

  if (showWordmark) {
    let src: string;
    let aspect: number;
    if (layout === "header") {
      src = asset.header;
      aspect = asset.headerAspect;
    } else if (onDark && "horizontalOnDark" in asset) {
      src = asset.horizontalOnDark;
      aspect = asset.horizontalAspect;
    } else if (layout === "stacked") {
      src = asset.stacked;
      aspect = asset.stackedAspect;
    } else {
      src = asset.horizontal;
      aspect = asset.horizontalAspect;
    }
    const fullW = Math.round(fullH * aspect);

    return (
      <span className={`inline-flex items-center leading-none ${className}`.trim()}>
        <Image
          src={src}
          alt="Importnest"
          width={fullW}
          height={fullH}
          className="h-auto w-auto object-contain object-left"
          style={{ height: fullH, width: "auto", maxWidth: "100%" }}
          priority={size === "md" || size === "lg" || size === "xl" || size === "footer"}
        />
      </span>
    );
  }

  const iconSrc = onDark ? asset.iconDark : asset.icon;
  const iconH = height ?? dims.icon;

  return (
    <span className={`inline-flex leading-none ${className}`.trim()}>
      <Image
        src={iconSrc}
        alt="Importnest"
        width={Math.round(iconH * 1.89)}
        height={iconH}
        className="object-contain"
        style={{ height: iconH, width: "auto" }}
        priority
      />
    </span>
  );
}

/**
 * Header home link — compact transparent logo (icon + IMPORTNEST only).
 * Never uses the tagline lockup, dark plate, or decorative underline.
 */
export function BrandLink({
  className = "",
  logo = "logo9",
}: {
  variant?: "onDark" | "onLight";
  className?: string;
  onDark?: boolean;
  logo?: BrandLogo;
}) {
  const headerSrc = ASSETS[logo].header;
  const aspect = ASSETS[logo].headerAspect;
  const height = 58;
  const width = Math.round(height * aspect);

  return (
    <Link
      href="/"
      className={`header-logo brand-logo transition hover:opacity-90 ${className}`}
      aria-label="Importnest home"
    >
      <Image
        src={headerSrc}
        alt="Importnest"
        width={width}
        height={height}
        className="header-logo-img"
        priority
      />
    </Link>
  );
}
