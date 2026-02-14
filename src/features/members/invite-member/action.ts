"use server";

import { db } from "@/db";
import { members } from "@/db/schema";
import { requirePermission } from "@/shared/lib/auth-guard";
import type { ActionResult } from "@/shared/types";

import type { MemberWithUser } from "../model";
import { findUserByEmail } from "../manage-members/query";
import { inviteMemberSchema } from "../manage-members/validations";

export async function inviteMember(
  input: unknown,
): Promise<ActionResult<MemberWithUser>> {
  try {
    const parsed = inviteMemberSchema.parse(input);

    await requirePermission(parsed.serviceId, "member.invite");

    const user = await findUserByEmail(parsed.email);
    if (!user) {
      return {
        success: false,
        error: "このメールアドレスのユーザーが見つかりません",
      };
    }

    const [member] = await db
      .insert(members)
      .values({
        serviceId: parsed.serviceId,
        userId: user.id,
        role: parsed.role,
      })
      .returning();

    return {
      success: true,
      data: {
        ...member,
        userName: user.name,
        userEmail: user.email,
      } as MemberWithUser,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("unique")) {
        return { success: false, error: "このユーザーは既にメンバーです" };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "メンバーの招待に失敗しました" };
  }
}
