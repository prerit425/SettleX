"use client";

import { SubmitButton } from "@/components/submit-button";

export function ConfirmFormButton({
  action,
  hidden,
  label,
  confirmMessage,
  pendingText = "Working...",
  className = "rounded-xl border border-coral/30 bg-coralsoft px-4 py-2.5 text-xs font-bold text-coral transition hover:bg-coral hover:text-white disabled:opacity-60",
}: {
  action: (formData: FormData) => Promise<void>;
  hidden?: { name: string; value: string }[];
  label: string;
  confirmMessage: string;
  pendingText?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {hidden?.map(({ name, value }) => (
        <input key={`${name}-${value}`} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton className={className} pendingText={pendingText}>
        {label}
      </SubmitButton>
    </form>
  );
}
