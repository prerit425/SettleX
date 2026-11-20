import Link from "next/link";
import { ArrowRight, ReceiptText, Scale, UsersRound, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/ui";

export default async function LandingPage() {
  const user = await getCurrentUser();
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="blob -left-40 top-20 size-[28rem] bg-[#e9e0ff]" />
      <div className="blob -right-40 top-96 size-[28rem] bg-[#dff5ec]" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-muted transition hover:text-ink">
              Log in
            </Link>
            <Link href="/signup" className="rounded-xl bg-lav px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(124,92,255,0.28)] transition hover:bg-lavdark">
              Get started
            </Link>
          </div>
        </header>

        <main className="grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <div className="rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-bold text-lav">
              <Sparkles className="size-3.5" /> Expenses, without the awkwardness
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-6xl">
              Split the bill.
              <br />
              <span className="text-lav">Keep the friends.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              SettleX tracks every shared expense, splits it fairly down to the last paisa, and tells
              your group exactly who owes whom. No spreadsheets. No awkward texts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="flex items-center gap-2 rounded-2xl bg-lav px-6 py-4 text-sm font-bold text-white shadow-[0_14px_32px_rgba(124,92,255,0.32)] transition hover:-translate-y-0.5 hover:bg-lavdark"
              >
                {user ? "Open your dashboard" : "Start splitting free"} <ArrowRight className="size-4" />
              </Link>
              <Link href="#how" className="rounded-2xl border border-line bg-white px-6 py-4 text-sm font-bold text-ink transition hover:border-lav">
                See how it works
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-muted">
              <span>✓ Equal splits, exact paise</span>
              <span>✓ Group balances</span>
              <span>✓ One-tap settlements</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md rise">
            <div className="absolute -left-6 -top-6 size-24 rounded-full bg-lavsoft" />
            <div className="soft-card relative overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted">Goa Trip · your balance</p>
                  <p className="mt-1 text-3xl font-extrabold text-mint">₹1,250.00</p>
                  <p className="text-xs text-muted">you should receive</p>
                </div>
                <span className="grid size-12 place-items-center rounded-2xl bg-mintsoft text-2xl">🏖️</span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { name: "Beachside dinner", who: "Aditi paid · 4 people", amount: "₹3,200", tone: "bg-lavsoft text-lav" },
                  { name: "Scooter rental", who: "Rohan paid · 2 people", amount: "₹900", tone: "bg-mintsoft text-mint" },
                  { name: "Settled with Neha", who: "Payment recorded", amount: "₹500", tone: "bg-coralsoft text-coral" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                    <span className={`grid size-9 place-items-center rounded-xl ${item.tone}`}>
                      <ReceiptText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="text-[11px] text-muted">{item.who}</p>
                    </div>
                    <span className="text-sm font-bold">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="soft-card absolute -bottom-8 -left-8 flex items-center gap-3 p-4 lg:-left-14">
              <span className="grid size-10 place-items-center rounded-xl bg-lavsoft text-lav"><Scale className="size-5" /></span>
              <div>
                <p className="text-xs font-bold">All settled up ✨</p>
                <p className="text-[11px] text-muted">Balances update instantly</p>
              </div>
            </div>
            <div className="soft-card absolute -right-4 -top-10 flex items-center gap-2 p-3">
              <UsersRound className="size-4 text-mint" />
              <span className="text-xs font-bold">4 friends in the group</span>
            </div>
          </div>
        </main>

        <section id="how" className="grid gap-5 border-t border-line py-14 sm:grid-cols-3">
          {[
            { icon: UsersRound, title: "Make a group", text: "Invite friends by email. Everyone sees the same shared ledger." },
            { icon: ReceiptText, title: "Add an expense", text: "Enter the bill, choose who joined, and we split it exactly." },
            { icon: Scale, title: "Settle up", text: "See the simplest way to clear debts and record real payments." },
          ].map((item, index) => (
            <div key={item.title} className="soft-card p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-lavsoft text-lav">
                <item.icon className="size-5" />
              </span>
              <p className="mt-4 text-sm font-bold">{index + 1}. {item.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </section>
        <footer className="border-t border-line py-8 text-center text-xs font-semibold text-muted">
          Made for friends who like fair splits and less math. © SettleX
        </footer>
      </div>
    </div>
  );
}
