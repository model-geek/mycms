import { notFound } from "next/navigation";
import { getApiSchema } from "@/features/content-hub/manage-schema/query";
import { listContents } from "@/features/content-hub/browse-contents/query";
import type { ContentRow } from "@/features/content-hub/browse-contents/components/content-table";

import { ContentListWrapper } from "./content-list-wrapper";

export default async function ApiContentListPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string }>;
}) {
  const { serviceId, apiId } = await params;

  const schema = await getApiSchema(apiId);

  if (!schema) {
    notFound();
  }

  const result = await listContents({
    apiSchemaId: apiId,
    serviceId,
  });

  const contents: ContentRow[] = result.contents.map((c) => ({
    id: c.id,
    title: (c.data as Record<string, unknown>)?.title as string ?? (c.draftData as Record<string, unknown>)?.title as string ?? c.id,
    status: c.status,
    updatedAt: c.updatedAt.toISOString(),
  }));

  const apiInfo = {
    endpoint: schema.endpoint,
    type: schema.type,
    fields: schema.fields.map((f) => ({
      fieldId: f.fieldId,
      name: f.name,
      kind: f.kind,
    })),
  };

  return (
    <div className="p-6">
      <ContentListWrapper
        serviceId={serviceId}
        apiId={apiId}
        schemaName={schema.name}
        contents={contents}
        apiInfo={apiInfo}
      />
    </div>
  );
}
