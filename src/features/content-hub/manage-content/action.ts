"use server";

import { db } from "@/db";
import { contents } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { eq } from "drizzle-orm";

import type { Content } from "../model";

import { createContentSchema, updateContentSchema } from "./validations";

export async function createContent(
  input: unknown,
): Promise<ActionResult<Content>> {
  try {
    const parsed = createContentSchema.parse(input);
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

    return { success: true, data: content as Content };
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

    const isPublishing = parsed.status === "published";

    const updateValues: Record<string, unknown> = {
      updatedAt: now,
    };

    if (isPublishing) {
      updateValues.data = parsed.data;
      updateValues.draftData = null;
      updateValues.status = "published";
      updateValues.publishedAt = (existing as Content).publishedAt ?? now;
      updateValues.revisedAt = (existing as Content).publishedAt ? now : null;
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

    return { success: true, data: content as Content };
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
    const [content] = await db
      .delete(contents)
      .where(eq(contents.id, id))
      .returning();

    if (!content) {
      return { success: false, error: "コンテンツが見つかりません" };
    }

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

    const c = existing as Content;
    const publishData = c.draftData ?? c.data;

    if (!publishData) {
      return { success: false, error: "公開するデータがありません" };
    }

    const now = new Date();

    const [content] = await db
      .update(contents)
      .set({
        data: publishData,
        draftData: null,
        status: "published",
        publishedAt: c.publishedAt ?? now,
        revisedAt: c.publishedAt ? now : null,
        updatedAt: now,
      })
      .where(eq(contents.id, id))
      .returning();

    return { success: true, data: content as Content };
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

    const c = existing as Content;

    const [content] = await db
      .update(contents)
      .set({
        draftData: c.data,
        data: null,
        status: "draft",
        publishedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(contents.id, id))
      .returning();

    return { success: true, data: content as Content };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "コンテンツの非公開に失敗しました" };
  }
}
