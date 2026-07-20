import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/** Reports which of the given listing ids still exist, so the cart page can mark stale local snapshots unavailable without ever inventing a status. */
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 100);

  if (ids.length === 0) {
    return Response.json({ availableIds: [] });
  }

  const rows = await prisma.listing.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  return Response.json({ availableIds: rows.map((r) => r.id) });
}
