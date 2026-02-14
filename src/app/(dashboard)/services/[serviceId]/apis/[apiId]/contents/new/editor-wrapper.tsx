"use client";

import { useRouter } from "next/navigation";

import { ContentEditor } from "@/features/content-hub/manage-content/components/content-editor";
import type { SchemaFieldDef } from "@/features/content-hub/manage-content/components/field-renderers";

interface ContentEditorWrapperProps {
  serviceId: string;
  apiId: string;
  schemaFields: SchemaFieldDef[];
  isNew: boolean;
}

export function ContentEditorWrapper({
  serviceId,
  apiId,
  schemaFields,
  isNew,
}: ContentEditorWrapperProps) {
  const router = useRouter();

  async function handleSaveDraft(data: Record<string, unknown>) {
    // TODO: Call server action to save draft
    void data;
    router.push(`/services/${serviceId}/apis/${apiId}`);
  }

  async function handlePublish(data: Record<string, unknown>) {
    // TODO: Call server action to publish
    void data;
    router.push(`/services/${serviceId}/apis/${apiId}`);
  }

  return (
    <ContentEditor
      schemaFields={schemaFields}
      isNew={isNew}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
    />
  );
}
