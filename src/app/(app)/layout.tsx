import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell user={{ name: user.name, email: user.email }}>{children}</AppShell>
  );
}
