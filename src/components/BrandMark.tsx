import Image from "next/image";
import Link from "next/link";

const SIZES = {
  sm: { fullH: 36, icon: 28 },
  md: { fullH: 48, icon: 36 },
  lg: { fullH: 64, icon: 48 },
  xl: { fullH: 96, icon: 72 },
} as const;

export type BrandLogo = "in" | "nest" | "logo9";
export type BrandLayout = "horizontal" | "stacked" | "header";

/**
 * Brand assets:
 * - header  → icon + IMPORTNEST only (no tagline) — top navigation
 * - full    → icon + wordmark + tagline — footer / hero / marketing
 * - icon    → mark only — favicon / mobile compact
 */
const ASSETS = {
  logo9: {
    header: "/brand/importnest-header-logo.png",
    horizontal: "/brand/importnest-full-logo.png",
    horizontalOnDark: "/brand/importnest-full-logo-on-dark.png",
    stacked: "/brand/importnest-full-logo-on-dark.png",
    icon: "/brand/importnest-icon.png",
    iconDark: "/brand/importnest-icon.png",
    circle: "/brand/importnest-icon.png",
    circleDark: "/brand/importnest-icon.png",
    /** 1930×196 */
    headerAspect: 9.85,
    /** 1220×380 transparent full with tagline */
    horizontalAspect: 3.21,
    stackedAspect: 3.0,
  },
  nest: {
    header: "/brand/importnest-header-logo.png",
    horizontal: "/brand/importnest-full-logo.png",
    stacked: "/brand/logo-primary.png",
    icon: "/brand/importnest-icon.png",
    iconDark: "/brand/importnest-icon.png",
    circle: "/brand/importnest-icon.png",
    circleDark: "/brand/importnest-icon.png",
    headerAspect: 9.85,
    horizontalAspect: 3.21,
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

/** Importnest brand mark — header uses compact lockup; full tagline only for large surfaces. */
export function BrandMark({
  logo = "logo9",
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
  /** header = compact (no tagline); horizontal/stacked = full marketing lockup */
  layout?: BrandLayout;
}) {
  const dims = SIZES[size];
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
    <span className="inline-flex leading-none">
      <Image
        src={iconSrc}
        alt="Importnest"
        width={Math.round(dims.icon * 1.89)}
        height={dims.icon}
        className="object-contain"
        style={{ height: dims.icon, width: "auto" }}
        priority
      />
    </span>
  );
}

/**
 * Header home link — compact transparent logo (icon + IMPORTNEST only).
 * Never uses the tagline lockup in the top nav.
 */
export function BrandLink({
  className = "",
  onDark = false,
  logo = "logo9",
}: {
  variant?: "onDark" | "onLight";
  className?: string;
  onDark?: boolean;
  logo?: BrandLogo;
}) {
  const asset = ASSETS[logo];
  const headerSrc = asset.header;
  const iconSrc = onDark ? asset.iconDark : asset.icon;

  return (
    <Link
      href="/"
      className={`header-logo inline-flex shrink-0 items-center self-center transition hover:opacity-90 ${className}`}
    >
      <span className="hidden sm:inline-flex leading-none">
        <Image
          src={headerSrc}
          alt="Importnest"
          width={315}
          height={32}
          className="h-[30px] w-auto max-w-[200px] object-contain object-left"
          priority
        />
      </span>
      <span className="inline-flex leading-none sm:hidden">
        <Image
          src={iconSrc}
          alt="Importnest"
          width={48}
          height={26}
          className="h-[26px] w-auto max-w-[130px] object-contain object-left"
          priority
        />
      </span>
    </Link>
  );
}
