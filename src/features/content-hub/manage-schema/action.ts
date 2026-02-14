"use server";

import { db } from "@/db";
import { apiSchemas, schemaFields } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { requirePermission } from "@/shared/lib/auth-guard";
import { eq, sql } from "drizzle-orm";

import type { ApiSchema, SchemaField } from "../model";

import {
  createApiSchemaSchema,
  updateApiSchemaSchema,
  createSchemaFieldSchema,
  updateSchemaFieldSchema,
  reorderSchemaFieldsSchema,
} from "./validations";

export async function createApiSchema(
  input: unknown,
): Promise<ActionResult<ApiSchema>> {
  try {
    const parsed = createApiSchemaSchema.parse(input);

    await requirePermission(parsed.serviceId, "schema.create");

    const [schema] = await db
      .insert(apiSchemas)
      .values({
        serviceId: parsed.serviceId,
        name: parsed.name,
        endpoint: parsed.endpoint,
        type: parsed.type,
      })
      .returning();

    return { success: true, data: schema as ApiSchema };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "APIスキーマの作成に失敗しました" };
  }
}

export async function updateApiSchema(
  id: string,
  input: unknown,
): Promise<ActionResult<ApiSchema>> {
  try {
    const parsed = updateApiSchemaSchema.parse(input);

    // スキーマから serviceId を取得して権限チェック
    const [existing] = await db
      .select({ serviceId: apiSchemas.serviceId })
      .from(apiSchemas)
      .where(eq(apiSchemas.id, id));

    if (!existing) {
      return { success: false, error: "APIスキーマが見つかりません" };
    }

    await requirePermission(existing.serviceId, "schema.update");

    const [schema] = await db
      .update(apiSchemas)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(apiSchemas.id, id))
      .returning();

    if (!schema) {
      return { success: false, error: "APIスキーマが見つかりません" };
    }

    return { success: true, data: schema as ApiSchema };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "APIスキーマの更新に失敗しました" };
  }
}

export async function deleteApiSchema(
  id: string,
): Promise<ActionResult> {
  try {
    // スキーマから serviceId を取得して権限チェック
    const [existing] = await db
      .select({ serviceId: apiSchemas.serviceId })
      .from(apiSchemas)
      .where(eq(apiSchemas.id, id));

    if (!existing) {
      return { success: false, error: "APIスキーマが見つかりません" };
    }

    await requirePermission(existing.serviceId, "schema.delete");

    const [schema] = await db
      .delete(apiSchemas)
      .where(eq(apiSchemas.id, id))
      .returning();

    if (!schema) {
      return { success: false, error: "APIスキーマが見つかりません" };
    }

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "APIスキーマの削除に失敗しました" };
  }
}

export async function createSchemaField(
  input: unknown,
): Promise<ActionResult<SchemaField>> {
  try {
    const parsed = createSchemaFieldSchema.parse(input);

    const [maxPos] = await db
      .select({ max: sql<number>`coalesce(max(${schemaFields.position}), -1)` })
      .from(schemaFields)
      .where(eq(schemaFields.apiSchemaId, parsed.apiSchemaId));

    const position = (maxPos?.max ?? -1) + 1;

    const [field] = await db
      .insert(schemaFields)
      .values({
        apiSchemaId: parsed.apiSchemaId,
        name: parsed.name,
        fieldId: parsed.fieldId,
        kind: parsed.kind,
        description: parsed.description ?? null,
        required: parsed.required ?? false,
        position,
        validationRules: parsed.validationRules ?? null,
      })
      .returning();

    return { success: true, data: field as SchemaField };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "フィールドの作成に失敗しました" };
  }
}

export async function updateSchemaField(
  id: string,
  input: unknown,
): Promise<ActionResult<SchemaField>> {
  try {
    const parsed = updateSchemaFieldSchema.parse(input);

    const [field] = await db
      .update(schemaFields)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(schemaFields.id, id))
      .returning();

    if (!field) {
      return { success: false, error: "フィールドが見つかりません" };
    }

    return { success: true, data: field as SchemaField };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "フィールドの更新に失敗しました" };
  }
}

export async function deleteSchemaField(
  id: string,
): Promise<ActionResult> {
  try {
    const [field] = await db
      .delete(schemaFields)
      .where(eq(schemaFields.id, id))
      .returning();

    if (!field) {
      return { success: false, error: "フィールドが見つかりません" };
    }

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "フィールドの削除に失敗しました" };
  }
}

export async function reorderSchemaFields(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = reorderSchemaFieldsSchema.parse(input);

    await db.transaction(async (tx) => {
      for (const item of parsed.fields) {
        await tx
          .update(schemaFields)
          .set({ position: item.position, updatedAt: new Date() })
          .where(eq(schemaFields.id, item.id));
      }
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "フィールドの並び替えに失敗しました" };
  }
}
