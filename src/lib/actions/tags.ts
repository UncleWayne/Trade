"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/require-user";

export async function listTags() {
  const userId = await requireUserId();
  return prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function createTag(name: string, color?: string) {
  const userId = await requireUserId();
  const tag = await prisma.tag.create({
    data: { userId, name, color: color || "#6366f1" },
  });
  revalidatePath("/dashboard");
  return tag;
}

export async function deleteTag(tagId: string) {
  const userId = await requireUserId();
  await prisma.tag.deleteMany({ where: { id: tagId, userId } });
  revalidatePath("/dashboard");
}

export async function createTagFromForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  if (!name) return;
  await createTag(name, color || undefined);
  revalidatePath("/dashboard/tags");
}

export async function deleteTagFromForm(tagId: string) {
  await deleteTag(tagId);
  revalidatePath("/dashboard/tags");
}
