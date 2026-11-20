"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Wallet } from "lucide-react";
import { createSettlementAction } from "@/app/actions/settlements";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";

export type DebtOption = {
  key: string;
  groupId: string;
  groupName: string;
  paidTo: string;
  name: string;
  amount: string;
};

export function SettlementForm({ debts }: { debts: DebtOption[] }) {
  const [state, formAction] = useActionState(createSettlementAction, {});
  const router = useRouter();
  const [selected, setSelected] = useState(debts[0]?.key ?? "");
  const debt = debts.find((item) => item.key === selected) ?? debts[0];
  const [amount, setAmount] = useState(debt?.amount ?? "");

  useEffect(() => {
    if (state.success) {
      setAmount("");
      router.refresh();
    }
  }, [state.success, router]);

  if (debts.length === 0) {
    return (
      <div className="soft-card p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-mintsoft text-mint"><Wallet className="size-5" /></span>
        <p className="mt-3 text-sm font-bold">You're all settled up!</p>
        <p className="mt-1 text-xs text-muted">No outstanding payments from you right now.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="soft-card space-y-4 p-6">
      <input type="hidden" name="groupId" value={debt?.groupId ?? ""} />
      <input type="hidden" name="paidTo" value={debt?.paidTo ?? ""} />
      <Alert error={state.error} success={state.success} />
      <div>
        <label className="mb-1.5 block text-xs font-bold">Pay whom?</label>
        <select
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value);
            const next = debts.find((item) => item.key === event.target.value);
            setAmount(next?.amount ?? "");
          }}
          className="input-base"
        >
          {debts.map((item) => (
            <option key={item.key} value={item.key}>
              {item.name} · {item.groupName} · ₹{item.amount}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold">Amount (₹)</label>
        <input name="amount" type="number" min="0.01" step="0.01" max={debt?.amount} required value={amount} onChange={(event) => setAmount(event.target.value)} className="input-base" />
        <p className="mt-1.5 text-[11px] text-muted">Maximum payable: ₹{debt?.amount}</p>
      </div>
      <SubmitButton pendingText="Recording..." className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60">
        Record payment <ArrowRight className="size-4" />
      </SubmitButton>
    </form>
  );
}
