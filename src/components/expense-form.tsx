"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, UsersRound } from "lucide-react";
import { createExpenseAction } from "@/app/actions/expenses";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";

type GroupOption = { id: string; name: string; members: { id: string; name: string }[] };

export function ExpenseForm({
  groups,
  currentUserId,
  defaultGroupId,
}: {
  groups: GroupOption[];
  currentUserId: string;
  defaultGroupId?: string;
}) {
  const [state, formAction] = useActionState(createExpenseAction, {});
  const router = useRouter();
  const initial = groups.find((group) => group.id === defaultGroupId) ?? groups[0];
  const [groupId, setGroupId] = useState(initial?.id ?? "");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [participants, setParticipants] = useState<string[]>(
    initial?.members.map((member) => member.id) ?? [],
  );
  const [amount, setAmount] = useState("");

  const group = groups.find((item) => item.id === groupId) ?? initial;
  const preview = useMemo(() => {
    const paise = Math.round(Number(amount || 0) * 100);
    if (!paise || participants.length === 0) return null;
    const base = Math.floor(paise / participants.length);
    return `₹${(base / 100).toFixed(2)} each`;
  }, [amount, participants.length]);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  function changeGroup(id: string) {
    const next = groups.find((item) => item.id === id);
    setGroupId(id);
    setPaidBy(currentUserId);
    setParticipants(next?.members.map((member) => member.id) ?? []);
  }

  function toggleParticipant(id: string) {
    setParticipants((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  if (groups.length === 0) {
    return (
      <div className="soft-card p-8 text-center">
        <p className="text-sm font-bold">You need a group before adding an expense.</p>
        <p className="mt-1 text-sm text-muted">Create a group and invite your friends first.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="soft-card space-y-5 p-6 sm:p-8">
      <Alert error={state.error} success={state.success} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold">Group</label>
          <select name="groupId" value={groupId} onChange={(event) => changeGroup(event.target.value)} className="input-base" required>
            {groups.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold">Total amount (₹)</label>
          <input name="amount" type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1200.00" className="input-base" />
          {preview && <p className="mt-1.5 text-[11px] font-semibold text-lav">{preview} · remainder shared fairly</p>}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold">What was it for?</label>
        <input name="description" required minLength={2} maxLength={255} placeholder="Dinner by the beach" className="input-base" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold">Paid by</label>
        <select name="paidBy" value={paidBy} onChange={(event) => setPaidBy(event.target.value)} className="input-base" required>
          {group?.members.map((member) => (
            <option key={member.id} value={member.id}>{member.name}{member.id === currentUserId ? " (you)" : ""}</option>
          ))}
        </select>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold"><UsersRound className="size-4 text-lav" /> Split between</label>
          <button
            type="button"
            onClick={() => setParticipants(participants.length === group?.members.length ? [] : group?.members.map((member) => member.id) ?? [])}
            className="text-[11px] font-bold text-lav hover:underline"
          >
            {participants.length === group?.members.length ? "Clear all" : "Select all"}
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {group?.members.map((member) => {
            const checked = participants.includes(member.id);
            return (
              <label
                key={member.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm font-semibold transition ${
                  checked ? "border-lav bg-lavsoft text-lavdark" : "border-line bg-white text-muted hover:border-lav"
                }`}
              >
                <input
                  type="checkbox"
                  name="participants"
                  value={member.id}
                  checked={checked}
                  onChange={() => toggleParticipant(member.id)}
                  className="sr-only"
                />
                <span className={`grid size-5 place-items-center rounded-md border ${checked ? "border-lav bg-lav text-white" : "border-line"}`}>
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="truncate">{member.name}</span>
              </label>
            );
          })}
        </div>
      </div>
      <SubmitButton pendingText="Adding expense...">Add expense</SubmitButton>
    </form>
  );
}
