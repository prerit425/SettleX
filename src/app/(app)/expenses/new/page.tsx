import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ExpenseForm } from "@/components/expense-form";

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const user = await requireUser();
  const { group: groupId } = await searchParams;
  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: user.id } } },
    include: { members: { include: { user: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-lav">
        <ArrowLeft className="size-3.5" /> Dashboard
      </Link>
      <PageHeader
        eyebrow="Shared bill"
        title="Add an expense"
        subtitle="We split it equally and distribute the leftover paise fairly."
      />
      <div className="mx-auto max-w-2xl">
        <ExpenseForm
          groups={groups.map((group) => ({
            id: group.id,
            name: group.name,
            members: group.members.map((member) => ({ id: member.user.id, name: member.user.name })),
          }))}
          currentUserId={user.id}
          defaultGroupId={groupId}
        />
      </div>
    </>
  );
}
