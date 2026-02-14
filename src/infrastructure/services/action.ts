"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createServiceSchema, updateServiceSchema } from "./validations";
import type { ActionResult } from "@/shared/types";
import type { Service } from "./model";

// Note: Once BetterAuth is fully configured, replace getSessionUserId()
// with actual auth check from @/infrastructure/auth/auth-server

async function getSessionUserId(): Promise<string> {
  // TODO: Replace with BetterAuth session check
  // const session = await auth.api.getSession({ headers: await headers() });
  // if (!session) throw new UnauthorizedError();
  // return session.user.id;
  throw new Error("Auth not configured yet");
}

export async function createService(
  input: unknown,
): Promise<ActionResult<Service>> {
  try {
    const parsed = createServiceSchema.parse(input);
    const userId = await getSessionUserId();

    const [service] = await db
      .insert(services)
      .values({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description ?? null,
        ownerId: userId,
      })
      .returning();

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
    const userId = await getSessionUserId();

    const [service] = await db
      .update(services)
      .set({ ...parsed, updatedAt: new Date() })
      .where(and(eq(services.id, id), eq(services.ownerId, userId)))
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
    const userId = await getSessionUserId();

    const [service] = await db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.ownerId, userId)))
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
