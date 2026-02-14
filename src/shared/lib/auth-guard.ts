import { headers } from "next/headers";

import { auth } from "@/infrastructure/auth/auth-server";
import { getMemberRole } from "@/features/members/manage-members/query";
import { hasPermission, type Permission } from "@/features/members/permissions";
import { UnauthorizedError, ForbiddenError } from "@/shared/lib/errors";

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new UnauthorizedError();
  return session;
}

export async function requirePermission(
  serviceId: string,
  permission: Permission,
) {
  const session = await requireAuth();
  const role = await getMemberRole(serviceId, session.user.id);
  if (!role) throw new ForbiddenError("このサービスのメンバーではありません");
  if (!hasPermission(role, permission))
    throw new ForbiddenError();
  return { session, role };
}
