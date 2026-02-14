"use server";

import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requirePermission } from "@/shared/lib/auth-guard";
import type { ActionResult } from "@/shared/types";

import type { Role } from "../permissions";
import { updateMemberRoleSchema } from "./validations";

export async function updateMemberRole(
  serviceId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateMemberRoleSchema.parse(input);

    await requirePermission(serviceId, "member.changeRole");

    // オーナーのロールは変更不可
    const [target] = await db
      .select({ role: members.role })
      .from(members)
      .where(eq(members.id, parsed.memberId));

    if (!target) {
      return { success: false, error: "メンバーが見つかりません" };
    }

    if ((target.role as Role) === "owner") {
      return { success: false, error: "オーナーのロールは変更できません" };
    }

    await db
      .update(members)
      .set({ role: parsed.role })
      .where(
        and(eq(members.id, parsed.memberId), eq(members.serviceId, serviceId)),
      );

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "ロールの変更に失敗しました" };
  }
}

export async function removeMember(
  serviceId: string,
  memberId: string,
): Promise<ActionResult> {
  try {
    await requirePermission(serviceId, "member.remove");

    // オーナーは削除不可
    const [target] = await db
      .select({ role: members.role })
      .from(members)
      .where(eq(members.id, memberId));

    if (!target) {
      return { success: false, error: "メンバーが見つかりません" };
    }

    if ((target.role as Role) === "owner") {
      return { success: false, error: "オーナーを削除することはできません" };
    }

    await db
      .delete(members)
      .where(
        and(eq(members.id, memberId), eq(members.serviceId, serviceId)),
      );

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "メンバーの削除に失敗しました" };
  }
}
