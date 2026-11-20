"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { changePasswordAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";

export function PasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, {});
  const [newPassword, setNewPassword] = useState("");
  const strength = useMemo(() => passwordScore(newPassword), [newPassword]);

  return (
    <form action={formAction} className="space-y-4">
      <Alert error={state.error} />
      <PasswordInput
        id="currentPassword"
        name="currentPassword"
        label="Current password"
        autoComplete="current-password"
        placeholder="Your current password"
      />
      <div>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters, letter + number"
          value={newPassword}
          onChange={setNewPassword}
        />
        {newPassword.length > 0 && (
          <div className="mt-2">
            <div className="mb-1.5 flex gap-1.5">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index < strength
                      ? strength <= 1
                        ? "bg-coral"
                        : strength === 2
                          ? "bg-[#f5b73d]"
                          : "bg-mint"
                      : "bg-line"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted">
              {strength <= 1 ? "Weak" : strength === 2 ? "Fair" : strength === 3 ? "Good" : "Strong"}
              {" · "}8+ characters with a letter and a number.
            </p>
          </div>
        )}
      </div>
      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Repeat your new password"
      />
      <div className="rounded-xl bg-cream p-3 text-[11px] leading-relaxed text-muted">
        <span className="font-bold text-ink">Security notice:</span> changing your password signs
        you out of all other devices automatically. Your current session stays active.
      </div>
      <SubmitButton pendingText="Updating password...">Update password</SubmitButton>
    </form>
  );
}

function PasswordInput({
  id,
  name,
  label,
  autoComplete,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-ink">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <LockKeyhole className="size-4" />
        </span>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          maxLength={100}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="input-base pl-10 pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-lav"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(score, 4);
}
