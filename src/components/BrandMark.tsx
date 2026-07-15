import Image from "next/image";
import Link from "next/link";

const SIZES = {
  sm: { fullW: 120, fullH: 48, icon: 40 },
  md: { fullW: 148, fullH: 58, icon: 48 },
  lg: { fullW: 200, fullH: 80, icon: 64 },
} as const;

/** Official Importnest logo (cart + nest + tag). */
export function BrandMark({
  showWordmark = true,
  size = "md",
  onDark = false,
}: {
  /** @deprecated kept for call-site compat; full lockup is self-colored */
  variant?: "onDark" | "onLight";
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
}) {
  const dims = SIZES[size];

  if (showWordmark) {
    return (
      <span
        className={`inline-flex items-center rounded-xl ${onDark ? "bg-white px-2.5 py-1.5 shadow-sm" : ""}`}
      >
        <Image
          src="/brand/logo-full.png"
          alt="Importnest — AI-Powered Shopping"
          width={dims.fullW}
          height={dims.fullH}
          className="h-auto w-auto object-contain"
          style={{ height: size === "lg" ? 72 : size === "sm" ? 44 : 52, width: "auto" }}
          priority={size !== "sm"}
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex ${onDark ? "rounded-xl bg-white p-1 shadow-sm" : ""}`}>
      <Image
        src="/brand/logo-icon.png"
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
}: {
  variant?: "onDark" | "onLight";
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Link href="/" className={`shrink-0 transition hover:opacity-90 ${className}`}>
      <span className="hidden sm:inline-flex">
        <BrandMark showWordmark onDark={onDark} size="md" />
      </span>
      <span className="inline-flex sm:hidden">
        <BrandMark showWordmark={false} onDark={onDark} size="sm" />
      </span>
    </Link>
  );
}
