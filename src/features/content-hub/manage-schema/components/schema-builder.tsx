"use client";

import { Plus } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import type { ApiSchema, CustomField } from "@/features/content-hub/model";

import {
  FieldEditor,
  type FieldEditorData,
} from "./field-editor";
import { SchemaExportButton } from "./schema-export-button";
import { SchemaImportDialog } from "./schema-import-dialog";
import {
  SortableFieldList,
  type FieldItem,
} from "./sortable-field-list";

interface SchemaBuilderProps {
  schemaName: string;
  initialFields: FieldItem[];
  onSave: (fields: FieldItem[]) => void;
  isPending?: boolean;
  serviceId?: string;
  apiSchemaId?: string;
  apiSchemas?: ApiSchema[];
  customFields?: CustomField[];
  onImported?: () => void;
}

export function SchemaBuilder({
  schemaName,
  initialFields,
  onSave,
  isPending,
  serviceId,
  apiSchemaId,
  apiSchemas,
  customFields,
  onImported,
}: SchemaBuilderProps) {
  const [fields, setFields] = useState<FieldItem[]>(initialFields);
  const [editingField, setEditingField] = useState<FieldEditorData | null>(
    null
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorFormKey, setEditorFormKey] = useState(0);

  const handleAddField = useCallback(() => {
    setEditingField(null);
    setIsEditorOpen(true);
    setEditorFormKey((prev) => prev + 1);
  }, []);

  const handleEditField = useCallback((field: FieldItem) => {
    setEditingField({
      id: field.id,
      name: field.name,
      fieldId: field.fieldId,
      kind: field.kind,
      required: field.required ?? false,
      validationRules: field.validationRules,
    });
    setIsEditorOpen(true);
    setEditorFormKey((prev) => prev + 1);
  }, []);

  const handleDeleteField = useCallback(
    (id: string) => {
      setFields((prev) => prev.filter((f) => f.id !== id));
    },
    []
  );

  const handleSaveField = useCallback((data: FieldEditorData) => {
    setFields((prev) => {
      if (data.id) {
        return prev.map((f) =>
          f.id === data.id
            ? {
                ...f,
                name: data.name,
                fieldId: data.fieldId,
                kind: data.kind,
                required: data.required,
                validationRules: data.validationRules,
              }
            : f
        );
      }
      const newField: FieldItem = {
        id: crypto.randomUUID(),
        name: data.name,
        fieldId: data.fieldId,
        kind: data.kind,
        required: data.required,
        validationRules: data.validationRules,
      };
      return [...prev, newField];
    });
  }, []);

  const handleReorder = useCallback((reordered: FieldItem[]) => {
    setFields(reordered);
  }, []);

  const handleSaveSchema = useCallback(() => {
    onSave(fields);
  }, [fields, onSave]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>フィールド定義</CardTitle>
                <CardDescription>
                  {schemaName} のフィールドを定義します
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {apiSchemaId && serviceId && (
                  <>
                    <SchemaImportDialog
                      apiSchemaId={apiSchemaId}
                      serviceId={serviceId}
                      onImported={onImported}
                    />
                    <SchemaExportButton
                      apiSchemaId={apiSchemaId}
                      serviceId={serviceId}
                      schemaName={schemaName}
                    />
                  </>
                )}
                <Button variant="outline" onClick={handleAddField}>
                  <Plus className="size-4" />
                  フィールドを追加
                </Button>
                <Button onClick={handleSaveSchema} disabled={isPending}>
                  {isPending ? "保存中..." : "スキーマを保存"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  フィールドがまだありません
                </p>
                <Button variant="outline" onClick={handleAddField}>
                  <Plus className="size-4" />
                  最初のフィールドを追加
                </Button>
              </div>
            ) : (
              <SortableFieldList
                fields={fields}
                onReorder={handleReorder}
                onEdit={handleEditField}
                onDelete={handleDeleteField}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <FieldEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        initialData={editingField}
        onSave={handleSaveField}
        formKey={editorFormKey}
        serviceId={serviceId}
        apiSchemaId={apiSchemaId}
        apiSchemas={apiSchemas}
        customFields={customFields}
      />
    </>
  );
}
