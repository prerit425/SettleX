import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/ui";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div className="blob -left-32 top-0 size-80 bg-[#e9e0ff]" />
      <div className="blob -right-32 bottom-0 size-80 bg-[#dff5ec]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="soft-card rise p-7 sm:p-9">
          <span className="inline-flex rounded-full bg-lavsoft px-3 py-1 text-[11px] font-bold text-lav">
            FREE TO START
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Split happier, starting now ✨</h1>
          <p className="mb-7 mt-1.5 text-sm text-muted">Create your account and invite your people.</p>
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}
