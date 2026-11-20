import Link from "next/link";
import { ArrowRight, Plus, ReceiptText, UsersRound, RotateCcw, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getLedger, userSummary } from "@/lib/balances";
import { formatMoney, formatPaise } from "@/lib/money";
import { PageHeader, StatCard, SectionTitle, EmptyState, GroupIcon, AvatarStack } from "@/components/ui";

export default async function DashboardPage() {
  const user = await requireUser();
  const ledger = await getLedger(user.id);
  const summary = userSummary(ledger, user.id);

  return (
    <>
      <PageHeader
        eyebrow="Your money, shared simply"
        title={`Hey ${user.name.split(" ")[0]} 👋`}
        subtitle="Here's where things stand across all your groups."
        action={
          <Link href="/expenses/new" className="flex items-center gap-2 self-start rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(124,92,255,0.28)] transition hover:-translate-y-0.5 hover:bg-lavdark">
            <Plus className="size-4" strokeWidth={2.6} /> Add expense
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Owed to you" value={summary.owedToUser} hint="Money coming your way" tone="mint" />
        <StatCard label="You owe" value={summary.userOwes} hint="Money you need to pay" tone="coral" />
        <StatCard label="Net balance" value={summary.net} hint="Across every group" tone="lav" />
        <StatCard label="Active groups" value={String(summary.groupCount)} hint="Shared ledgers" tone="ink" />
      </div>

      {ledger.groups.length === 0 ? (
        <div className="mt-7">
          <EmptyState
            icon={<UsersRound className="size-9" />}
            title="Your first group starts here"
            description="Create a group, add friends by email, then log your first shared expense. We'll handle the splitting and balances."
            action={
              <Link href="/groups/new" className="inline-flex items-center gap-2 rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(124,92,255,0.28)]">
                <Plus className="size-4" /> Create your first group
              </Link>
            }
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { title: "1. Make a group", text: "Name it after your trip, flat or event." },
              { title: "2. Invite friends", text: "Add anyone who already has an account." },
              { title: "3. Split a bill", text: "We split equally and track who owes what." },
            ].map((step) => (
              <div key={step.title} className="soft-card p-5">
                <Sparkles className="size-5 text-lav" />
                <p className="mt-3 text-sm font-bold">{step.title}</p>
                <p className="mt-1 text-xs text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-7">
            <section>
              <SectionTitle
                action={<Link href="/groups" className="text-xs font-bold text-lav hover:underline">View all</Link>}
              >
                Your groups
              </SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                {ledger.groups.slice(0, 4).map((group, index) => (
                  <Link key={group.id} href={`/groups/${group.id}`} className="soft-card soft-card-hover p-5">
                    <div className="flex items-start gap-3">
                      <GroupIcon name={group.name} index={index} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{group.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{group.members.length} members</p>
                      </div>
                      <ArrowRight className="size-4 text-muted" />
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <AvatarStack names={group.members.map((member) => member.user.name)} />
                      <span className="text-[11px] font-semibold text-muted">
                        {formatPaise(Array.from(ledger.net.get(group.id)?.values() ?? [0n]).reduce((a, b) => a + (b > 0n ? b : 0n), 0n))} to receive
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle
                action={<Link href="/activity" className="text-xs font-bold text-lav hover:underline">See all</Link>}
              >
                Recent expenses
              </SectionTitle>
              {ledger.expenses.length === 0 ? (
                <div className="soft-card flex items-center gap-4 p-5">
                  <span className="grid size-11 place-items-center rounded-2xl bg-lavsoft text-lav"><ReceiptText className="size-5" /></span>
                  <div>
                    <p className="text-sm font-bold">No expenses yet</p>
                    <p className="text-xs text-muted">Add a bill to see it here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {ledger.expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="soft-card flex items-center gap-3 p-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavsoft text-lav"><ReceiptText className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{expense.description}</p>
                        <p className="truncate text-[11px] text-muted">{expense.payer.name} paid · {expense.group.name} · {expense.participants.length} split</p>
                      </div>
                      <span className="text-sm font-extrabold">{formatMoney(expense.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-7">
            <section className="soft-card p-6">
              <SectionTitle>Recent settlements</SectionTitle>
              {ledger.settlements.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted">No payments recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {ledger.settlements.slice(0, 4).map((settlement) => (
                    <div key={settlement.id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-mintsoft text-mint"><RotateCcw className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold">{settlement.payer.name} → {settlement.recipient.name}</p>
                        <p className="truncate text-[11px] text-muted">{settlement.group.name}</p>
                      </div>
                      <span className="text-xs font-extrabold text-mint">{formatMoney(settlement.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <Link href="/balances" className="soft-card flex items-center gap-4 p-6 transition hover:border-lav">
              <span className="grid size-12 place-items-center rounded-2xl bg-lavsoft text-lav">⚖️</span>
              <div className="flex-1">
                <p className="text-sm font-bold">See who owes what</p>
                <p className="mt-0.5 text-xs text-muted">Simplest way to settle every group.</p>
              </div>
              <ArrowRight className="size-4 text-lav" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
