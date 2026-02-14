import { z } from "zod/v4";

import { ROLES } from "../permissions";

export const inviteMemberSchema = z.object({
  serviceId: z.string().uuid("サービスIDが不正です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  role: z.enum(ROLES, {
    error: "無効なロールです",
  }),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid("メンバーIDが不正です"),
  role: z.enum(ROLES, {
    error: "無効なロールです",
  }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
