import Link from "next/link";
import { ArrowRight, LockKeyhole, Scale, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Logo } from "@/components/ui";

const highlights = [
  { icon: UsersRound, title: "Groups that stay in sync", text: "Everyone sees the same shared ledger." },
  { icon: Scale, title: "Fair to the last paisa", text: "Exact splits with no rounding arguments." },
  { icon: LockKeyhole, title: "Private by design", text: "Your data is only visible to group members." },
];

export function AuthShell({
  badge,
  title,
  subtitle,
  children,
}: {
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <div className="blob -left-40 top-10 size-[26rem] bg-[#e9e0ff]" />
      <div className="blob -right-40 bottom-0 size-[24rem] bg-[#dff5ec]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand / marketing panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#1c1b3f] px-12 py-12 text-white lg:flex xl:px-20">
          <div className="pointer-events-none absolute -right-28 -top-24 size-96 rounded-full bg-lav/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-mint/20 blur-3xl" />

          <div className="relative">
            <Logo />
          </div>

          <div className="relative max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-[#d9cdff] backdrop-blur">
              <Sparkles className="size-3.5" /> {badge}
            </span>
            <h2 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight xl:text-5xl">
              Split the bill.
              <br />
              <span className="text-[#b9a5ff]">Keep the friends.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/60 xl:text-base">
              SettleX tracks every shared expense, splits it fairly, and tells your group exactly who
              owes whom. No spreadsheets. No awkward texts.
            </p>

            <div className="mt-10 space-y-4">
              {highlights.map(({ icon: Icon, title: itemTitle, text }) => (
                <div key={itemTitle} className="flex items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 text-[#cbbcff] backdrop-blur">
                    <Icon className="size-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{itemTitle}</p>
                    <p className="mt-0.5 text-xs text-white/50">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60 backdrop-blur">
            <ShieldCheck className="size-4 shrink-0 text-mint" />
            Encrypted passwords · Hashed sessions · No shared data leaks
          </div>
        </section>

        {/* Form panel */}
        <section className="flex flex-col px-5 py-7 sm:px-10 lg:px-14 xl:px-20">
          <div className="flex items-center justify-between lg:justify-end">
            <div className="lg:hidden">
              <Logo />
            </div>
            <Link
              href="/"
              className="flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-lav"
            >
              Back to home <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="my-auto flex w-full max-w-md flex-col py-10 lg:py-0">
            <div className="soft-card rise p-6 sm:p-9">
              <span className="inline-flex rounded-full bg-lavsoft px-3 py-1 text-[11px] font-bold text-lav">
                {badge}
              </span>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mb-7 mt-1.5 text-sm leading-relaxed text-muted">{subtitle}</p>
              {children}
            </div>
            <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
              By continuing, you agree to use SettleX responsibly for shared expenses with friends
              who consent to be in your groups.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
