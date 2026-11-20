"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { addMemberAction } from "@/app/actions/groups";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";

export function AddMemberForm({ groupId }: { groupId: string }) {
  const [state, formAction] = useActionState(addMemberAction, {});
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="groupId" value={groupId} />
      <Alert error={state.error} success={state.success} />
      <div className="flex gap-2">
        <input name="email" type="email" required placeholder="friend@example.com" className="input-base" />
        <SubmitButton
          pendingText="Adding..."
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-lav px-4 py-3 text-xs font-bold text-white transition hover:bg-lavdark disabled:opacity-60"
        >
          <UserPlus className="size-4" /> Add
        </SubmitButton>
      </div>
    </form>
  );
}
