"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthUser, isAppUserAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Re-checked here rather than trusting proxy alone — Server Functions aren't a separate route in the proxy chain. */
async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || !(await isAppUserAdmin(user.id))) {
    redirect("/");
  }
  return user;
}

async function recordDecision(
  productMatchId: string,
  decision: "approve-exact" | "mark-comparable" | "reject",
  matchStatus: "approved" | "rejected",
  matchType: "exact" | "comparable" | "rejected",
) {
  const admin = await requireAdmin();

  await prisma.$transaction([
    prisma.productMatch.update({
      where: { id: productMatchId },
      data: { status: matchStatus, type: matchType },
    }),
    prisma.matchReview.create({
      data: { productMatchId, reviewerId: admin.id, decision },
    }),
  ]);

  revalidatePath("/admin/match-review");
}

export async function approveMatchAction(productMatchId: string) {
  await recordDecision(productMatchId, "approve-exact", "approved", "exact");
}

export async function markComparableAction(productMatchId: string) {
  await recordDecision(productMatchId, "mark-comparable", "approved", "comparable");
}

export async function rejectMatchAction(productMatchId: string) {
  await recordDecision(productMatchId, "reject", "rejected", "rejected");
}
