import { listMembers } from "@/features/members/manage-members/query";

import { MembersPageWrapper } from "./members-page-wrapper";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const members = await listMembers(serviceId);

  return (
    <div className="p-6">
      <MembersPageWrapper serviceId={serviceId} initialMembers={members} />
    </div>
  );
}
