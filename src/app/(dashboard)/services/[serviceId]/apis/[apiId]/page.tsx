import { notFound } from "next/navigation";
import { getApiSchema } from "@/features/content-hub/manage-schema/query";
import { listContents } from "@/features/content-hub/browse-contents/query";
import { MAX_LIST_LIMIT } from "@/features/content-hub/constants";
import type { ContentRow } from "@/features/content-hub/browse-contents/components/content-table";
import { buildDisplayColumns } from "@/features/content-hub/browse-contents/display-columns";

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
    limit: MAX_LIST_LIMIT,
  });

  const contents: ContentRow[] = result.contents.map((c) => ({
    id: c.id,
    data: (c.data as Record<string, unknown>) ?? (c.draftData as Record<string, unknown>) ?? {},
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

  const columns = buildDisplayColumns(apiInfo.fields);

  return (
    <div className="p-6">
      <ContentListWrapper
        serviceId={serviceId}
        apiId={apiId}
        schemaName={schema.name}
        contents={contents}
        columns={columns}
        apiInfo={apiInfo}
      />
    </div>
  );
}
