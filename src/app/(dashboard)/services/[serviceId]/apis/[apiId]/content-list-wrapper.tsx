"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ContentList } from "@/features/content-hub/browse-contents/components/content-list";
import type { ContentRow } from "@/features/content-hub/browse-contents/components/content-table";
import { deleteContent } from "@/features/content-hub/manage-content/action";

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
  const router = useRouter();

  async function handleDelete(id: string) {
    const result = await deleteContent(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("コンテンツを削除しました");
    router.refresh();
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
