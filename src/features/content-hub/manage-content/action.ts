"use server";

import { db } from "@/db";
import { contents } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { requirePermission } from "@/shared/lib/auth-guard";
import { eq } from "drizzle-orm";

import { recordVersion } from "../content-versions/action";
import type { Content } from "../model";
import { dispatchToAllWebhooks } from "../../webhooks/dispatch-webhook/dispatcher";

import { createContentSchema, updateContentSchema } from "./validations";

export async function createContent(
  input: unknown,
): Promise<ActionResult<Content>> {
  try {
    const parsed = createContentSchema.parse(input);

    await requirePermission(parsed.serviceId, "content.create");

    const now = new Date();
    const isPublished = parsed.status === "published";

    const [content] = await db
      .insert(contents)
      .values({
        apiSchemaId: parsed.apiSchemaId,
        serviceId: parsed.serviceId,
        data: isPublished ? parsed.data : null,
        draftData: isPublished ? null : parsed.data,
        status: parsed.status,
        publishedAt: isPublished ? now : null,
      })
      .returning();

    const c = content as Content;

    // バージョン記録
    await recordVersion(c.id, parsed.data);

    // Webhook 送信
    void dispatchToAllWebhooks(c.serviceId, "content.created", {
      contentId: c.id,
      apiSchemaId: c.apiSchemaId,
      status: c.status,
    });

    if (isPublished) {
      void dispatchToAllWebhooks(c.serviceId, "content.published", {
        contentId: c.id,
        apiSchemaId: c.apiSchemaId,
      });
    }

    return { success: true, data: c };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "コンテンツの作成に失敗しました" };
  }
}

export async function updateContent(
  id: string,
  input: unknown,
): Promise<ActionResult<Content>> {
  try {
    const parsed = updateContentSchema.parse(input);
    const now = new Date();

    const [existing] = await db
      .select()
      .from(contents)
      .where(eq(contents.id, id));

    if (!existing) {
      return { success: false, error: "コンテンツが見つかりません" };
    }

    const e = existing as Content;

    await requirePermission(e.serviceId, "content.update");

    const isPublishing = parsed.status === "published";

    const updateValues: Record<string, unknown> = {
      updatedAt: now,
    };

    if (isPublishing) {
      updateValues.data = parsed.data;
      updateValues.draftData = null;
      updateValues.status = "published";
      updateValues.publishedAt = e.publishedAt ?? now;
      updateValues.revisedAt = e.publishedAt ? now : null;
    } else {
      updateValues.draftData = parsed.data;
      if (parsed.status) {
        updateValues.status = parsed.status;
      }
    }

    const [content] = await db
      .update(contents)
      .set(updateValues)
      .where(eq(contents.id, id))
      .returning();

    const c = content as Content;

    // バージョン記録
    await recordVersion(c.id, parsed.data);

    // Webhook 送信
    void dispatchToAllWebhooks(c.serviceId, "content.updated", {
      contentId: c.id,
      apiSchemaId: c.apiSchemaId,
      status: c.status,
    });

    if (isPublishing) {
      void dispatchToAllWebhooks(c.serviceId, "content.published", {
        contentId: c.id,
        apiSchemaId: c.apiSchemaId,
      });
    }

    return { success: true, data: c };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "コンテンツの更新に失敗しました" };
  }
}

export async function deleteContent(
  id: string,
): Promise<ActionResult> {
  try {
    // 権限チェックのため先にコンテンツを取得
    const [existing] = await db
      .select()
      .from(contents)
      .where(eq(contents.id, id));

    if (!existing) {
      return { success: false, error: "コンテンツが見つかりません" };
    }

    const e = existing as Content;

    await requirePermission(e.serviceId, "content.delete");

    await db.delete(contents).where(eq(contents.id, id));

    // Webhook 送信
    void dispatchToAllWebhooks(e.serviceId, "content.deleted", {
      contentId: e.id,
      apiSchemaId: e.apiSchemaId,
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "コンテンツの削除に失敗しました" };
  }
}

export async function publishContent(
  id: string,
): Promise<ActionResult<Content>> {
  try {
    const [existing] = await db
      .select()
      .from(contents)
      .where(eq(contents.id, id));

    if (!existing) {
      return { success: false, error: "コンテンツが見つかりません" };
    }

    const e = existing as Content;

    await requirePermission(e.serviceId, "content.publish");

    const publishData = e.draftData ?? e.data;

    if (!publishData) {
      return { success: false, error: "公開するデータがありません" };
    }

    const now = new Date();

    // バージョン記録（公開前のスナップショット）
    await recordVersion(e.id, publishData);

    const [content] = await db
      .update(contents)
      .set({
        data: publishData,
        draftData: null,
        status: "published",
        publishedAt: e.publishedAt ?? now,
        revisedAt: e.publishedAt ? now : null,
        updatedAt: now,
      })
      .where(eq(contents.id, id))
      .returning();

    const c = content as Content;

    // Webhook 送信
    void dispatchToAllWebhooks(c.serviceId, "content.published", {
      contentId: c.id,
      apiSchemaId: c.apiSchemaId,
    });

    return { success: true, data: c };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "コンテンツの公開に失敗しました" };
  }
}

export async function unpublishContent(
  id: string,
): Promise<ActionResult<Content>> {
  try {
    const [existing] = await db
      .select()
      .from(contents)
      .where(eq(contents.id, id));

    if (!existing) {
      return { success: false, error: "コンテンツが見つかりません" };
    }

    const e = existing as Content;

    const [content] = await db
      .update(contents)
      .set({
        draftData: e.data,
        data: null,
        status: "draft",
        publishedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(contents.id, id))
      .returning();

    const c = content as Content;

    // Webhook 送信
    void dispatchToAllWebhooks(c.serviceId, "content.unpublished", {
      contentId: c.id,
      apiSchemaId: c.apiSchemaId,
    });

    return { success: true, data: c };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "コンテンツの非公開に失敗しました" };
  }
}
