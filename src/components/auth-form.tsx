"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, UserRound, ShieldCheck } from "lucide-react";
import { loginAction, signupAction, type AuthState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";

export function AuthForm({
  mode,
  nextPath = "/dashboard",
  showDemo = false,
}: {
  mode: "login" | "signup";
  nextPath?: string;
  showDemo?: boolean;
}) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const isSignup = mode === "signup";
  const score = useMemo(() => passwordScore(password), [password]);

  return (
    <form action={formAction} className="space-y-4" noValidate={false}>
      <input type="hidden" name="next" value={nextPath} />
      <Alert error={state.error} />

      {isSignup && (
        <Field id="name" label="Your name" icon={<UserRound className="size-4" />}>
          <input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Aditi Sharma" className="input-base pl-10" />
        </Field>
      )}

      <Field id="email" label="Email address" icon={<Mail className="size-4" />}>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input-base pl-10" />
      </Field>

      <Field id="password" label="Password" icon={<Lock className="size-4" />}>
        <input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          required
          minLength={isSignup ? 8 : 1}
          maxLength={100}
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder={isSignup ? "At least 8 characters" : "Your password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="input-base pl-10 pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-lav"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </Field>

      {isSignup && password.length > 0 && (
        <div className="pt-0.5">
          <div className="mb-1.5 flex gap-1.5">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index < score
                    ? score <= 1
                      ? "bg-coral"
                      : score === 2
                        ? "bg-[#f5b73d]"
                        : "bg-mint"
                    : "bg-line"
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted">
            {score <= 1 ? "Weak — add length, a letter and a number" : score === 2 ? "Fair — make it longer" : score === 3 ? "Good password" : "Strong password"}
          </p>
          <p className="mt-1 text-[11px] text-muted">Use at least 8 characters with a letter and a number.</p>
        </div>
      )}

      <SubmitButton className="w-full rounded-2xl bg-lav px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(124,92,255,0.28)] transition hover:bg-lavdark disabled:opacity-60">
        {isSignup ? "Create your account" : "Log in securely"}
      </SubmitButton>

      {isSignup ? (
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-lav hover:underline">Log in</Link>
        </p>
      ) : (
        <>
          <p className="text-center text-sm text-muted">
            New to SettleX?{" "}
            <Link href="/signup" className="font-bold text-lav hover:underline">Sign up free</Link>
          </p>
          {showDemo && (
            <div className="rounded-2xl border border-dashed border-lav/30 bg-lavsoft/50 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-lavdark">
                <ShieldCheck className="size-3.5" /> Local demo accounts
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                aditi.test@example.com · rohan.test@example.com<br />Password: password123
              </p>
            </div>
          )}
        </>
      )}
      {pending && <span className="sr-only" role="status">Signing you in…</span>}
    </form>
  );
}

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-ink">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        {children}
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
