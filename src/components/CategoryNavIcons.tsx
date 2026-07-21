/** Compact white SVG icons for the navy category department bar. */

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

/** Grid / “All” departments. */
export function IconAll(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-7h6v7" />
    </Svg>
  );
}

/** Plug / device for Electronics. */
export function IconElectronics(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 2v6" />
      <path d="M15 2v6" />
      <path d="M7 8h10v3a5 5 0 0 1-10 0V8z" />
      <path d="M12 16v6" />
    </Svg>
  );
}

/** Front-load appliance for Appliances. */
export function IconAppliances(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="2.5" width="16" height="19" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <circle cx="12" cy="13" r="1.5" />
      <path d="M8 5.5h2" />
      <path d="M14 5.5h2" />
    </Svg>
  );
}

/** Fork + spoon for Kitchen. */
export function IconKitchen(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 3v6a2.5 2.5 0 0 0 5 0V3" />
      <path d="M7.5 3v18" />
      <path d="M16 3c2.2 0 3.5 1.8 3.5 4S18.2 11 16 11" />
      <path d="M16 11v10" />
    </Svg>
  );
}

/** Shoe silhouette for Footwear. */
export function IconFootwear(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 14.5c1.5-3.5 5-5.5 9-4.5 2.8.7 4.8 2.2 6 4l1.2 2.2H4.2L3 14.5z" />
      <path d="M4 18.5h16" />
      <path d="M8 12.2c1.2-.4 2.6-.5 4-.2" />
    </Svg>
  );
}

/** Sparkle for Beauty. */
export function IconBeauty(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2.5 13.8 9l6.7 1.2-5.2 4.2 1.6 6.6L12 17.5 7.1 21l1.6-6.6-5.2-4.2L10.2 9 12 2.5z" />
      <path d="M19 3.5v3" />
      <path d="M17.5 5h3" />
    </Svg>
  );
}

/** Shopping bag for Accessories. */
export function IconAccessories(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 8h12l1.2 12.5a1 1 0 0 1-1 1.1H5.8a1 1 0 0 1-1-1.1L6 8z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
      <path d="M16.5 4.5 19 2l1.5 1.5-1 2.5" />
    </Svg>
  );
}

/** Car for Automotive. */
export function IconAutomotive(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 14h18l-1.4-5.2A2 2 0 0 0 17.7 7H6.3a2 2 0 0 0-1.9 1.8L3 14z" />
      <path d="M5 14v3.5h2.5V16h9v1.5H19V14" />
      <circle cx="7.5" cy="14" r="1.4" />
      <circle cx="16.5" cy="14" r="1.4" />
    </Svg>
  );
}

/** Tent for Outdoors. */
export function IconOutdoors(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3.5 9 16.5H3L12 3.5z" />
      <path d="M12 9.5v10.5" />
      <path d="M8.5 20 12 13l3.5 7" />
    </Svg>
  );
}

/** Percent / sale tag for Today’s deals. */
export function IconDeals(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.5 12.5a2 2 0 0 0 0-2.8l-6-6a2 2 0 0 0-2.8 0L3 12.4V21h8.6z" />
      <circle cx="7.2" cy="7.2" r="1.3" />
      <path d="m9.5 17.5 5-5" />
      <circle cx="10.2" cy="13.2" r="1" />
      <circle cx="14.2" cy="17.2" r="1" />
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
  "Today’s deals": IconDeals,
};

/** Map All-menu department ids to the same icon set. */
const BY_DEPT_ID: Record<string, (props: IconProps) => ReactNode> = {
  home: IconHome,
  electronics: IconElectronics,
  appliances: IconAppliances,
  kitchen: IconKitchen,
  footwear: IconFootwear,
  beauty: IconBeauty,
  accessories: IconAccessories,
  automotive: IconAutomotive,
  outdoors: IconOutdoors,
};

export function CategoryNavIcon({
  label,
  deptId,
  className,
}: {
  label?: string;
  deptId?: string;
  className?: string;
}) {
  const Icon =
    (deptId ? BY_DEPT_ID[deptId] : undefined) ??
    (label ? BY_LABEL[label] : undefined) ??
    IconAll;
  return <Icon className={className ?? "category-nav-icon"} />;
}
