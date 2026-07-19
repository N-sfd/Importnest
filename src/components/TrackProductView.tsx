"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/components/RecentlyViewedProvider";

/** Invisible — records this product into Recently Viewed on mount. Rendered once per product page. */
export function TrackProductView({
  productId,
  productName,
  brandName,
  imageSrc,
}: {
  productId: string;
  productName: string;
  brandName: string;
  imageSrc: string;
}) {
  const { recordView } = useRecentlyViewed();

  useEffect(() => {
    recordView({ id: productId, name: productName, brandName, imageSrc });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return null;
}
