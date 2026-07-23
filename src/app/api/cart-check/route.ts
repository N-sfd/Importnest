import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Reports which of the given listing ids still exist (so the cart page can
 * mark stale local snapshots unavailable) and which currently have a real
 * retailer url (so "Continue to retailer" reflects live data rather than a
 * stale add-time snapshot — a listing's url can change or be cleared after
 * the item was added to the cart).
 */
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 100);

  if (ids.length === 0) {
    return Response.json({ availableIds: [], retailerLinkIds: [] });
  }

  const rows = await prisma.listing.findMany({
    where: { id: { in: ids } },
    select: { id: true, url: true },
  });

  return Response.json({
    availableIds: rows.map((r) => r.id),
    retailerLinkIds: rows.filter((r) => r.url).map((r) => r.id),
  });
}
