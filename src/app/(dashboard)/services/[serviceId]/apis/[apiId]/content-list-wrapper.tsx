"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, Settings2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { ContentList } from "@/features/content-hub/browse-contents/components/content-list";
import type {
  ContentRow,
  DisplayColumn,
} from "@/features/content-hub/browse-contents/components/content-table";
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
  columns: DisplayColumn[];
  apiInfo: ApiInfo;
}

export function ContentListWrapper({
  serviceId,
  apiId,
  schemaName,
  contents,
  columns,
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
          columns={columns}
          onDelete={handleDelete}
          headerAction={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/services/${serviceId}/apis/${apiId}/schema`}
                >
                  <Settings2 className="size-4" />
                  スキーマ編集
                </Link>
              </Button>
              <Button
                variant={panelOpen ? "secondary" : "outline"}
                size="sm"
                onClick={() => setPanelOpen(!panelOpen)}
              >
                <Code2 className="size-4" />
                APIリファレンス
              </Button>
            </div>
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
