import { db } from "@/db";
import { contents } from "@/db/schema";
import { eq } from "drizzle-orm";

import type { Content } from "../model";

import type { ContentForEdit } from "./model";

export async function getContent(
  id: string,
): Promise<Content | null> {
  const [content] = await db
    .select()
    .from(contents)
    .where(eq(contents.id, id));

  return (content as Content) ?? null;
}

export async function getContentForEdit(
  id: string,
): Promise<ContentForEdit | null> {
  const [content] = await db
    .select()
    .from(contents)
    .where(eq(contents.id, id));

  if (!content) return null;

  const c = content as Content;
  const editData = (c.draftData ?? c.data ?? {}) as Record<string, unknown>;

  return { ...c, editData };
}
