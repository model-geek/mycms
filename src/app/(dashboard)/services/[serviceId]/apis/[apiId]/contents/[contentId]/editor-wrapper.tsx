"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ContentEditor } from "@/features/content-hub/manage-content/components/content-editor";
import type { SchemaFieldDef } from "@/features/content-hub/manage-content/components/field-renderers";
import { updateContent } from "@/features/content-hub/manage-content/action";

interface EditContentWrapperProps {
  serviceId: string;
  apiId: string;
  contentId: string;
  schemaFields: SchemaFieldDef[];
  initialData: Record<string, unknown>;
  status: string;
}

export function EditContentWrapper({
  serviceId,
  apiId,
  contentId,
  schemaFields,
  initialData,
  status,
}: EditContentWrapperProps) {
  const router = useRouter();

  async function handleSaveDraft(data: Record<string, unknown>) {
    const result = await updateContent(contentId, {
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
    const result = await updateContent(contentId, {
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
      initialData={initialData}
      status={status}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
    />
  );
}
