"use client";

import { Plus } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

import { InviteMemberDialog } from "@/features/members/invite-member/components/invite-member-dialog";
import { MemberList } from "@/features/members/manage-members/components/member-list";
import type { MemberWithUser } from "@/features/members/model";
import type { Role } from "@/features/members/permissions";
import { Button } from "@/shared/ui/button";

interface MembersPageWrapperProps {
  serviceId: string;
  initialMembers: MemberWithUser[];
}

export function MembersPageWrapper({
  serviceId,
  initialMembers,
}: MembersPageWrapperProps) {
  const [membersList, setMembersList] =
    useState<MemberWithUser[]>(initialMembers);
  const [, startTransition] = useTransition();

  const handleInvite = useCallback(
    async (email: string, role: Role): Promise<MemberWithUser | null> => {
      const { inviteMember } = await import(
        "@/features/members/invite-member/action"
      );
      const result = await inviteMember({ serviceId, email, role });
      if (result.success) {
        setMembersList((prev) => [...prev, result.data]);
        return result.data;
      }
      return null;
    },
    [serviceId],
  );

  const handleChangeRole = useCallback(
    (memberId: string, role: Role) => {
      startTransition(async () => {
        const { updateMemberRole } = await import(
          "@/features/members/manage-members/action"
        );
        const result = await updateMemberRole(serviceId, { memberId, role });
        if (result.success) {
          setMembersList((prev) =>
            prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
          );
        }
      });
    },
    [serviceId],
  );

  const handleRemove = useCallback(
    (memberId: string) => {
      startTransition(async () => {
        const { removeMember } = await import(
          "@/features/members/manage-members/action"
        );
        const result = await removeMember(serviceId, memberId);
        if (result.success) {
          setMembersList((prev) => prev.filter((m) => m.id !== memberId));
        }
      });
    },
    [serviceId],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">メンバー</h2>
          <p className="text-sm text-muted-foreground">
            サービスのメンバーとロールを管理します
          </p>
        </div>
        <InviteMemberDialog
          onInvite={handleInvite}
          trigger={
            <Button>
              <Plus className="size-4" />
              招待
            </Button>
          }
        />
      </div>
      <MemberList
        members={membersList}
        onChangeRole={handleChangeRole}
        onRemove={handleRemove}
      />
    </div>
  );
}
