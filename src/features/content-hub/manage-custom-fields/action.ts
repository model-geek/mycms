"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { apiSchemas, customFields } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { requirePermission } from "@/shared/lib/auth-guard";
import { eq } from "drizzle-orm";

import type { CustomField } from "../model";

import {
  createCustomFieldSchema,
  updateCustomFieldSchema,
} from "./validations";

export async function createCustomField(
  input: unknown,
): Promise<ActionResult<CustomField>> {
  try {
    const parsed = createCustomFieldSchema.parse(input);

    const [schema] = await db
      .select({ serviceId: apiSchemas.serviceId })
      .from(apiSchemas)
      .where(eq(apiSchemas.id, parsed.apiSchemaId));

    if (!schema) {
      return { success: false, error: "APIスキーマが見つかりません" };
    }

    await requirePermission(schema.serviceId, "schema.create");

    const [result] = await db
      .insert(customFields)
      .values({
        apiSchemaId: parsed.apiSchemaId,
        fieldId: parsed.fieldId,
        name: parsed.name,
        fields: parsed.fields,
        position: parsed.position ?? null,
      })
      .returning();

    revalidatePath("/", "layout");

    return { success: true, data: result as unknown as CustomField };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "カスタムフィールドの作成に失敗しました" };
  }
}

export async function updateCustomField(
  id: string,
  input: unknown,
): Promise<ActionResult<CustomField>> {
  try {
    const parsed = updateCustomFieldSchema.parse(input);

    const [existing] = await db
      .select({ apiSchemaId: customFields.apiSchemaId })
      .from(customFields)
      .where(eq(customFields.id, id));

    if (!existing) {
      return { success: false, error: "カスタムフィールドが見つかりません" };
    }

    const [schema] = await db
      .select({ serviceId: apiSchemas.serviceId })
      .from(apiSchemas)
      .where(eq(apiSchemas.id, existing.apiSchemaId));

    if (!schema) {
      return { success: false, error: "APIスキーマが見つかりません" };
    }

    await requirePermission(schema.serviceId, "schema.update");

    const [result] = await db
      .update(customFields)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(customFields.id, id))
      .returning();

    if (!result) {
      return { success: false, error: "カスタムフィールドが見つかりません" };
    }

    revalidatePath("/", "layout");

    return { success: true, data: result as unknown as CustomField };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "カスタムフィールドの更新に失敗しました" };
  }
}

export async function deleteCustomField(
  id: string,
): Promise<ActionResult> {
  try {
    const [existing] = await db
      .select({ apiSchemaId: customFields.apiSchemaId })
      .from(customFields)
      .where(eq(customFields.id, id));

    if (!existing) {
      return { success: false, error: "カスタムフィールドが見つかりません" };
    }

    const [schema] = await db
      .select({ serviceId: apiSchemas.serviceId })
      .from(apiSchemas)
      .where(eq(apiSchemas.id, existing.apiSchemaId));

    if (!schema) {
      return { success: false, error: "APIスキーマが見つかりません" };
    }

    await requirePermission(schema.serviceId, "schema.delete");

    const [result] = await db
      .delete(customFields)
      .where(eq(customFields.id, id))
      .returning();

    if (!result) {
      return { success: false, error: "カスタムフィールドが見つかりません" };
    }

    revalidatePath("/", "layout");

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "カスタムフィールドの削除に失敗しました" };
  }
}
