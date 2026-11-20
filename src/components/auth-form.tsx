"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, Lock, UserRound } from "lucide-react";
import { loginAction, signupAction, type AuthState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="space-y-4">
      <Alert error={state.error} />
      {isSignup && (
        <Field label="Your name" icon={<UserRound className="size-4" />}>
          <input name="name" required minLength={2} placeholder="Aditi Sharma" className="input-base pl-10" />
        </Field>
      )}
      <Field label="Email address" icon={<Mail className="size-4" />}>
        <input name="email" type="email" required placeholder="you@example.com" className="input-base pl-10" />
      </Field>
      <Field label="Password" icon={<Lock className="size-4" />}>
        <input
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : 1}
          placeholder={isSignup ? "At least 8 characters" : "Your password"}
          className="input-base pl-10"
        />
      </Field>
      <SubmitButton className="w-full rounded-2xl bg-lav px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(124,92,255,0.28)] transition hover:bg-lavdark disabled:opacity-60">
        {isSignup ? "Create your account" : "Log in"}
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        {isSignup ? "Already have an account?" : "New to SettleX?"}{" "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-bold text-lav hover:underline">
          {isSignup ? "Log in" : "Sign up free"}
        </Link>
      </p>
    </form>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        {children}
      </span>
    </label>
  );
}
