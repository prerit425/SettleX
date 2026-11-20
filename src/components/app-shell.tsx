import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { Logo, Avatar } from "@/components/ui";
import { NavLinks } from "@/components/nav-links";
import { logoutAction } from "@/app/actions/auth";

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="blob -left-32 top-10 size-80 bg-[#e9e0ff]" />
      <div className="blob -right-40 top-72 size-96 bg-[#dff5ec]" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white/80 px-5 py-6 backdrop-blur-xl lg:flex">
        <Logo />
        <NavLinks />
        <Link
          href="/expenses/new"
          className="mt-7 flex items-center justify-center gap-2 rounded-2xl bg-lav px-4 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(124,92,255,0.3)] transition hover:-translate-y-0.5 hover:bg-lavdark"
        >
          <Plus className="size-4" strokeWidth={2.6} /> Add expense
        </Link>
        <div className="mt-auto rounded-2xl border border-line bg-white p-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={user.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-[11px] text-muted">{user.email}</p>
            </div>
          </div>
          <form action={logoutAction} className="mt-3 border-t border-line pt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-xs font-semibold text-muted transition hover:text-coral"
            >
              <LogOut className="size-3.5" /> Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-cream/90 px-4 py-3 backdrop-blur lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/expenses/new"
              className="flex items-center gap-1.5 rounded-xl bg-lav px-3 py-2 text-xs font-bold text-white"
            >
              <Plus className="size-4" /> Expense
            </Link>
            <Avatar name={user.name} size="sm" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-8 lg:pb-14 lg:pt-9">
          {children}
        </main>
      </div>

      <NavLinks variant="mobile" />
    </div>
  );
}
