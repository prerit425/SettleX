"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser, getCurrentUser } from "@/lib/auth";

export type GroupState = { error?: string; success?: string };

export async function createGroupAction(
  _prev: GroupState,
  formData: FormData,
): Promise<GroupState> {
  const user = await requireApiUser();
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Group name must be at least 2 characters").max(120),
      description: z.string().trim().max(500).optional().default(""),
    })
    .safeParse({
      name: formData.get("name"),
      description: formData.get("description") ?? "",
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const emails = formData
    .getAll("emails")
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);
  const invitees = emails.length
    ? await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true, email: true } })
    : [];
  const missing = emails.find((email) => !invitees.some((invitee) => invitee.email === email));
  if (missing) return { error: `No registered user found for ${missing}.` };

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      createdBy: user.id,
      members: {
        create: [
          { userId: user.id },
          ...invitees.filter((invitee) => invitee.id !== user.id).map((invitee) => ({ userId: invitee.id })),
        ],
      },
    },
  });
  revalidatePath("/groups");
  revalidatePath("/dashboard");
  return { success: group.id };
}

export async function addMemberAction(
  _prev: GroupState,
  formData: FormData,
): Promise<GroupState> {
  const user = await requireApiUser();
  const groupId = String(formData.get("groupId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter an email address." };

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) return { error: "You are not a member of this group." };

  const invitee = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (!invitee) return { error: "No registered user found with that email." };
  if (invitee.id === user.id) return { error: "You are already a member." };

  try {
    await prisma.groupMember.create({ data: { groupId, userId: invitee.id } });
  } catch {
    return { error: `${invitee.name} is already in this group.` };
  }
  revalidatePath(`/groups/${groupId}`);
  return { success: `${invitee.name} was added to the group.` };
}
