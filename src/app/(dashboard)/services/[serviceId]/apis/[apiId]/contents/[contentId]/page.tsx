import type { SchemaFieldDef } from "@/features/content-hub/manage-content/components/field-renderers";

import { EditContentWrapper } from "./editor-wrapper";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string; contentId: string }>;
}) {
  const { serviceId, apiId, contentId } = await params;

  // TODO: Fetch content and schema fields from backend
  const schemaFields: SchemaFieldDef[] = [];
  const initialData: Record<string, unknown> = {};
  const status = "draft";

  return (
    <EditContentWrapper
      serviceId={serviceId}
      apiId={apiId}
      contentId={contentId}
      schemaFields={schemaFields}
      initialData={initialData}
      status={status}
    />
  );
}
