import type { FieldItem } from "@/features/content-hub/manage-schema/components/sortable-field-list";

import { SchemaBuilderWrapper } from "./schema-builder-wrapper";

export default async function SchemaPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string }>;
}) {
  const { serviceId, apiId } = await params;

  // TODO: Fetch schema and fields from backend
  const schemaName = "API";
  const fields: FieldItem[] = [];

  return (
    <SchemaBuilderWrapper
      serviceId={serviceId}
      apiId={apiId}
      schemaName={schemaName}
      initialFields={fields}
    />
  );
}
