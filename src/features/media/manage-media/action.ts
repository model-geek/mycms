"use server";

import { db } from "@/db";
import { media } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { eq, and } from "drizzle-orm";

import { deleteFromBlob } from "../blob-client";
import type { Media } from "../model";

export async function deleteMedia(
  id: string,
  serviceId: string,
): Promise<ActionResult> {
  try {
    const [row] = await db
      .select()
      .from(media)
      .where(and(eq(media.id, id), eq(media.serviceId, serviceId)));

    if (!row) {
      return { success: false, error: "メディアが見つかりません" };
    }

    const m = row as Media;

    await deleteFromBlob(m.url);

    await db
      .delete(media)
      .where(eq(media.id, id));

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "メディアの削除に失敗しました" };
  }
}
