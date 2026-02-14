"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2 } from "lucide-react";
import { toast } from "sonner";

import { ContentList } from "@/features/content-hub/browse-contents/components/content-list";
import type { ContentRow } from "@/features/content-hub/browse-contents/components/content-table";
import { deleteContent } from "@/features/content-hub/manage-content/action";
import { Button } from "@/shared/ui/button";

import { ApiReferencePanel } from "./api-reference-panel";

export interface ApiInfo {
  endpoint: string;
  type: string;
  fields: { fieldId: string; name: string; kind: string }[];
}

interface ContentListWrapperProps {
  serviceId: string;
  apiId: string;
  schemaName: string;
  contents: ContentRow[];
  apiInfo: ApiInfo;
}

export function ContentListWrapper({
  serviceId,
  apiId,
  schemaName,
  contents,
  apiInfo,
}: ContentListWrapperProps) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);

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
    <div className="flex gap-6">
      <div className="min-w-0 flex-1">
        <ContentList
          serviceId={serviceId}
          apiId={apiId}
          schemaName={schemaName}
          contents={contents}
          onDelete={handleDelete}
          headerAction={
            <Button
              variant={panelOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPanelOpen(!panelOpen)}
            >
              <Code2 className="size-4" />
              APIリファレンス
            </Button>
          }
        />
      </div>
      {panelOpen && (
        <ApiReferencePanel
          serviceId={serviceId}
          endpoint={apiInfo.endpoint}
          type={apiInfo.type}
          fields={apiInfo.fields}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
