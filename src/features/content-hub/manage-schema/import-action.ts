"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { customFields, schemaFields } from "@/db/schema";
import type { ActionResult } from "@/shared/types";
import { requirePermission } from "@/shared/lib/auth-guard";
import { eq, sql } from "drizzle-orm";

import { schemaImportSchema, type ImportApiField } from "./schema-import-validator";

const VALIDATION_RULE_KEYS = [
  "selectItems",
  "multipleSelect",
  "selectInitialValue",
  "referencedApiEndpoint",
  "unique",
  "patternMatch",
  "textSizeLimit",
  "numberSizeLimit",
  "customFieldCreatedAt",
  "customFieldIds",
  "minCount",
  "maxCount",
] as const;

function extractValidationRules(field: ImportApiField): Record<string, unknown> | null {
  const rules: Record<string, unknown> = {};
  for (const key of VALIDATION_RULE_KEYS) {
    if (key in field && field[key] !== undefined) {
      rules[key] = field[key];
    }
  }
  return Object.keys(rules).length > 0 ? rules : null;
}

export async function importSchema(
  apiSchemaId: string,
  serviceId: string,
  jsonData: unknown,
): Promise<ActionResult<{ fieldCount: number; customFieldCount: number }>> {
  try {
    await requirePermission(serviceId, "schema.create");

    const parsed = schemaImportSchema.parse(jsonData);

    const result = await db.transaction(async (tx) => {
      // Create custom fields first so we can map createdAt references
      const customFieldCreatedAtMap = new Map<string, string>();

      for (const cf of parsed.customFields) {
        const subFields = cf.fields.map((sub) => {
          const subRules: Record<string, unknown> = {};
          for (const key of VALIDATION_RULE_KEYS) {
            const value = (sub as Record<string, unknown>)[key];
            if (value !== undefined) {
              subRules[key] = value;
            }
          }
          return {
            idValue: sub.idValue,
            fieldId: sub.fieldId,
            name: sub.name,
            kind: sub.kind,
            required: sub.required,
            description: sub.description ?? null,
            validationRules: Object.keys(subRules).length > 0 ? subRules : undefined,
          };
        });

        const [created] = await tx
          .insert(customFields)
          .values({
            apiSchemaId,
            fieldId: cf.fieldId,
            name: cf.name,
            fields: subFields,
            position: cf.position ?? null,
          })
          .returning();

        // Map original createdAt to newly created custom field's createdAt
        customFieldCreatedAtMap.set(
          cf.createdAt,
          created.createdAt.toISOString(),
        );
      }

      // Get current max position
      const [maxPos] = await tx
        .select({
          max: sql<number>`coalesce(max(${schemaFields.position}), -1)`,
        })
        .from(schemaFields)
        .where(eq(schemaFields.apiSchemaId, apiSchemaId));

      let position = (maxPos?.max ?? -1) + 1;

      // Create schema fields
      for (const field of parsed.apiFields) {
        const rules = extractValidationRules(field);

        // Map customFieldCreatedAt to the new custom field's createdAt
        if (rules?.customFieldCreatedAt && typeof rules.customFieldCreatedAt === "string") {
          const mapped = customFieldCreatedAtMap.get(rules.customFieldCreatedAt);
          if (mapped) {
            rules.customFieldCreatedAt = mapped;
          }
        }

        // Map customFieldIds (for repeater fields) similarly
        if (rules?.customFieldIds && Array.isArray(rules.customFieldIds)) {
          rules.customFieldIds = (rules.customFieldIds as string[]).map((createdAt) => {
            const mapped = customFieldCreatedAtMap.get(createdAt);
            return mapped ?? createdAt;
          });
        }

        await tx.insert(schemaFields).values({
          apiSchemaId,
          name: field.name,
          fieldId: field.fieldId,
          kind: field.kind,
          description: field.description ?? null,
          required: field.required ?? false,
          position,
          validationRules: rules,
        });

        position++;
      }

      return {
        fieldCount: parsed.apiFields.length,
        customFieldCount: parsed.customFields.length,
      };
    });

    revalidatePath("/", "layout");

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "スキーマのインポートに失敗しました" };
  }
}
