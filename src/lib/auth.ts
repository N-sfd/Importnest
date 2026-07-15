import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** Cheap session lookup — no DB write. Safe to call on every page render (e.g. Header). */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Supabase's own user id is used directly as AppUser.id (no separate link
 * table) — it's already a stable, globally unique identifier, so a shopper's
 * saved products/alerts survive across sessions/devices under one row.
 * Upserts on every call, so only use where a DB write per request is
 * acceptable (saving/reading the watchlist), not on every page load.
 */
export async function getOrCreateAppUser() {
  const user = await getAuthUser();
  if (!user) return null;

  return prisma.appUser.upsert({
    where: { id: user.id },
    update: { email: user.email ?? undefined },
    create: {
      id: user.id,
      email: user.email ?? undefined,
      authProvider: "supabase",
    },
  });
}
