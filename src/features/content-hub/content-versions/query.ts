import { db } from "@/db";
import { contentVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import type { VersionDetail, VersionListItem } from "./model";

export async function getVersionHistory(
  contentId: string,
): Promise<VersionListItem[]> {
  const rows = await db
    .select({
      id: contentVersions.id,
      contentId: contentVersions.contentId,
      version: contentVersions.version,
      createdAt: contentVersions.createdAt,
    })
    .from(contentVersions)
    .where(eq(contentVersions.contentId, contentId))
    .orderBy(desc(contentVersions.version));

  return rows as VersionListItem[];
}

export async function getVersion(
  versionId: string,
): Promise<VersionDetail | null> {
  const [row] = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.id, versionId));

  if (!row) return null;

  return {
    ...row,
    data: (row.data ?? {}) as Record<string, unknown>,
  } as VersionDetail;
}
