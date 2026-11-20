import Link from "next/link";
import { Sparkles, Wallet } from "lucide-react";
import type { ReactNode } from "react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="group flex items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-2xl bg-lav text-white shadow-[0_8px_20px_rgba(124,92,255,0.35)] transition-transform group-hover:-rotate-6">
        <Wallet className="size-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-ink">
          Settle<span className="text-lav">X</span>
        </span>
      )}
    </Link>
  );
}

const avatarColors = [
  "bg-[#efeaff] text-[#6543ea]",
  "bg-[#e4f8f0] text-[#0a8f68]",
  "bg-[#fff0ea] text-[#d95a37]",
  "bg-[#fff5d6] text-[#a77b09]",
  "bg-[#e8f0ff] text-[#3b68c9]",
  "bg-[#fbe8f5] text-[#b44393]",
];

export function Avatar({
  name,
  index = 0,
  size = "md",
}: {
  name: string;
  index?: number;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const sizes = {
    sm: "size-7 text-[10px]",
    md: "size-9 text-xs",
    lg: "size-11 text-sm",
  };
  return (
    <span
      title={name}
      className={`grid shrink-0 place-items-center rounded-full font-bold ${sizes[size]} ${avatarColors[index % avatarColors.length]}`}
    >
      {initials || "?"}
    </span>
  );
}

export function AvatarStack({ names }: { names: string[] }) {
  return (
    <div className="flex items-center -space-x-2">
      {names.slice(0, 4).map((name, index) => (
        <Avatar key={`${name}-${index}`} name={name} index={index} size="sm" />
      ))}
      {names.length > 4 && (
        <span className="grid size-7 place-items-center rounded-full bg-line text-[10px] font-bold text-muted">
          +{names.length - 4}
        </span>
      )}
    </div>
  );
}

const iconColors = [
  "bg-[#efeaff] text-[#6543ea]",
  "bg-[#e4f8f0] text-[#0a8f68]",
  "bg-[#fff0ea] text-[#d95a37]",
  "bg-[#fff5d6] text-[#a77b09]",
  "bg-[#e8f0ff] text-[#3b68c9]",
];

export function GroupIcon({ name, index = 0 }: { name: string; index?: number }) {
  return (
    <span
      className={`grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-black ${iconColors[index % iconColors.length]}`}
    >
      {name.trim()[0]?.toUpperCase() ?? "G"}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 rise">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-lav">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="soft-card flex flex-col items-center px-6 py-12 text-center">
      <div className="relative mb-5 grid size-20 place-items-center rounded-[1.75rem] bg-lavsoft text-lav">
        <span className="absolute -right-2 -top-2 size-5 rounded-full bg-mintsoft" />
        <span className="absolute -bottom-1 -left-3 size-3 rounded-full bg-coralsoft" />
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "lav",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "lav" | "mint" | "coral" | "ink";
}) {
  const tones = {
    lav: "bg-lavsoft text-lav",
    mint: "bg-mintsoft text-mint",
    coral: "bg-coralsoft text-coral",
    ink: "bg-[#efeff7] text-ink",
  };
  return (
    <div className="soft-card soft-card-hover p-5">
      <div className={`mb-4 grid size-10 place-items-center rounded-xl ${tones[tone]}`}>
        <Sparkles className="size-5" />
      </div>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-[11px] text-muted">{hint}</p>
    </div>
  );
}

export function Alert({ error, success }: { error?: string | null; success?: string | null }) {
  if (!error && !success) return null;
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm font-medium ${
        error ? "bg-coralsoft text-coral" : "bg-mintsoft text-mint"
      }`}
      role="status"
    >
      {error || success}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-ink">{children}</h2>
      {action}
    </div>
  );
}
