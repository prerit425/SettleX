"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { safeNextPath } from "@/lib/redirect";
import {
  createSession,
  destroyAllSessions,
  destroySession,
  getCurrentSessionHash,
  getCurrentUser,
} from "@/lib/auth";

export type AuthState = { error?: string; success?: string };

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
// Compared against on every login so unknown emails take a similar amount of time.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("timing-equalizer-not-a-real-password", 12);

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordSchema,
});

function emailKey(email: string): string {
  return createHash("sha256").update(email).digest("hex");
}

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

  await prisma.authAttempt.deleteMany({ where: { emailHash: emailKey(email) } });
  await createSession(user.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().email("Enter a valid email address"),
      password: z.string().min(1, "Enter your password"),
    })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const { email, password } = parsed.data;
  const key = emailKey(email);

  await prisma.authAttempt
    .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
    .catch(() => {});
  const recent = await prisma.authAttempt.count({
    where: { emailHash: key, createdAt: { gte: new Date(Date.now() - ATTEMPT_WINDOW_MS) } },
  });
  if (recent >= MAX_FAILED_ATTEMPTS) {
    return { error: "Too many failed attempts. Please try again in 15 minutes." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !passwordMatches) {
    await prisma.authAttempt.create({ data: { emailHash: key } });
    return { error: "Incorrect email or password." };
  }

  await prisma.authAttempt.deleteMany({ where: { emailHash: key } });
  await createSession(user.id);
  redirect(safeNextPath(formData.get("next")));
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
    .object({ name: z.string().trim().min(2, "Name must be at least 2 characters").max(100) })
    .safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  revalidatePath("/settings");
  return { success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };

  const parsed = z
    .object({
      currentPassword: z.string().min(1, "Enter your current password"),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1, "Confirm your new password"),
    })
    .safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return { error: "The new passwords don't match." };
  }

  const stored = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!stored || !(await bcrypt.compare(parsed.data.currentPassword, stored.passwordHash))) {
    return { error: "Your current password is incorrect." };
  }
  if (await bcrypt.compare(parsed.data.newPassword, stored.passwordHash)) {
    return { error: "Choose a password you haven't used before." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    // Password changes invalidate every existing session on all devices.
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);
  await createSession(user.id);
  redirect("/settings?password=changed");
}

export async function revokeSessionAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = String(formData.get("sessionId") ?? "");
  const currentHash = await getCurrentSessionHash();
  const session = await prisma.session.findFirst({ where: { id, userId: user.id } });
  if (session && session.tokenHash !== currentHash) {
    await prisma.session.delete({ where: { id } });
  }
  revalidatePath("/settings");
}

export async function logoutEverywhereAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) await destroyAllSessions(user.id);
  redirect("/login?all=1");
}
