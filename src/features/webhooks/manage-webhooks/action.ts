"use server";

import { randomBytes } from "crypto";

import { db } from "@/db";
import { webhooks } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { eq } from "drizzle-orm";

import { dispatchWebhook } from "../dispatch-webhook/dispatcher";
import type { Webhook } from "../model";

import { createWebhookSchema, updateWebhookSchema } from "./validations";

export async function createWebhook(
  input: unknown,
): Promise<ActionResult<Webhook>> {
  try {
    const parsed = createWebhookSchema.parse(input);

    const [webhook] = await db
      .insert(webhooks)
      .values({
        serviceId: parsed.serviceId,
        name: parsed.name,
        url: parsed.url,
        secret: parsed.secret,
        events: parsed.events,
        active: parsed.active,
      })
      .returning();

    return {
      success: true,
      data: {
        ...webhook,
        events: (webhook.events ?? []) as string[],
        active: webhook.active ?? true,
      } as Webhook,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Webhookの作成に失敗しました" };
  }
}

export async function updateWebhook(
  id: string,
  input: unknown,
): Promise<ActionResult<Webhook>> {
  try {
    const parsed = updateWebhookSchema.parse(input);

    const [webhook] = await db
      .update(webhooks)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(webhooks.id, id))
      .returning();

    if (!webhook) {
      return { success: false, error: "Webhookが見つかりません" };
    }

    return {
      success: true,
      data: {
        ...webhook,
        events: (webhook.events ?? []) as string[],
        active: webhook.active ?? true,
      } as Webhook,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Webhookの更新に失敗しました" };
  }
}

export async function deleteWebhook(
  id: string,
): Promise<ActionResult> {
  try {
    const [webhook] = await db
      .delete(webhooks)
      .where(eq(webhooks.id, id))
      .returning();

    if (!webhook) {
      return { success: false, error: "Webhookが見つかりません" };
    }

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Webhookの削除に失敗しました" };
  }
}

export async function testWebhook(
  id: string,
): Promise<ActionResult<{ statusCode?: number }>> {
  try {
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, id));

    if (!webhook) {
      return { success: false, error: "Webhookが見つかりません" };
    }

    const result = await dispatchWebhook(
      {
        url: webhook.url,
        secret: webhook.secret,
        events: ["test"],
      },
      "test",
      { message: "テスト送信です" },
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error ?? `HTTP ${result.statusCode}`,
      };
    }

    return { success: true, data: { statusCode: result.statusCode } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "テスト送信に失敗しました" };
  }
}

export async function generateWebhookSecret(): Promise<string> {
  return randomBytes(32).toString("hex");
}
