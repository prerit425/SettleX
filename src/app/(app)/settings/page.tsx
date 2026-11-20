import {
  CalendarDays,
  CheckCircle2,
  KeyRound,
  Laptop,
  LogOut,
  MonitorSmartphone,
  ReceiptText,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { requireUser, getCurrentSessionHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { describeDevice, relativeExpiry } from "@/lib/session-info";
import { logoutAction, logoutEverywhereAction, revokeSessionAction } from "@/app/actions/auth";
import { PageHeader, Avatar, Alert, SectionTitle } from "@/components/ui";
import { SettingsForm } from "@/components/settings-form";
import { PasswordForm } from "@/components/password-form";
import { ConfirmFormButton } from "@/components/confirm-form-button";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string }>;
}) {
  const user = await requireUser();
  const [{ password }, currentHash, groupCount, expenseCount, sessions] = await Promise.all([
    searchParams,
    getCurrentSessionHash(),
    prisma.groupMember.count({ where: { userId: user.id } }),
    prisma.expense.count({ where: { participants: { some: { userId: user.id } } } }),
    prisma.session.findMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Profile & security"
        subtitle="Manage your details, password and active sessions."
      />

      {password === "changed" && (
        <div className="mb-6">
          <Alert success="Password updated. All other devices have been signed out." />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <section className="soft-card flex flex-col items-center p-8 text-center">
            <Avatar name={user.name} size="lg" />
            <p className="mt-4 text-lg font-extrabold">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-lavsoft px-3 py-1.5 text-[11px] font-bold text-lav">
              <CalendarDays className="size-3.5" />
              Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </span>

            <div className="mt-6 grid w-full grid-cols-2 gap-2 border-t border-line pt-6">
              <div className="rounded-2xl bg-cream p-3">
                <UsersRound className="mx-auto size-4 text-lav" />
                <p className="mt-1.5 text-lg font-extrabold">{groupCount}</p>
                <p className="text-[10px] font-semibold text-muted">Groups</p>
              </div>
              <div className="rounded-2xl bg-cream p-3">
                <ReceiptText className="mx-auto size-4 text-mint" />
                <p className="mt-1.5 text-lg font-extrabold">{expenseCount}</p>
                <p className="text-[10px] font-semibold text-muted">Expenses</p>
              </div>
            </div>

            <form action={logoutAction} className="mt-6 w-full border-t border-line pt-6">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-bold text-muted transition hover:border-coral hover:text-coral"
              >
                <LogOut className="size-4" /> Log out of this device
              </button>
            </form>
          </section>

          <section className="soft-card p-6">
            <SectionTitle>
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-lav" /> Security at a glance
              </span>
            </SectionTitle>
            <ul className="space-y-3 text-xs text-muted">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>Passwords are hashed with bcrypt. We never store them in plain text.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>Sessions are random tokens stored only as SHA-256 hashes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>Failed logins are rate-limited after 5 attempts per 15 minutes.</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="soft-card p-6 sm:p-8">
            <SectionTitle>
              <span className="flex items-center gap-2">
                <MonitorSmartphone className="size-4 text-lav" /> Profile details
              </span>
            </SectionTitle>
            <SettingsForm name={user.name} email={user.email} />
          </section>

          <section className="soft-card p-6 sm:p-8">
            <SectionTitle>
              <span className="flex items-center gap-2">
                <KeyRound className="size-4 text-lav" /> Change password
              </span>
            </SectionTitle>
            <PasswordForm />
          </section>

          <section className="soft-card p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <SectionTitle>
                <span className="flex items-center gap-2">
                  <Laptop className="size-4 text-lav" /> Active sessions ({sessions.length})
                </span>
              </SectionTitle>
              {sessions.length > 1 && (
                <ConfirmFormButton
                  action={logoutEverywhereAction}
                  label="Log out everywhere"
                  confirmMessage="Sign out of all devices, including this one?"
                />
              )}
            </div>

            <div className="space-y-2.5">
              {sessions.map((session) => {
                const isCurrent = session.tokenHash === currentHash;
                return (
                  <div
                    key={session.id}
                    className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3.5 ${
                      isCurrent ? "border-lav/30 bg-lavsoft/40" : "border-line bg-cream"
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        isCurrent ? "bg-lav text-white" : "bg-white text-muted"
                      }`}
                    >
                      <Laptop className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                        {describeDevice(session.userAgent)}
                        {isCurrent && (
                          <span className="rounded-full bg-lav px-2 py-0.5 text-[10px] font-bold text-white">
                            This device
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        Signed in {new Date(session.createdAt).toLocaleString("en-IN")} · {relativeExpiry(session.expiresAt)}
                      </p>
                    </div>
                    {!isCurrent && (
                      <ConfirmFormButton
                        action={revokeSessionAction}
                        hidden={[{ name: "sessionId", value: session.id }]}
                        label="Revoke"
                        confirmMessage="Sign this device out? It will need to log in again."
                        className="rounded-lg border border-line bg-white px-3 py-2 text-[11px] font-bold text-coral transition hover:border-coral disabled:opacity-60"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              Revoking a session signs that device out immediately. Changing your password signs out
              every other device automatically.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
