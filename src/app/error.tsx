"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Logo } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div className="soft-card w-full max-w-md p-8 sm:p-10">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-coralsoft text-coral">
          <AlertTriangle className="size-5" />
        </span>
        <h1 className="mt-4 text-lg font-extrabold">Something went wrong</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The page couldn&apos;t be loaded. Please try again.
        </p>
        {error.digest && <p className="mt-2 text-[11px] text-muted">Reference: {error.digest}</p>}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white transition hover:bg-lavdark"
        >
          <RotateCcw className="size-4" /> Try again
        </button>
      </div>
    </div>
  );
}
