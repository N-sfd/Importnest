import type { NextRequest } from "next/server";
import { getCompareBasketItems } from "@/lib/compare-basket";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (ids.length === 0) {
    return Response.json({ items: [] });
  }

  const items = await getCompareBasketItems(ids);
  return Response.json({ items });
}
