import Link from "next/link";
import { ReceiptText, RotateCcw } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getLedger } from "@/lib/balances";
import { formatMoney } from "@/lib/money";
import { PageHeader, EmptyState, SectionTitle, Avatar } from "@/components/ui";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const user = await requireUser();
  const { group: groupFilter } = await searchParams;
  const ledger = await getLedger(user.id);
  const expenses = groupFilter
    ? ledger.expenses.filter((expense) => expense.groupId === groupFilter)
    : ledger.expenses;
  const settlements = groupFilter
    ? ledger.settlements.filter((settlement) => settlement.groupId === groupFilter)
    : ledger.settlements;

  return (
    <>
      <PageHeader
        eyebrow="The full story"
        title="Activity"
        subtitle="Every expense and payment, all in one timeline."
        action={
          <Link href="/expenses/new" className="self-start rounded-2xl border border-line bg-white px-5 py-3 text-sm font-bold transition hover:border-lav">
            + Add expense
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/activity" className={`rounded-full px-4 py-2 text-xs font-bold transition ${!groupFilter ? "bg-lav text-white" : "border border-line bg-white text-muted hover:border-lav"}`}>
          All groups
        </Link>
        {ledger.groups.map((group) => (
          <Link key={group.id} href={`/activity?group=${group.id}`} className={`rounded-full px-4 py-2 text-xs font-bold transition ${groupFilter === group.id ? "bg-lav text-white" : "border border-line bg-white text-muted hover:border-lav"}`}>
            {group.name}
          </Link>
        ))}
      </div>

      {expenses.length === 0 && settlements.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="size-9" />}
          title="Nothing here yet"
          description="Once you add expenses or record payments, your full timeline will appear here."
          action={<Link href="/expenses/new" className="rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white">Add an expense</Link>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section>
            <SectionTitle>Expenses ({expenses.length})</SectionTitle>
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="soft-card p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavsoft text-lav"><ReceiptText className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold">{expense.description}</p>
                        <p className="shrink-0 font-extrabold">{formatMoney(expense.amount)}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted">{expense.group.name} · paid by {expense.payer.name} · {new Date(expense.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                        {expense.participants.map((participant, index) => (
                          <span key={participant.id} className="flex items-center gap-1.5 rounded-full bg-cream py-1 pl-1 pr-2.5 text-[11px] font-semibold text-muted">
                            <Avatar name={participant.user?.name ?? "Member"} index={index} size="sm" />
                            {formatMoney(participant.shareAmount)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <SectionTitle>Settlements ({settlements.length})</SectionTitle>
            {settlements.length === 0 ? (
              <div className="soft-card p-6 text-center text-sm text-muted">No payments recorded.</div>
            ) : (
              <div className="space-y-3">
                {settlements.map((settlement) => (
                  <div key={settlement.id} className="soft-card flex items-center gap-3 p-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-mintsoft text-mint"><RotateCcw className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{settlement.payer.name} → {settlement.recipient.name}</p>
                      <p className="truncate text-[11px] text-muted">{settlement.group.name} · {new Date(settlement.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <span className="text-sm font-extrabold text-mint">{formatMoney(settlement.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
