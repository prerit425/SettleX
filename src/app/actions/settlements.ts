"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { pairwiseOwedPaise, getLedger } from "@/lib/balances";
import { toPaise } from "@/lib/money";

export type SettlementState = { error?: string; success?: string };

const amountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a positive amount (up to 2 decimals)")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");

export async function createSettlementAction(
  _prev: SettlementState,
  formData: FormData,
): Promise<SettlementState> {
  const user = await requireApiUser();
  const parsed = z
    .object({
      groupId: z.string().uuid(),
      paidTo: z.string().uuid(),
      amount: amountSchema,
    })
    .safeParse({
      groupId: formData.get("groupId"),
      paidTo: formData.get("paidTo"),
      amount: formData.get("amount"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { groupId, paidTo, amount } = parsed.data;
  if (paidTo === user.id) return { error: "Choose someone other than yourself." };

  const memberIds = (
    await prisma.groupMember.findMany({ where: { groupId }, select: { userId: true } })
  ).map((member) => member.userId);
  if (!memberIds.includes(user.id) || !memberIds.includes(paidTo)) {
    return { error: "Both users must belong to this group." };
  }

  const paise = toPaise(amount);
  const ledger = await getLedger(user.id, groupId);
  const outstanding = pairwiseOwedPaise(ledger, groupId, user.id, paidTo);
  if (outstanding <= 0n) return { error: "You do not currently owe this person in this group." };
  if (paise > outstanding) {
    return { error: `You can settle at most ${(Number(outstanding) / 100).toFixed(2)}.` };
  }

  await prisma.settlement.create({
    data: { groupId, paidBy: user.id, paidTo, amount: new Prisma.Decimal(amount) },
  });

  revalidatePath("/dashboard");
  revalidatePath("/balances");
  revalidatePath("/activity");
  revalidatePath(`/groups/${groupId}`);
  return { success: "Payment recorded." };
}
