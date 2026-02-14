"use client";

import { useRouter } from "next/navigation";

import { ContentEditor } from "@/features/content-hub/manage-content/components/content-editor";
import type { SchemaFieldDef } from "@/features/content-hub/manage-content/components/field-renderers";

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
    // TODO: Call server action to save draft
    void contentId;
    void data;
    router.push(`/services/${serviceId}/apis/${apiId}`);
  }

  async function handlePublish(data: Record<string, unknown>) {
    // TODO: Call server action to publish
    void contentId;
    void data;
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
