"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  pendingText = "Saving...",
  className = "rounded-xl bg-lav px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(124,92,255,0.25)] transition hover:bg-lavdark disabled:cursor-not-allowed disabled:opacity-60",
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
