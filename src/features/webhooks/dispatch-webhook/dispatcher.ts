import { createHmac } from "crypto";

import { db } from "@/db";
import { webhooks as webhooksTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export async function dispatchWebhook(
  webhook: { url: string; secret: string; events: string[] },
  event: string,
  data: Record<string, unknown>,
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  if (!webhook.events.includes(event)) return { success: true };

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };
  const body = JSON.stringify(payload);
  const signature = signPayload(body, webhook.secret);

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MYCMS-Signature": signature,
        "X-MYCMS-Event": event,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });
    return { success: response.ok, statusCode: response.status };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function dispatchToAllWebhooks(
  serviceId: string,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  const rows = await db
    .select()
    .from(webhooksTable)
    .where(
      and(eq(webhooksTable.serviceId, serviceId), eq(webhooksTable.active, true)),
    );

  const activeWebhooks = rows.map((wh) => ({
    ...wh,
    events: (wh.events ?? []) as string[],
  }));

  await Promise.allSettled(
    activeWebhooks.map((wh) => dispatchWebhook(wh, event, data)),
  );
}
