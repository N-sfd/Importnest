import Image from "next/image";
import Link from "next/link";

const SIZES = {
  sm: { fullH: 36, icon: 32 },
  /** Header lockup target ~42–48px */
  md: { fullH: 46, icon: 40 },
  lg: { fullH: 56, icon: 48 },
  xl: { fullH: 96, icon: 72 },
} as const;

/** Compact header lockup: icon rendered smaller than the wordmark, tight gap, centered. */
const HEADER_LOCKUP = {
  sm: { textH: 27, iconH: 20, gap: 5 },
  md: { textH: 34, iconH: 26, gap: 6 },
} as const;

export type BrandLogo = "in" | "nest" | "logo9";
export type BrandLayout = "horizontal" | "stacked" | "header";

/**
 * Nest pack (current primary): cart + nest + verified tag.
 * `logo9` — transparent header lockup (icon + wordmark) and dark/full variants.
 * `in` keeps the older iN mark for optional call-sites.
 */
const ASSETS = {
  logo9: {
    /** Header-optimized: icon + IMPORTNEST only, transparent, no tagline/smiles. */
    header: "/brand/logo9-header.png",
    horizontal: "/brand/logo9-transparent.png",
    /** Navy-plate lockup for dark surfaces (footer). */
    horizontalOnDark: "/brand/logo9-on-dark.png",
    stacked: "/brand/logo9-full.png",
    icon: "/brand/logo9-icon.png",
    iconDark: "/brand/logo9-icon-dark.png",
    circle: "/brand/logo9-mark.png",
    circleDark: "/brand/logo9-mark-dark.png",
    headerAspect: 9.85,
    /** Full transparent lockup with tagline ~1934×337 */
    horizontalAspect: 5.74,
    stackedAspect: 1.43,
    /** Tightly-cropped icon and wordmark, sized independently for the compact header lockup. */
    headerIcon: "/brand/logo9-header-icon.png",
    headerWordmark: "/brand/logo9-header-wordmark.png",
    headerIconAspect: 1.89,
    headerWordmarkAspect: 10.82,
  },
  nest: {
    header: "/brand/logo-horizontal.png",
    horizontal: "/brand/logo-horizontal.png",
    stacked: "/brand/logo-primary.png",
    icon: "/brand/logo-app-icon-light.png",
    iconDark: "/brand/logo-app-icon-dark.png",
    circle: "/brand/logo-circle-light.png",
    circleDark: "/brand/logo-circle-dark.png",
    headerAspect: 4.83,
    horizontalAspect: 4.83,
    stackedAspect: 1.43,
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

/** Importnest brand mark — prefer `nest` (primary pack). */
export function BrandMark({
  logo = "nest",
  showWordmark = true,
  size = "md",
  onDark = false,
  layout = "horizontal",
}: {
  logo?: BrandLogo;
  /** @deprecated kept for call-site compat */
  variant?: "onDark" | "onLight";
  showWordmark?: boolean;
  size?: keyof typeof SIZES;
  onDark?: boolean;
  /** Wordmark layout: header = compact lockup, footer/hero = stacked/horizontal */
  layout?: BrandLayout;
}) {
  const dims = SIZES[size];
  const asset = ASSETS[logo];

  if (showWordmark) {
    if (layout === "header" && "headerIcon" in asset) {
      const lockup = HEADER_LOCKUP[size as keyof typeof HEADER_LOCKUP] ?? HEADER_LOCKUP.md;
      const iconW = Math.round(lockup.iconH * asset.headerIconAspect);
      const textW = Math.round(lockup.textH * asset.headerWordmarkAspect);
      return (
        <span
          className="inline-flex items-center leading-none"
          style={{ gap: lockup.gap }}
        >
          <Image
            src={asset.headerIcon}
            alt=""
            width={iconW}
            height={lockup.iconH}
            className="object-contain"
            style={{ height: lockup.iconH, width: "auto" }}
            priority
          />
          <Image
            src={asset.headerWordmark}
            alt="Importnest"
            width={textW}
            height={lockup.textH}
            className="object-contain"
            style={{ height: lockup.textH, width: "auto" }}
            priority
          />
        </span>
      );
    }

    let src: string;
    let aspect: number;
    if (layout === "header") {
      src = asset.header;
      aspect = asset.headerAspect;
    } else if (onDark && logo === "logo9" && layout === "horizontal") {
      src = ASSETS.logo9.horizontalOnDark;
      aspect = ASSETS.logo9.horizontalAspect;
    } else if (layout === "stacked") {
      src = asset.stacked;
      aspect = asset.stackedAspect;
    } else {
      src = asset.horizontal;
      aspect = asset.horizontalAspect;
    }
    const fullW = Math.round(dims.fullH * aspect);

    return (
      <span className="inline-flex items-center leading-none">
        <Image
          src={src}
          alt="Importnest"
          width={fullW}
          height={dims.fullH}
          className="h-auto w-auto object-contain object-left"
          style={{ height: dims.fullH, width: "auto", maxWidth: "100%" }}
          priority={size === "md" || size === "lg" || size === "xl"}
        />
      </span>
    );
  }

  const iconSrc = onDark ? asset.iconDark : asset.icon;

  return (
    <span className="inline-flex overflow-hidden rounded-xl">
      <Image
        src={iconSrc}
        alt="Importnest"
        width={dims.icon}
        height={dims.icon}
        className="object-contain"
        priority
      />
    </span>
  );
}

/** Header home link — transparent icon + wordmark, no plate or tagline. */
export function BrandLink({
  className = "",
  onDark = false,
  logo = "nest",
}: {
  variant?: "onDark" | "onLight";
  className?: string;
  onDark?: boolean;
  logo?: BrandLogo;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center self-center transition hover:opacity-90 ${className}`}
    >
      <span className="hidden sm:inline-flex leading-none">
        <BrandMark logo={logo} showWordmark layout="header" onDark={onDark} size="md" />
      </span>
      <span className="inline-flex leading-none sm:hidden">
        <BrandMark logo={logo} showWordmark layout="header" onDark={onDark} size="sm" />
      </span>
    </Link>
  );
}
