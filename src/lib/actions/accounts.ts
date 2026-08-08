"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/require-user";

export async function listAccounts() {
  const userId = await requireUserId();
  return prisma.account.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createAccount(data: {
  name: string;
  broker?: string;
  currency?: string;
}) {
  const userId = await requireUserId();
  const account = await prisma.account.create({
    data: {
      userId,
      name: data.name,
      broker: data.broker || null,
      currency: data.currency || "USD",
    },
  });
  revalidatePath("/dashboard");
  return account;
}
