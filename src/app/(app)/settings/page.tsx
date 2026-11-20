import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { PageHeader, Avatar } from "@/components/ui";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const user = await requireUser();
  const { updated } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Your account" title="Settings" subtitle="Manage your profile and session." />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="soft-card flex flex-col items-center p-8 text-center">
          <Avatar name={user.name} size="lg" />
          <p className="mt-4 text-lg font-extrabold">{user.name}</p>
          <p className="text-xs text-muted">{user.email}</p>
          <span className="mt-4 rounded-full bg-lavsoft px-3 py-1.5 text-[11px] font-bold text-lav">
            Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </span>
          <form action={logoutAction} className="mt-7 w-full border-t border-line pt-6">
            <button type="submit" className="w-full rounded-xl border border-coral/30 bg-coralsoft px-4 py-3 text-sm font-bold text-coral transition hover:bg-coral hover:text-white">
              Log out
            </button>
          </form>
        </div>
        <div className="soft-card p-6 sm:p-8">
          <h2 className="mb-5 text-base font-bold">Profile details</h2>
          <SettingsForm name={user.name} email={user.email} />
          {updated && <p className="mt-4 text-xs font-semibold text-mint">Your name was updated.</p>}
        </div>
      </div>
    </>
  );
}
