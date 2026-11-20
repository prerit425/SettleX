import { prisma } from "@/lib/prisma";
import { toPaise, formatPaise } from "@/lib/money";

export type MemberView = { id: string; name: string; email: string };

export async function getLedger(userId: string, groupId?: string) {
  const groups = await prisma.group.findMany({
    where: groupId ? { id: groupId } : { members: { some: { userId } } },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const groupIds = groups.map((group) => group.id);
  const [expenses, settlements] = await Promise.all([
    prisma.expense.findMany({
      where: { groupId: { in: groupIds } },
      include: {
        participants: { include: { user: { select: { id: true, name: true } } } },
        payer: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.settlement.findMany({
      where: { groupId: { in: groupIds } },
      include: {
        payer: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // net[groupId][userId] in integer paise: positive = should receive, negative = owes.
  const net = new Map<string, Map<string, bigint>>();
  const netFor = (gid: string) => {
    let map = net.get(gid);
    if (!map) {
      map = new Map<string, bigint>();
      net.set(gid, map);
    }
    return map;
  };
  const add = (gid: string, uid: string, paise: bigint) => {
    const map = netFor(gid);
    map.set(uid, (map.get(uid) ?? 0n) + paise);
  };

  for (const group of groups) {
    for (const member of group.members) netFor(group.id).set(member.userId, 0n);
  }
  for (const expense of expenses) {
    add(expense.groupId, expense.paidBy, toPaise(expense.amount));
    for (const participant of expense.participants) {
      add(expense.groupId, participant.userId, -toPaise(participant.shareAmount));
    }
  }
  for (const settlement of settlements) {
    // A repayment improves the payer's position and reduces the recipient's.
    const amount = toPaise(settlement.amount);
    add(settlement.groupId, settlement.paidBy, amount);
    add(settlement.groupId, settlement.paidTo, -amount);
  }

  return { groups, expenses, settlements, net };
}

export type Ledger = Awaited<ReturnType<typeof getLedger>>;

export function userSummary(ledger: Ledger, userId: string) {
  let owedToUser = 0n;
  let userOwes = 0n;
  for (const map of ledger.net.values()) {
    const value = map.get(userId) ?? 0n;
    if (value > 0n) owedToUser += value;
    else userOwes += -value;
  }
  return {
    owedToUser: formatPaise(owedToUser),
    userOwes: formatPaise(userOwes),
    net: formatPaise(owedToUser - userOwes),
    netPaise: owedToUser - userOwes,
    groupCount: ledger.groups.length,
  };
}

/** Net amount that `from` owes `to` inside one group, after settlements. */
export function pairwiseOwedPaise(ledger: Ledger, groupId: string, from: string, to: string): bigint {
  let amount = 0n;
  for (const expense of ledger.expenses) {
    if (expense.groupId !== groupId || expense.paidBy !== to) continue;
    const share = expense.participants.find((participant) => participant.userId === from);
    if (share) amount += toPaise(share.shareAmount);
  }
  for (const expense of ledger.expenses) {
    if (expense.groupId !== groupId || expense.paidBy !== from) continue;
    const share = expense.participants.find((participant) => participant.userId === to);
    if (share) amount -= toPaise(share.shareAmount);
  }
  for (const settlement of ledger.settlements) {
    if (settlement.groupId !== groupId) continue;
    if (settlement.paidBy === from && settlement.paidTo === to) amount -= toPaise(settlement.amount);
    if (settlement.paidBy === to && settlement.paidTo === from) amount += toPaise(settlement.amount);
  }
  return amount;
}

export type SuggestedPayment = { from: MemberView; to: MemberView; amount: string };

/** Greedy min-cash-flow debt simplification over one group's net balances. */
export function simplifyDebts(
  members: MemberView[],
  balances: Map<string, bigint>,
): SuggestedPayment[] {
  const membersById = new Map(members.map((member) => [member.id, member]));
  const debtors: { member: MemberView; amount: bigint }[] = [];
  const creditors: { member: MemberView; amount: bigint }[] = [];

  for (const [userId, paise] of balances) {
    const member = membersById.get(userId);
    if (!member || paise === 0n) continue;
    if (paise < 0n) debtors.push({ member, amount: -paise });
    else creditors.push({ member, amount: paise });
  }
  debtors.sort((a, b) => (a.amount > b.amount ? -1 : 1));
  creditors.sort((a, b) => (a.amount > b.amount ? -1 : 1));

  const result: SuggestedPayment[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = debtors[i].amount < creditors[j].amount ? debtors[i].amount : creditors[j].amount;
    result.push({
      from: debtors[i].member,
      to: creditors[j].member,
      amount: formatPaise(amount),
    });
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount === 0n) i++;
    if (creditors[j].amount === 0n) j++;
  }
  return result;
}
