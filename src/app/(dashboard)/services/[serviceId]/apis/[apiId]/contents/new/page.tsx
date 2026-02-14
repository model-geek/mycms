import { notFound } from "next/navigation";
import { getSchemaFields } from "@/features/content-hub/manage-schema/query";
import type { SchemaFieldDef } from "@/features/content-hub/manage-content/components/field-renderers";

import { ContentEditorWrapper } from "./editor-wrapper";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string }>;
}) {
  const { serviceId, apiId } = await params;

  const fields = await getSchemaFields(apiId);

  if (fields.length === 0) {
    notFound();
  }

  const schemaFields: SchemaFieldDef[] = fields.map((f) => ({
    id: f.id,
    fieldId: f.fieldId,
    name: f.name,
    kind: f.kind,
    description: f.description,
    required: f.required,
    position: f.position,
    validationRules: f.validationRules,
  }));

  return (
    <ContentEditorWrapper
      serviceId={serviceId}
      apiId={apiId}
      schemaFields={schemaFields}
      isNew
    />
  );
}
