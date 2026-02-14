import type { ContentRow } from "@/features/content-hub/browse-contents/components/content-table";

import { ContentListWrapper } from "./content-list-wrapper";

export default async function ApiContentListPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string }>;
}) {
  const { serviceId, apiId } = await params;

  // TODO: Fetch API schema and contents from backend
  const schemaName = "API";
  const contents: ContentRow[] = [];

  return (
    <div className="p-6">
      <ContentListWrapper
        serviceId={serviceId}
        apiId={apiId}
        schemaName={schemaName}
        contents={contents}
      />
    </div>
  );
}
