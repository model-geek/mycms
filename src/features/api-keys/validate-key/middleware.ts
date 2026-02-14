import { createHash } from "crypto";

import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function validateApiKey(
  rawKey: string,
  serviceId: string,
): Promise<{ valid: boolean; permission?: string }> {
  const hash = createHash("sha256").update(rawKey).digest("hex");

  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hash), eq(apiKeys.serviceId, serviceId)))
    .limit(1);

  if (!apiKey) {
    return { valid: false };
  }

  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id));

  return { valid: true, permission: apiKey.permission };
}
