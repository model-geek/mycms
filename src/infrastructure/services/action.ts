"use server";

import { deleteFromStorage } from "@/features/media/storage-client";

import { db } from "@/db";
import { services, members, media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requirePermission } from "@/shared/lib/auth-guard";
import { createServiceSchema, updateServiceSchema } from "./validations";
import type { ActionResult } from "@/shared/types";
import type { Service } from "./model";

export async function createService(
  input: unknown,
): Promise<ActionResult<Service>> {
  try {
    const parsed = createServiceSchema.parse(input);
    const session = await requireAuth();

    const [service] = await db
      .insert(services)
      .values({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description ?? null,
        ownerId: session.user.id,
      })
      .returning();

    // オーナーをメンバーとして自動登録
    await db.insert(members).values({
      serviceId: service.id,
      userId: session.user.id,
      role: "owner",
    });

    return { success: true, data: service as Service };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "サービスの作成に失敗しました" };
  }
}

export async function updateService(
  id: string,
  input: unknown,
): Promise<ActionResult<Service>> {
  try {
    const parsed = updateServiceSchema.parse(input);

    await requirePermission(id, "service.update");

    const [service] = await db
      .update(services)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();

    if (!service) {
      return { success: false, error: "サービスが見つかりません" };
    }

    return { success: true, data: service as Service };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "サービスの更新に失敗しました" };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    await requirePermission(id, "service.delete");

    // ストレージファイルを削除（DB cascade 前にパスを取得）
    const mediaRows = await db
      .select({ blobPath: media.blobPath })
      .from(media)
      .where(eq(media.serviceId, id));

    if (mediaRows.length > 0) {
      await deleteFromStorage(mediaRows.map((m) => m.blobPath));
    }

    const [service] = await db
      .delete(services)
      .where(eq(services.id, id))
      .returning();

    if (!service) {
      return { success: false, error: "サービスが見つかりません" };
    }

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "サービスの削除に失敗しました" };
  }
}
