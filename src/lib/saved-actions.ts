"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser(redirectTo: string) {
  const user = await getOrCreateAppUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  return user;
}

export async function saveProductAction(canonicalProductId: string, redirectTo: string) {
  const user = await requireUser(redirectTo);
  await prisma.savedProduct.upsert({
    where: { userId_canonicalProductId: { userId: user.id, canonicalProductId } },
    update: {},
    create: { userId: user.id, canonicalProductId },
  });
  revalidatePath(redirectTo);
  revalidatePath("/saved");
}

export async function unsaveProductAction(canonicalProductId: string, redirectTo: string) {
  const user = await requireUser(redirectTo);
  await prisma.savedProduct.deleteMany({ where: { userId: user.id, canonicalProductId } });
  revalidatePath(redirectTo);
  revalidatePath("/saved");
}

/** Positive, finite prices only — a malformed or negative threshold is silently rejected rather than stored. */
export async function setPriceAlertAction(canonicalProductId: string, redirectTo: string, formData: FormData) {
  const user = await requireUser(redirectTo);
  const threshold = Number(formData.get("threshold"));
  if (!Number.isFinite(threshold) || threshold <= 0) {
    revalidatePath(redirectTo);
    return;
  }

  await prisma.alert.upsert({
    where: {
      userId_canonicalProductId_type: { userId: user.id, canonicalProductId, type: "price-drop" },
    },
    update: { threshold: String(threshold), isActive: true },
    create: {
      userId: user.id,
      canonicalProductId,
      type: "price-drop",
      threshold: String(threshold),
      isActive: true,
    },
  });
  revalidatePath(redirectTo);
  revalidatePath("/saved");
}

export async function removeAlertAction(canonicalProductId: string, alertType: string, redirectTo: string) {
  const user = await requireUser(redirectTo);
  await prisma.alert.deleteMany({ where: { userId: user.id, canonicalProductId, type: alertType } });
  revalidatePath(redirectTo);
  revalidatePath("/saved");
}

export async function toggleAlertActiveAction(
  canonicalProductId: string,
  alertType: string,
  redirectTo: string,
) {
  const user = await requireUser(redirectTo);
  const alert = await prisma.alert.findUnique({
    where: {
      userId_canonicalProductId_type: { userId: user.id, canonicalProductId, type: alertType },
    },
  });
  if (!alert) return;

  await prisma.alert.update({ where: { id: alert.id }, data: { isActive: !alert.isActive } });
  revalidatePath(redirectTo);
  revalidatePath("/saved");
}
