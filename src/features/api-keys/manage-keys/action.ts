"use server";

import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { eq, and } from "drizzle-orm";

export async function deleteApiKey(
  id: string,
  serviceId: string,
): Promise<ActionResult> {
  try {
    const [row] = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.serviceId, serviceId)))
      .returning();

    if (!row) {
      return { success: false, error: "APIキーが見つかりません" };
    }

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "APIキーの削除に失敗しました" };
  }
}
