"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth";

export type AuthState = { error?: string };

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password } = parsed.data;
  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user;
  try {
    user = await prisma.user.create({ data: { name, email, passwordHash } });
  } catch {
    return { error: "An account with that email already exists." };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function updateSettingsAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };
  const parsed = z
    .object({ name: z.string().trim().min(2).max(100) })
    .safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "Name must be at least 2 characters." };
  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  redirect("/settings?updated=1");
}
