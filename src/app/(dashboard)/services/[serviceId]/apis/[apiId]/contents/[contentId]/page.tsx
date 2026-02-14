import { notFound } from "next/navigation";
import { getSchemaFields } from "@/features/content-hub/manage-schema/query";
import { getContentForEdit } from "@/features/content-hub/manage-content/query";
import type { SchemaFieldDef } from "@/features/content-hub/manage-content/components/field-renderers";

import { EditContentWrapper } from "./editor-wrapper";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string; contentId: string }>;
}) {
  const { serviceId, apiId, contentId } = await params;

  const [fields, content] = await Promise.all([
    getSchemaFields(apiId),
    getContentForEdit(contentId),
  ]);

  if (!content) {
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
    <EditContentWrapper
      serviceId={serviceId}
      apiId={apiId}
      contentId={contentId}
      schemaFields={schemaFields}
      initialData={content.editData}
      status={content.status}
    />
  );
}
