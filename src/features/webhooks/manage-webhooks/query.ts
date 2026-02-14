import { db } from "@/db";
import { webhooks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import type { Webhook } from "../model";

export async function listWebhooks(serviceId: string): Promise<Webhook[]> {
  const rows = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.serviceId, serviceId))
    .orderBy(desc(webhooks.createdAt));

  return rows.map((row) => ({
    ...row,
    events: (row.events ?? []) as string[],
    active: row.active ?? true,
  })) as Webhook[];
}
