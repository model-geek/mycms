import type { MemberWithUser } from "@/features/members/model";

import { MembersPageWrapper } from "./members-page-wrapper";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  // TODO: Fetch members from backend (integrated at merge time)
  const members: MemberWithUser[] = [];

  return (
    <div className="p-6">
      <MembersPageWrapper serviceId={serviceId} initialMembers={members} />
    </div>
  );
}
