/** Compact white SVG icons for the navy category nav bar. */

import type { ReactNode } from "react";

type IconProps = { className?: string };

function Svg({
  children,
  className = "category-nav-icon",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function IconAll(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
    </Svg>
  );
}

export function IconElectronics(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </Svg>
  );
}

export function IconAppliances(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <path d="M8 6h2" />
    </Svg>
  );
}

export function IconKitchen(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 4v7a4 4 0 0 0 8 0V4" />
      <path d="M8 4v16" />
      <path d="M16 4v4a3 3 0 0 0 6 0V4" />
      <path d="M19 8v12" />
    </Svg>
  );
}

export function IconFootwear(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 15c2-4 6-6 10-5 3 .5 5 2 6 4l1 2H5l-1-1z" />
      <path d="M5 18h14" />
    </Svg>
  );
}

export function IconBeauty(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
      <path d="m5.6 5.6 2.1 2.1" />
      <path d="m16.3 16.3 2.1 2.1" />
      <path d="m5.6 18.4 2.1-2.1" />
      <path d="m16.3 7.7 2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function IconAccessories(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 8h12l1 13H5L6 8z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </Svg>
  );
}

export function IconAutomotive(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 14h18l-1.5-5.5A2 2 0 0 0 17.6 7H6.4a2 2 0 0 0-1.9 1.5L3 14z" />
      <path d="M5 14v4h2v-2h10v2h2v-4" />
      <circle cx="7.5" cy="14" r="1.5" />
      <circle cx="16.5" cy="14" r="1.5" />
    </Svg>
  );
}

export function IconOutdoors(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 4 8 16H4L12 4z" />
      <path d="M12 10v10" />
    </Svg>
  );
}

export function IconDeals(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.6 12.6a2 2 0 0 0 0-2.8l-5.4-5.4a2 2 0 0 0-2.8 0L3 13.8V21h7.2z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </Svg>
  );
}

const BY_LABEL: Record<string, (props: IconProps) => ReactNode> = {
  All: IconAll,
  Home: IconHome,
  Electronics: IconElectronics,
  Appliances: IconAppliances,
  Kitchen: IconKitchen,
  Footwear: IconFootwear,
  Beauty: IconBeauty,
  Accessories: IconAccessories,
  Automotive: IconAutomotive,
  Outdoors: IconOutdoors,
  "Today's deals": IconDeals,
};

export function CategoryNavIcon({ label, className }: { label: string; className?: string }) {
  const Icon = BY_LABEL[label] ?? IconAll;
  return <Icon className={className ?? "category-nav-icon"} />;
}
