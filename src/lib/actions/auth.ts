"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

export interface SignupState {
  error?: string;
}

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      accounts: {
        create: { name: "Main Account" },
      },
    },
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });

  return {};
}
