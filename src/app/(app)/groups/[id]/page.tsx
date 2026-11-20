import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, ReceiptText, RotateCcw, UsersRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLedger, simplifyDebts } from "@/lib/balances";
import { formatMoney, formatPaise } from "@/lib/money";
import { PageHeader, SectionTitle, Avatar } from "@/components/ui";
import { AddMemberForm } from "@/components/add-member-form";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const group = await prisma.group.findUnique({
    where: { id },
    include: { members: { include: { user: true }, orderBy: { joinedAt: "asc" } } },
  });
  if (!group || !group.members.some((member) => member.userId === user.id)) notFound();

  const ledger = await getLedger(user.id, group.id);
  const balances = ledger.net.get(group.id) ?? new Map<string, bigint>();
  const members = group.members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
  }));
  const suggestions = simplifyDebts(members, balances);
  const groupExpenses = ledger.expenses.filter((expense) => expense.groupId === group.id);
  const groupSettlements = ledger.settlements.filter((settlement) => settlement.groupId === group.id);

  return (
    <>
      <Link href="/groups" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-lav">
        <ArrowLeft className="size-3.5" /> All groups
      </Link>
      <PageHeader
        eyebrow="Shared ledger"
        title={group.name}
        subtitle={group.description || "Everything this group has shared, in one place."}
        action={
          <Link href={`/expenses/new?group=${group.id}`} className="flex items-center gap-2 self-start rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(124,92,255,0.28)] transition hover:bg-lavdark">
            <Plus className="size-4" /> Add expense
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
        <div className="space-y-6">
          <section className="soft-card p-6">
            <SectionTitle><span className="flex items-center gap-2"><UsersRound className="size-4 text-lav" /> Members ({members.length})</span></SectionTitle>
            <div className="space-y-2">
              {group.members.map((member, index) => (
                <div key={member.id} className="flex items-center gap-3 rounded-2xl bg-cream p-2.5">
                  <Avatar name={member.user.name} index={index} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{member.user.name}</p>
                    <p className="truncate text-[11px] text-muted">{member.user.email}</p>
                  </div>
                  {member.user.id === group.createdBy && (
                    <span className="rounded-full bg-lavsoft px-2 py-1 text-[10px] font-bold text-lav">Creator</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <p className="mb-2 text-xs font-bold">Add a friend</p>
              <AddMemberForm groupId={group.id} />
            </div>
          </section>

          <section className="soft-card p-6">
            <SectionTitle>Group balances</SectionTitle>
            <div className="space-y-2">
              {members.map((member, index) => {
                const balance = balances.get(member.id) ?? 0n;
                return (
                  <div key={member.id} className="flex items-center gap-3 rounded-2xl bg-cream p-2.5">
                    <Avatar name={member.name} index={index} size="sm" />
                    <span className="flex-1 truncate text-xs font-semibold">{member.name}</span>
                    <span className={`text-xs font-extrabold ${balance > 0n ? "text-mint" : balance < 0n ? "text-coral" : "text-muted"}`}>
                      {balance > 0n ? "gets " : balance < 0n ? "owes " : ""}{formatPaise(balance < 0n ? -balance : balance)}
                    </span>
                  </div>
                );
              })}
            </div>
            {suggestions.length > 0 && (
              <div className="mt-5 rounded-2xl bg-lavsoft p-4">
                <p className="mb-2 text-xs font-bold text-lavdark">Suggested payments</p>
                {suggestions.map((suggestion, index) => (
                  <p key={index} className="text-xs font-semibold text-ink">
                    {suggestion.from.name} → {suggestion.to.name}: <span className="text-lavdark">{suggestion.amount}</span>
                  </p>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <SectionTitle>Expenses ({groupExpenses.length})</SectionTitle>
            {groupExpenses.length === 0 ? (
              <div className="soft-card p-8 text-center text-sm text-muted">
                No expenses in this group yet. <Link href={`/expenses/new?group=${group.id}`} className="font-bold text-lav">Add the first one →</Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {groupExpenses.map((expense) => (
                  <div key={expense.id} className="soft-card flex items-center gap-3 p-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-lavsoft text-lav"><ReceiptText className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{expense.description}</p>
                      <p className="truncate text-[11px] text-muted">{expense.payer.name} paid · {expense.participants.length} people</p>
                    </div>
                    <span className="text-sm font-extrabold">{formatMoney(expense.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section>
            <SectionTitle>Settlements ({groupSettlements.length})</SectionTitle>
            {groupSettlements.length === 0 ? (
              <div className="soft-card p-6 text-center text-sm text-muted">No payments recorded yet.</div>
            ) : (
              <div className="space-y-2.5">
                {groupSettlements.map((settlement) => (
                  <div key={settlement.id} className="soft-card flex items-center gap-3 p-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-mintsoft text-mint"><RotateCcw className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{settlement.payer.name} paid {settlement.recipient.name}</p>
                      <p className="text-[11px] text-muted">{new Date(settlement.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <span className="text-sm font-extrabold text-mint">{formatMoney(settlement.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
