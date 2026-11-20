import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { GroupForm } from "@/components/group-form";

export default function NewGroupPage() {
  return (
    <>
      <Link href="/groups" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-lav">
        <ArrowLeft className="size-3.5" /> Back to groups
      </Link>
      <PageHeader
        eyebrow="New circle"
        title="Create a group"
        subtitle="You'll be added automatically. Invite friends by email to get started."
      />
      <div className="mx-auto max-w-2xl"><GroupForm /></div>
    </>
  );
}
