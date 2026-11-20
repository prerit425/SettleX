"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { splitEqually } from "@/lib/money";

export type ExpenseState = { error?: string; success?: string };

const amountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a positive amount (up to 2 decimals)")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");

export async function createExpenseAction(
  _prev: ExpenseState,
  formData: FormData,
): Promise<ExpenseState> {
  const user = await requireApiUser();
  const parsed = z
    .object({
      groupId: z.string().uuid(),
      description: z.string().trim().min(2, "Add a short description").max(255),
      amount: amountSchema,
      paidBy: z.string().uuid(),
    })
    .safeParse({
      groupId: formData.get("groupId"),
      description: formData.get("description"),
      amount: formData.get("amount"),
      paidBy: formData.get("paidBy"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const participantIds = Array.from(new Set(formData.getAll("participants").map(String)));
  if (participantIds.length === 0) return { error: "Select at least one participant." };

  const { groupId, description, amount, paidBy } = parsed.data;
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const memberIds = new Set(members.map((member) => member.userId));
  if (!memberIds.has(user.id)) return { error: "You are not a member of this group." };
  if (!memberIds.has(paidBy)) return { error: "The payer must belong to this group." };
  if (participantIds.some((id) => !memberIds.has(id))) {
    return { error: "Every participant must belong to this group." };
  }

  const shares = splitEqually(new Prisma.Decimal(amount), participantIds.length);
  await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        groupId,
        description,
        amount: new Prisma.Decimal(amount),
        paidBy,
      },
    });
    await tx.expenseParticipant.createMany({
      data: participantIds.map((userId, index) => ({
        expenseId: expense.id,
        userId,
        shareAmount: shares[index],
      })),
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/activity");
  revalidatePath("/balances");
  revalidatePath(`/groups/${groupId}`);
  return { success: "Expense added." };
}
