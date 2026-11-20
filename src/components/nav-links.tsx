"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UsersRound,
  ReceiptText,
  Scale,
  Settings,
  Plus,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: UsersRound },
  { href: "/activity", label: "Activity", icon: ReceiptText },
  { href: "/balances", label: "Balances", icon: Scale },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavLinks({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();
  if (variant === "mobile") {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {links.slice(0, 2).map(({ href, label, icon: Icon }) => (
            <MobileLink key={href} href={href} label={label} Icon={Icon} active={pathname.startsWith(href)} />
          ))}
          <Link
            href="/expenses/new"
            className="-mt-6 grid size-12 place-items-center rounded-2xl bg-lav text-white shadow-[0_10px_24px_rgba(124,92,255,0.4)]"
            aria-label="Add expense"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </Link>
          {links.slice(2, 4).map(({ href, label, icon: Icon }) => (
            <MobileLink key={href} href={href} label={label} Icon={Icon} active={pathname.startsWith(href)} />
          ))}
        </div>
      </nav>
    );
  }
  return (
    <nav className="mt-8 space-y-1.5">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              active
                ? "bg-lavsoft text-lavdark"
                : "text-muted hover:bg-white hover:text-ink"
            }`}
          >
            <Icon className="size-[18px]" strokeWidth={active ? 2.5 : 2} />
            {label}
            {active && <span className="ml-auto size-1.5 rounded-full bg-lav" />}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-16 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-semibold ${
        active ? "text-lav" : "text-muted"
      }`}
    >
      <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
      {label}
    </Link>
  );
}
