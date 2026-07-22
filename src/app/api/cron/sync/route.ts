import type { NextRequest } from "next/server";
import { syncAllConnectors } from "@/lib/connectors/sync-all";

/**
 * Triggered on a schedule by Vercel Cron (see vercel.json) — Vercel sends
 * `Authorization: Bearer $CRON_SECRET` automatically for configured cron
 * requests, so a mismatch means the caller is not the cron scheduler. Fails
 * closed (401) when CRON_SECRET isn't set, rather than leaving this endpoint
 * open to trigger writes with no auth at all.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await syncAllConnectors();
  return Response.json({ results });
}
