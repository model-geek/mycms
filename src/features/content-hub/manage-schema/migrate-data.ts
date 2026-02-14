"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { apiSchemas, customFields, schemaFields } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { requirePermission } from "@/shared/lib/auth-guard";
import { eq, and, sql } from "drizzle-orm";

interface SubFieldDef {
  fieldId: string;
  name: string;
  kind: string;
  required: boolean;
  description?: string | null;
  validationRules?: unknown;
}

export async function migrateSelectFields(
  serviceId: string,
): Promise<ActionResult> {
  try {
    await requirePermission(serviceId, "schema.update");

    const selectFields = await db
      .select({
        sfId: schemaFields.id,
        fieldId: schemaFields.fieldId,
        apiSchemaId: schemaFields.apiSchemaId,
      })
      .from(schemaFields)
      .innerJoin(apiSchemas, eq(schemaFields.apiSchemaId, apiSchemas.id))
      .where(
        and(eq(apiSchemas.serviceId, serviceId), eq(schemaFields.kind, "select")),
      );

    for (const sf of selectFields) {
      await db.execute(sql`
        UPDATE content_hub.contents
        SET data = jsonb_set(
          data,
          ${sql.raw(`'{${sf.fieldId}}'`)},
          to_jsonb(ARRAY[data->>${sf.fieldId}])
        )
        WHERE api_schema_id = ${sf.apiSchemaId}
          AND data ? ${sf.fieldId}
          AND jsonb_typeof(data->${sf.fieldId}) = 'string'
      `);

      await db.execute(sql`
        UPDATE content_hub.contents
        SET draft_data = jsonb_set(
          draft_data,
          ${sql.raw(`'{${sf.fieldId}}'`)},
          to_jsonb(ARRAY[draft_data->>${sf.fieldId}])
        )
        WHERE api_schema_id = ${sf.apiSchemaId}
          AND draft_data ? ${sf.fieldId}
          AND jsonb_typeof(draft_data->${sf.fieldId}) = 'string'
      `);
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "セレクトフィールドの移行に失敗しました",
    };
  }
}

export async function migrateRepeaterToCustomFields(
  serviceId: string,
): Promise<ActionResult> {
  try {
    await requirePermission(serviceId, "schema.update");

    const repeaterFields = await db
      .select({
        sfId: schemaFields.id,
        fieldId: schemaFields.fieldId,
        apiSchemaId: schemaFields.apiSchemaId,
        validationRules: schemaFields.validationRules,
      })
      .from(schemaFields)
      .innerJoin(apiSchemas, eq(schemaFields.apiSchemaId, apiSchemas.id))
      .where(
        and(
          eq(apiSchemas.serviceId, serviceId),
          eq(schemaFields.kind, "repeater"),
        ),
      );

    for (const sf of repeaterFields) {
      const rules = sf.validationRules as {
        subFields?: SubFieldDef[];
        customFieldIds?: string[];
      } | null;

      if (!rules?.subFields || rules.subFields.length === 0) continue;
      if (rules.customFieldIds) continue;

      const cfFieldId = `${sf.fieldId}_fields`;
      const cfName = `${sf.fieldId} フィールド`;

      const subFieldsForCf = rules.subFields.map((sub) => ({
        idValue: crypto.randomUUID(),
        fieldId: sub.fieldId,
        name: sub.name,
        kind: sub.kind,
        required: sub.required ?? false,
        description: sub.description ?? null,
        validationRules: sub.validationRules ?? null,
      }));

      const [newCf] = await db
        .insert(customFields)
        .values({
          apiSchemaId: sf.apiSchemaId,
          fieldId: cfFieldId,
          name: cfName,
          fields: subFieldsForCf,
        })
        .returning({ id: customFields.id });

      if (newCf) {
        await db
          .update(schemaFields)
          .set({
            validationRules: { customFieldIds: [newCf.id] },
            updatedAt: new Date(),
          })
          .where(eq(schemaFields.id, sf.sfId));
      }
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "リピーターフィールドの移行に失敗しました",
    };
  }
}
