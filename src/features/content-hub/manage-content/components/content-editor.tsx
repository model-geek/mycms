"use client";

import { createContext, useCallback, useTransition } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form } from "@/shared/ui/form";

import type { CustomField } from "@/features/content-hub/model";
import { useContentForm } from "../use-content-form";

import {
  FieldRenderer,
  type SchemaFieldDef,
} from "./field-renderers";
import { PublishControls } from "./publish-controls";

export const CustomFieldsContext = createContext<CustomField[]>([]);

interface ContentEditorProps {
  schemaFields: SchemaFieldDef[];
  initialData?: Record<string, unknown> | null;
  status?: string;
  isNew?: boolean;
  onSaveDraft: (data: Record<string, unknown>) => void | Promise<void>;
  onPublish: (data: Record<string, unknown>) => void | Promise<void>;
  customFields?: CustomField[];
}

export function ContentEditor({
  schemaFields,
  initialData,
  status,
  isNew,
  onSaveDraft,
  onPublish,
  customFields = [],
}: ContentEditorProps) {
  const { form, getFormData } = useContentForm({
    fields: schemaFields,
    existingData: initialData,
  });
  const [isPending, startTransition] = useTransition();

  const handleSaveDraft = useCallback(() => {
    startTransition(async () => {
      const data = getFormData();
      await onSaveDraft(data);
    });
  }, [getFormData, onSaveDraft]);

  const handlePublish = useCallback(() => {
    form.handleSubmit((values) => {
      startTransition(async () => {
        await onPublish(values);
      });
    })();
  }, [form, onPublish]);

  return (
    <CustomFieldsContext value={customFields}>
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>
              {isNew ? "コンテンツ作成" : "コンテンツ編集"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                {schemaFields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    control={form.control}
                  />
                ))}
                {schemaFields.length === 0 && (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    スキーマにフィールドが定義されていません
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="sticky top-20 self-start">
          <PublishControls
            status={status}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            isPending={isPending}
          />
        </div>
      </div>
    </CustomFieldsContext>
  );
}
