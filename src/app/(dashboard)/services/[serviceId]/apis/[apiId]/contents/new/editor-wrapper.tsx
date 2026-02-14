"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ContentEditor } from "@/features/content-hub/manage-content/components/content-editor";
import type { SchemaFieldDef } from "@/features/content-hub/manage-content/components/field-renderers";
import { createContent } from "@/features/content-hub/manage-content/action";
import type { CustomField } from "@/features/content-hub/model";

interface ContentEditorWrapperProps {
  serviceId: string;
  apiId: string;
  schemaFields: SchemaFieldDef[];
  isNew: boolean;
  customFields?: CustomField[];
}

export function ContentEditorWrapper({
  serviceId,
  apiId,
  schemaFields,
  isNew,
  customFields,
}: ContentEditorWrapperProps) {
  const router = useRouter();

  async function handleSaveDraft(data: Record<string, unknown>) {
    const result = await createContent({
      apiSchemaId: apiId,
      serviceId,
      data,
      status: "draft",
    });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("下書きを保存しました");
    router.push(`/services/${serviceId}/apis/${apiId}`);
  }

  async function handlePublish(data: Record<string, unknown>) {
    const result = await createContent({
      apiSchemaId: apiId,
      serviceId,
      data,
      status: "published",
    });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("コンテンツを公開しました");
    router.push(`/services/${serviceId}/apis/${apiId}`);
  }

  return (
    <ContentEditor
      schemaFields={schemaFields}
      isNew={isNew}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      customFields={customFields}
    />
  );
}
