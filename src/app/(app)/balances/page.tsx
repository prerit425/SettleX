import Link from "next/link";
import { ArrowRight, Scale, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getLedger, userSummary, simplifyDebts, pairwiseOwedPaise } from "@/lib/balances";
import { formatPaise } from "@/lib/money";
import { PageHeader, StatCard, SectionTitle, Avatar, EmptyState } from "@/components/ui";
import { SettlementForm, type DebtOption } from "@/components/settlement-form";

export default async function BalancesPage() {
  const user = await requireUser();
  const ledger = await getLedger(user.id);
  const summary = userSummary(ledger, user.id);

  const debts: DebtOption[] = [];
  for (const group of ledger.groups) {
    for (const member of group.members) {
      if (member.userId === user.id) continue;
      const paise = pairwiseOwedPaise(ledger, group.id, user.id, member.userId);
      if (paise > 0n) {
        debts.push({
          key: `${group.id}:${member.userId}`,
          groupId: group.id,
          groupName: group.name,
          paidTo: member.userId,
          name: member.user.name,
          amount: `${paise / 100n}.${(paise % 100n).toString().padStart(2, "0")}`,
        });
      }
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Settle up"
        title="Balances"
        subtitle="Real numbers from your shared ledger, updated after every payment."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="You should receive" value={summary.owedToUser} hint="From your groups" tone="mint" />
        <StatCard label="You owe" value={summary.userOwes} hint="To your friends" tone="coral" />
        <StatCard label="Net position" value={summary.net} hint="Receive minus owe" tone="lav" />
      </div>

      {ledger.groups.length === 0 ? (
        <div className="mt-7">
          <EmptyState
            icon={<Scale className="size-9" />}
            title="No balances to show"
            description="Create a group and add an expense to see balances calculated automatically."
            action={<Link href="/groups/new" className="rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white">Create a group</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
          <div className="space-y-6">
            <SectionTitle>Group-wise balances</SectionTitle>
            {ledger.groups.map((group, index) => {
              const balances = ledger.net.get(group.id) ?? new Map<string, bigint>();
              const members = group.members.map((member) => ({ id: member.userId, name: member.user.name, email: member.user.email }));
              const suggestions = simplifyDebts(members, balances);
              const settled = suggestions.length === 0;
              return (
                <div key={group.id} className="soft-card p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold">{group.name}</p>
                      <p className="text-[11px] text-muted">{members.length} members</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${settled ? "bg-mintsoft text-mint" : "bg-lavsoft text-lav"}`}>
                      {settled ? "All settled ✨" : `${suggestions.length} payment${suggestions.length > 1 ? "s" : ""} to clear`}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {members.map((member, memberIndex) => {
                      const value = balances.get(member.id) ?? 0n;
                      return (
                        <div key={member.id} className="flex items-center gap-3 rounded-2xl bg-cream p-2.5">
                          <Avatar name={member.name} index={memberIndex + index} size="sm" />
                          <span className="flex-1 truncate text-xs font-semibold">{member.name}</span>
                          <span className={`text-xs font-extrabold ${value > 0n ? "text-mint" : value < 0n ? "text-coral" : "text-muted"}`}>
                            {value > 0n ? "+" : value < 0n ? "−" : ""}{formatPaise(value < 0n ? -value : value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {suggestions.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-dashed border-lav/30 bg-lavsoft/40 p-4">
                      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-lav"><Sparkles className="size-3.5" /> Simplest way to settle</p>
                      {suggestions.map((suggestion, i) => (
                        <p key={i} className="flex items-center gap-2 text-xs font-semibold">
                          {suggestion.from.name} <ArrowRight className="size-3 text-lav" /> {suggestion.to.name}
                          <span className="ml-auto font-extrabold text-lav">{suggestion.amount}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div>
            <SectionTitle>Record a payment</SectionTitle>
            <SettlementForm debts={debts} />
            <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted">
              Payments are real ledger entries. Balances are always recalculated — historical expenses are never changed.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
