import Link from "next/link";
import { Logo } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <div className="mb-6 flex justify-center"><Logo /></div>
        <p className="text-6xl font-black text-lav">404</p>
        <h1 className="mt-3 text-xl font-extrabold">That page went missing</h1>
        <p className="mt-2 text-sm text-muted">It may have been removed, or you may not have access.</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white">Back to dashboard</Link>
      </div>
    </div>
  );
}
