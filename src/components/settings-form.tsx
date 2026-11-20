"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";

export function SettingsForm({ name, email }: { name: string; email: string }) {
  const [state, formAction] = useActionState(updateSettingsAction, {});
  return (
    <form action={formAction} className="space-y-4">
      <Alert error={state.error} success={state.success} />
      <div>
        <label htmlFor="profile-name" className="mb-1.5 block text-xs font-bold text-ink">
          Display name
        </label>
        <input
          id="profile-name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={name}
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="profile-email" className="mb-1.5 block text-xs font-bold text-ink">
          Email address
        </label>
        <input
          id="profile-email"
          value={email}
          disabled
          className="input-base cursor-not-allowed bg-cream text-muted"
        />
        <p className="mt-1.5 text-[11px] text-muted">
          Your email is used to sign in and can&apos;t be changed here.
        </p>
      </div>
      <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
    </form>
  );
}
