"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import type { ApiSchema, CustomField } from "@/features/content-hub/model";
import { SchemaBuilder } from "@/features/content-hub/manage-schema/components/schema-builder";
import type { FieldItem } from "@/features/content-hub/manage-schema/components/sortable-field-list";
import {
  createSchemaField,
  updateSchemaField,
  deleteSchemaField,
  reorderSchemaFields,
} from "@/features/content-hub/manage-schema/action";

interface SchemaBuilderWrapperProps {
  serviceId: string;
  apiId: string;
  schemaName: string;
  initialFields: FieldItem[];
  apiSchemas?: ApiSchema[];
  customFields?: CustomField[];
}

export function SchemaBuilderWrapper({
  serviceId,
  apiId,
  schemaName,
  initialFields,
  apiSchemas,
  customFields,
}: SchemaBuilderWrapperProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSave(fields: FieldItem[]) {
    startTransition(async () => {
      try {
        // Delete removed fields
        const removedIds = initialFields
          .filter((f) => !fields.some((nf) => nf.id === f.id))
          .map((f) => f.id);

        for (const id of removedIds) {
          await deleteSchemaField(id);
        }

        // Create new fields and update existing ones
        for (const field of fields) {
          const existing = initialFields.find((f) => f.id === field.id);
          if (!existing) {
            await createSchemaField({
              apiSchemaId: apiId,
              name: field.name,
              fieldId: field.fieldId,
              kind: field.kind,
              required: field.required ?? false,
              validationRules: field.validationRules as Record<string, unknown> | undefined,
            });
          } else if (
            existing.name !== field.name ||
            existing.fieldId !== field.fieldId ||
            existing.kind !== field.kind ||
            existing.required !== field.required ||
            JSON.stringify(existing.validationRules) !== JSON.stringify(field.validationRules)
          ) {
            const oldFieldId = existing.fieldId !== field.fieldId
              ? existing.fieldId
              : undefined;
            await updateSchemaField(
              field.id,
              {
                name: field.name,
                fieldId: field.fieldId,
                kind: field.kind,
                required: field.required ?? false,
                validationRules: field.validationRules as Record<string, unknown> | undefined,
              },
              oldFieldId,
            );
          }
        }

        // Reorder fields
        if (fields.length > 0) {
          await reorderSchemaFields({
            fields: fields.map((f, i) => ({ id: f.id, position: i })),
          });
        }

        toast.success("スキーマを保存しました");
        if (initialFields.length === 0) {
          router.push(
            `/services/${serviceId}/apis/${apiId}/contents/new`
          );
        } else {
          router.refresh();
        }
      } catch {
        toast.error("スキーマの保存に失敗しました");
      }
    });
  }

  return (
    <SchemaBuilder
      schemaName={schemaName}
      initialFields={initialFields}
      onSave={handleSave}
      isPending={isPending}
      serviceId={serviceId}
      apiSchemaId={apiId}
      apiSchemas={apiSchemas}
      customFields={customFields}
    />
  );
}
