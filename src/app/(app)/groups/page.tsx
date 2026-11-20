import Link from "next/link";
import { Plus, ArrowRight, UsersRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getLedger } from "@/lib/balances";
import { PageHeader, GroupIcon, AvatarStack, EmptyState } from "@/components/ui";

export default async function GroupsPage() {
  const user = await requireUser();
  const ledger = await getLedger(user.id);

  return (
    <>
      <PageHeader
        eyebrow="Your circles"
        title="Groups"
        subtitle="Every shared ledger you're part of."
        action={
          <Link href="/groups/new" className="flex items-center gap-2 self-start rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(124,92,255,0.28)] transition hover:bg-lavdark">
            <Plus className="size-4" /> New group
          </Link>
        }
      />
      {ledger.groups.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="size-9" />}
          title="No groups yet"
          description="Groups keep expenses organised by trip, home or event. Create one and invite your friends."
          action={<Link href="/groups/new" className="rounded-2xl bg-lav px-5 py-3 text-sm font-bold text-white">Create a group</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ledger.groups.map((group, index) => (
            <Link key={group.id} href={`/groups/${group.id}`} className="soft-card soft-card-hover group flex flex-col p-6">
              <div className="flex items-start justify-between">
                <GroupIcon name={group.name} index={index} />
                <ArrowRight className="size-5 text-muted transition group-hover:translate-x-1 group-hover:text-lav" />
              </div>
              <h2 className="mt-5 text-lg font-extrabold">{group.name}</h2>
              <p className="mt-1 min-h-10 text-sm leading-relaxed text-muted">
                {group.description || "A shared space for your expenses."}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <AvatarStack names={group.members.map((member) => member.user.name)} />
                <span className="text-xs font-semibold text-muted">{group.members.length} members</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
