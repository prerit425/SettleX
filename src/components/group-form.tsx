"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, UsersRound } from "lucide-react";
import { createGroupAction } from "@/app/actions/groups";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";

export function GroupForm() {
  const [state, formAction] = useActionState(createGroupAction, {});
  const [emails, setEmails] = useState([""]);
  const router = useRouter();
  useEffect(() => {
    if (state.success) router.push(`/groups/${state.success}`);
  }, [state.success, router]);

  return (
    <form action={formAction} className="soft-card space-y-5 p-6 sm:p-8">
      <Alert error={state.error} />
      <div>
        <label className="mb-1.5 block text-xs font-bold">Group name</label>
        <input name="name" required minLength={2} maxLength={120} placeholder="Goa Trip" className="input-base" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold">Description <span className="font-normal text-muted">(optional)</span></label>
        <textarea name="description" rows={3} maxLength={500} placeholder="Three days of sun, sand and seafood" className="input-base resize-none" />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold">
            <UsersRound className="size-4 text-lav" /> Invite friends by email
          </label>
          <button
            type="button"
            onClick={() => setEmails([...emails, ""])}
            className="flex items-center gap-1 text-xs font-bold text-lav hover:underline"
          >
            <Plus className="size-3.5" /> Add another
          </button>
        </div>
        <p className="mb-3 text-[11px] text-muted">They need an existing SettleX account. You can add more later.</p>
        <div className="space-y-2">
          {emails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <input
                name="emails"
                type="email"
                value={email}
                onChange={(event) => {
                  const next = [...emails];
                  next[index] = event.target.value;
                  setEmails(next);
                }}
                placeholder="friend@example.com"
                className="input-base"
              />
              {emails.length > 1 && (
                <button
                  type="button"
                  onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-coral hover:text-coral"
                  aria-label="Remove email"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <SubmitButton pendingText="Creating...">Create group</SubmitButton>
    </form>
  );
}
