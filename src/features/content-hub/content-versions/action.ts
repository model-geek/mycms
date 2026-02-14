"use server";

import { db } from "@/db";
import { contentVersions, contents } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { eq, sql } from "drizzle-orm";

import type { Content } from "../model";

import type { VersionDetail } from "./model";

export async function recordVersion(
  contentId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const [latestVersion] = await db
    .select({
      maxVersion: sql<number>`COALESCE(MAX(${contentVersions.version}), 0)`,
    })
    .from(contentVersions)
    .where(eq(contentVersions.contentId, contentId));

  const nextVersion = (latestVersion?.maxVersion ?? 0) + 1;

  await db.insert(contentVersions).values({
    contentId,
    data,
    version: nextVersion,
  });
}

export async function revertToVersion(
  contentId: string,
  versionId: string,
): Promise<ActionResult<Content>> {
  try {
    const [version] = await db
      .select()
      .from(contentVersions)
      .where(eq(contentVersions.id, versionId));

    if (!version) {
      return { success: false, error: "バージョンが見つかりません" };
    }

    const [content] = await db
      .update(contents)
      .set({
        draftData: version.data as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(contents.id, contentId))
      .returning();

    if (!content) {
      return { success: false, error: "コンテンツが見つかりません" };
    }

    return { success: true, data: content as Content };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "バージョンの復元に失敗しました" };
  }
}

export async function fetchVersionDetail(
  versionId: string,
): Promise<ActionResult<VersionDetail>> {
  try {
    const [row] = await db
      .select()
      .from(contentVersions)
      .where(eq(contentVersions.id, versionId));

    if (!row) {
      return { success: false, error: "バージョンが見つかりません" };
    }

    return {
      success: true,
      data: {
        ...row,
        data: (row.data ?? {}) as Record<string, unknown>,
      } as VersionDetail,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "バージョンの取得に失敗しました" };
  }
}
