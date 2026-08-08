"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/require-user";

const COOKIE_NAME = "activeAccountId";

/** Returns the active account for the current user, creating a default one if none exist. */
export async function getActiveAccount() {
  const userId = await requireUserId();
  const cookieStore = await cookies();
  const requestedId = cookieStore.get(COOKIE_NAME)?.value;

  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  if (accounts.length === 0) {
    const created = await prisma.account.create({
      data: { userId, name: "Main Account" },
    });
    return { account: created, accounts: [created] };
  }

  const active = accounts.find((a) => a.id === requestedId) ?? accounts[0];
  return { account: active, accounts };
}

export async function setActiveAccount(accountId: string) {
  const userId = await requireUserId();
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new Error("Account not found");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, accountId, { path: "/" });
  redirect("/dashboard");
}
