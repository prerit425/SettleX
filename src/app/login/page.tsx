import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirect";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; all?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { next, all } = await searchParams;
  const showDemo = process.env.NODE_ENV !== "production";

  return (
    <AuthShell
      badge="WELCOME BACK"
      title="Log in to SettleX"
      subtitle={
        all
          ? "You've been signed out of every device. Log in again to continue."
          : "Pick up right where you left off with your groups and balances."
      }
    >
      <AuthForm mode="login" nextPath={safeNextPath(next)} showDemo={showDemo} />
    </AuthShell>
  );
}
