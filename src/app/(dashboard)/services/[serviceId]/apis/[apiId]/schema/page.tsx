import { notFound } from "next/navigation";
import { getApiSchema, getApiSchemasByService } from "@/features/content-hub/manage-schema/query";
import { getCustomFields } from "@/features/content-hub/manage-custom-fields/query";
import type { FieldItem } from "@/features/content-hub/manage-schema/components/sortable-field-list";

import { SchemaBuilderWrapper } from "./schema-builder-wrapper";

export default async function SchemaPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string }>;
}) {
  const { serviceId, apiId } = await params;

  const [schema, apiSchemas, customFieldList] = await Promise.all([
    getApiSchema(apiId),
    getApiSchemasByService(serviceId),
    getCustomFields(apiId),
  ]);

  if (!schema) {
    notFound();
  }

  const fields: FieldItem[] = schema.fields.map((f) => ({
    id: f.id,
    name: f.name,
    fieldId: f.fieldId,
    kind: f.kind,
    required: f.required,
    validationRules: f.validationRules,
  }));

  return (
    <SchemaBuilderWrapper
      serviceId={serviceId}
      apiId={apiId}
      schemaName={schema.name}
      initialFields={fields}
      apiSchemas={apiSchemas}
      customFields={customFieldList}
    />
  );
}
