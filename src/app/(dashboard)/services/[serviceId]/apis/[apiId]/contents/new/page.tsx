import type { SchemaFieldDef } from "@/features/content-hub/manage-content/components/field-renderers";

import { ContentEditorWrapper } from "./editor-wrapper";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string }>;
}) {
  const { serviceId, apiId } = await params;

  // TODO: Fetch schema fields from backend
  const schemaFields: SchemaFieldDef[] = [];

  return (
    <ContentEditorWrapper
      serviceId={serviceId}
      apiId={apiId}
      schemaFields={schemaFields}
      isNew
    />
  );
}
