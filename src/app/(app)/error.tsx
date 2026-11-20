"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="soft-card mx-auto mt-10 max-w-lg p-8 text-center sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-coralsoft text-coral">
        <AlertTriangle className="size-6" />
      </span>
      <h2 className="mt-5 text-xl font-extrabold">Something went wrong</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
        We couldn&apos;t load this page. Your data is safe — try again, and reload the page if the
        problem continues.
      </p>
      {error.digest && (
        <p className="mt-3 text-[11px] text-muted">Reference: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(124,92,255,0.28)] transition hover:bg-lavdark"
      >
        <RotateCcw className="size-4" /> Try again
      </button>
    </div>
  );
}
