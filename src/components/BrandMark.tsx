import Image from "next/image";
import Link from "next/link";

const SIZES = {
  sm: { fullH: 36, icon: 32 },
  md: { fullH: 44, icon: 40 },
  lg: { fullH: 56, icon: 48 },
  xl: { fullH: 96, icon: 72 },
} as const;

export type BrandLogo = "in" | "nest" | "logo9";
export type BrandLayout = "horizontal" | "stacked";

/**
 * Nest pack (current primary): cart + nest + verified tag.
 * `logo9` is the wide navy horizontal lockup used in header + footer.
 * `in` keeps the older iN mark for optional call-sites.
 */
const ASSETS = {
  logo9: {
    horizontal: "/brand/logo9.png",
    stacked: "/brand/logo9-full.png",
    icon: "/brand/logo9-icon.png",
    iconDark: "/brand/logo9-icon-dark.png",
    circle: "/brand/logo9-mark.png",
    circleDark: "/brand/logo9-mark-dark.png",
    /** Wide horizontal lockup ~2172×724, rounded rect with transparent corners */
    horizontalAspect: 3.0,
    /** Primary lockup ~785×550 */
    stackedAspect: 1.43,
  },
  nest: {
    horizontal: "/brand/logo-horizontal.png",
    stacked: "/brand/logo-primary.png",
    icon: "/brand/logo-app-icon-light.png",
    iconDark: "/brand/logo-app-icon-dark.png",
    circle: "/brand/logo-circle-light.png",
    circleDark: "/brand/logo-circle-dark.png",
    /** Wide banner with wordmark + tagline (tight pack ~870×180) */
    horizontalAspect: 4.83,
    /** Primary lockup ~785×550 */
    stackedAspect: 1.43,
  },
  in: {
    horizontal: "/brand/logo8-full-dark.png",
    stacked: "/brand/logo8-full.png",
    icon: "/brand/logo8-icon.png",
    iconDark: "/brand/logo8-icon-dark.png",
    circle: "/brand/logo8-mark.png",
    circleDark: "/brand/logo8-mark-dark.png",
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
  /** Wordmark layout: header = horizontal, footer/hero = stacked */
  layout?: BrandLayout;
}) {
  const dims = SIZES[size];
  const asset = ASSETS[logo];

  if (showWordmark) {
    const src = layout === "stacked" ? asset.stacked : asset.horizontal;
    const aspect = layout === "stacked" ? asset.stackedAspect : asset.horizontalAspect;
    const fullW = Math.round(dims.fullH * aspect);

    return (
      <span className="inline-flex items-center overflow-hidden">
        <Image
          src={src}
          alt="Importnest — Compare smarter. Shop confidently."
          width={fullW}
          height={dims.fullH}
          className="h-auto w-auto object-contain"
          style={{ height: dims.fullH, width: "auto", maxWidth: "100%" }}
          priority={size === "lg" || size === "xl"}
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

export function BrandLink({
  className = "",
  onDark = true,
  logo = "nest",
}: {
  variant?: "onDark" | "onLight";
  className?: string;
  onDark?: boolean;
  logo?: BrandLogo;
}) {
  return (
    <Link href="/" className={`inline-flex shrink-0 items-center transition hover:opacity-90 ${className}`}>
      <span className="hidden sm:inline-flex leading-none">
        <BrandMark logo={logo} showWordmark layout="horizontal" onDark={onDark} size="md" />
      </span>
      {/* Same horizontal lockup on mobile — scaled smaller, not a different icon */}
      <span className="inline-flex leading-none sm:hidden">
        <BrandMark logo={logo} showWordmark layout="horizontal" onDark={onDark} size="sm" />
      </span>
    </Link>
  );
}
