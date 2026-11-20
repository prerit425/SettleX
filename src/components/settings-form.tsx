"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";

export function SettingsForm({ name, email }: { name: string; email: string }) {
  const [state, formAction] = useActionState(updateSettingsAction, {});
  return (
    <form action={formAction} className="space-y-4">
      <Alert error={state.error} />
      <div>
        <label className="mb-1.5 block text-xs font-bold">Display name</label>
        <input name="name" required minLength={2} defaultValue={name} className="input-base" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold">Email address</label>
        <input value={email} disabled className="input-base cursor-not-allowed bg-cream text-muted" />
        <p className="mt-1.5 text-[11px] text-muted">Your email is used to sign in and can't be changed here.</p>
      </div>
      <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
    </form>
  );
}
