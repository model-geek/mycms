"use server";

import { requirePermission } from "@/shared/lib/auth-guard";
import type { ActionResult } from "@/shared/types";

import type { CustomField, SchemaField } from "../model";

import { getSchemaFields } from "./query";
import { getCustomFields } from "../manage-custom-fields/query";

interface ExportedApiField {
  fieldId: string;
  name: string;
  kind: string;
  required: boolean;
  description?: string | null;
  [key: string]: unknown;
}

interface ExportedCustomFieldSubField {
  idValue: string;
  fieldId: string;
  name: string;
  kind: string;
  required: boolean;
  description?: string | null;
  [key: string]: unknown;
}

interface ExportedCustomField {
  createdAt: string;
  fieldId: string;
  name: string;
  fields: ExportedCustomFieldSubField[];
  position: string[][] | null;
  updatedAt: string;
}

export interface SchemaExportData {
  apiFields: ExportedApiField[];
  customFields: ExportedCustomField[];
}

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

function flattenValidationRules(field: SchemaField): ExportedApiField {
  const result: ExportedApiField = {
    fieldId: field.fieldId,
    name: field.name,
    kind: field.kind,
    required: field.required ?? false,
  };

  if (field.description) {
    result.description = field.description;
  }

  if (field.validationRules && typeof field.validationRules === "object") {
    const rules = field.validationRules as Record<string, unknown>;
    for (const key of VALIDATION_RULE_KEYS) {
      if (key in rules) {
        result[key] = rules[key];
      }
    }
  }

  return result;
}

function exportCustomField(cf: CustomField): ExportedCustomField {
  return {
    createdAt: cf.createdAt.toISOString(),
    fieldId: cf.fieldId,
    name: cf.name,
    fields: cf.fields.map((sub) => {
      const exported: ExportedCustomFieldSubField = {
        idValue: sub.idValue,
        fieldId: sub.fieldId,
        name: sub.name,
        kind: sub.kind,
        required: sub.required,
      };
      if (sub.description) {
        exported.description = sub.description;
      }
      if (sub.validationRules && typeof sub.validationRules === "object") {
        const rules = sub.validationRules as Record<string, unknown>;
        for (const key of VALIDATION_RULE_KEYS) {
          if (key in rules) {
            exported[key] = rules[key];
          }
        }
      }
      return exported;
    }),
    position: cf.position,
    updatedAt: cf.updatedAt.toISOString(),
  };
}

export async function exportSchema(
  apiSchemaId: string,
  serviceId: string,
): Promise<ActionResult<SchemaExportData>> {
  try {
    await requirePermission(serviceId, "schema.update");

    const [schemaFields, customFieldList] = await Promise.all([
      getSchemaFields(apiSchemaId),
      getCustomFields(apiSchemaId),
    ]);

    const apiFields = schemaFields.map(flattenValidationRules);
    const exportedCustomFields = customFieldList.map(exportCustomField);

    return {
      success: true,
      data: {
        apiFields,
        customFields: exportedCustomFields,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "スキーマのエクスポートに失敗しました" };
  }
}
