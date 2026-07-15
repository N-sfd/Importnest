import Image from "next/image";
import Link from "next/link";

const SIZES = {
  sm: { fullH: 40, icon: 36 },
  md: { fullH: 48, icon: 42 },
  lg: { fullH: 80, icon: 64 },
} as const;

export type BrandLogo = "in" | "nest";

const ASSETS: Record<
  BrandLogo,
  { full: string; fullDark: string; icon: string; iconDark: string; plate: string; aspect: number }
> = {
  /** logo8 — iN + cart */
  in: {
    full: "/brand/logo8-full.png",
    fullDark: "/brand/logo8-full-dark.png",
    icon: "/brand/logo8-icon.png",
    iconDark: "/brand/logo8-icon-dark.png",
    plate: "#031634",
    aspect: 1.55,
  },
  /** logo9 — cart + nest + tag */
  nest: {
    full: "/brand/logo9-full.png",
    fullDark: "/brand/logo9-full-dark.png",
    icon: "/brand/logo9-icon.png",
    iconDark: "/brand/logo9-icon-dark.png",
    plate: "#011B3E",
    aspect: 1.75,
  },
};

/** Importnest brand mark — `in` (logo8) or `nest` (logo9). */
export function BrandMark({
  logo = "in",
  showWordmark = true,
  size = "md",
  onDark = false,
}: {
  logo?: BrandLogo;
  /** @deprecated kept for call-site compat */
  variant?: "onDark" | "onLight";
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
}) {
  const dims = SIZES[size];
  const asset = ASSETS[logo];
  const fullW = Math.round(dims.fullH * asset.aspect);

  if (showWordmark) {
    return (
      <span
        className={`inline-flex items-center overflow-hidden ${
          onDark ? "" : "rounded-2xl shadow-sm ring-1 ring-border"
        }`}
        style={onDark ? undefined : { backgroundColor: asset.plate }}
      >
        <Image
          src={onDark ? asset.fullDark : asset.full}
          alt="Importnest — Compare smarter. Shop confidently."
          width={fullW}
          height={dims.fullH}
          className="h-auto w-auto object-contain"
          style={{ height: dims.fullH, width: "auto" }}
          priority={size !== "sm"}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex overflow-hidden ${
        onDark ? "" : "rounded-xl p-0.5 shadow-sm ring-1 ring-border"
      }`}
      style={onDark ? undefined : { backgroundColor: asset.plate }}
    >
      <Image
        src={onDark ? asset.iconDark : asset.icon}
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
  logo = "in",
}: {
  variant?: "onDark" | "onLight";
  className?: string;
  onDark?: boolean;
  logo?: BrandLogo;
}) {
  return (
    <Link href="/" className={`shrink-0 transition hover:opacity-90 ${className}`}>
      <span className="hidden sm:inline-flex">
        <BrandMark logo={logo} showWordmark onDark={onDark} size="md" />
      </span>
      <span className="inline-flex sm:hidden">
        <BrandMark logo={logo} showWordmark={false} onDark={onDark} size="sm" />
      </span>
    </Link>
  );
}
