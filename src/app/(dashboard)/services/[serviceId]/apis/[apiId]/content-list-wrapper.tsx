"use client";

import { ContentList } from "@/features/content-hub/browse-contents/components/content-list";
import type { ContentRow } from "@/features/content-hub/browse-contents/components/content-table";

interface ContentListWrapperProps {
  serviceId: string;
  apiId: string;
  schemaName: string;
  contents: ContentRow[];
}

export function ContentListWrapper({
  serviceId,
  apiId,
  schemaName,
  contents,
}: ContentListWrapperProps) {
  function handleDelete(id: string) {
    // TODO: Call server action to delete content
    void id;
  }

  return (
    <ContentList
      serviceId={serviceId}
      apiId={apiId}
      schemaName={schemaName}
      contents={contents}
      onDelete={handleDelete}
    />
  );
}
