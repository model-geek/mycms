import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import type { ApiKeyListItem } from "../model";

export async function listApiKeys(
  serviceId: string,
): Promise<ApiKeyListItem[]> {
  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      permission: apiKeys.permission,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.serviceId, serviceId))
    .orderBy(desc(apiKeys.createdAt));

  return rows as ApiKeyListItem[];
}
