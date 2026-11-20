import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirect";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { next } = await searchParams;

  return (
    <AuthShell
      badge="FREE TO START"
      title="Create your account"
      subtitle="Join SettleX and make shared expenses the easiest part of any trip."
    >
      <AuthForm mode="signup" nextPath={safeNextPath(next)} />
    </AuthShell>
  );
}
