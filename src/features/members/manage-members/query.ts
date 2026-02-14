import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

import type { Role } from "../permissions";
import type { MemberWithUser } from "../model";

/**
 * BetterAuth が作成する user テーブルの参照定義（読み取り専用）
 */
const authUser = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export async function listMembers(
  serviceId: string,
): Promise<MemberWithUser[]> {
  const rows = await db
    .select({
      id: members.id,
      serviceId: members.serviceId,
      userId: members.userId,
      role: members.role,
      createdAt: members.createdAt,
      userName: authUser.name,
      userEmail: authUser.email,
    })
    .from(members)
    .innerJoin(authUser, eq(members.userId, authUser.id))
    .where(eq(members.serviceId, serviceId));

  return rows as MemberWithUser[];
}

export async function getMemberRole(
  serviceId: string,
  userId: string,
): Promise<Role | null> {
  const [row] = await db
    .select({ role: members.role })
    .from(members)
    .where(and(eq(members.serviceId, serviceId), eq(members.userId, userId)));

  return (row?.role as Role) ?? null;
}

export async function findUserByEmail(
  email: string,
): Promise<{ id: string; name: string | null; email: string } | null> {
  const [row] = await db
    .select({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
    })
    .from(authUser)
    .where(eq(authUser.email, email));

  return row ?? null;
}
