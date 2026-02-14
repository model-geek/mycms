"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FIELD_TYPES, type FieldKind } from "@/features/content-hub/field-types";
import type { CustomField } from "../../model";
import { deleteCustomField } from "../action";

import { CustomFieldEditor } from "./custom-field-editor";

interface CustomFieldListProps {
  apiSchemaId: string;
  customFields: CustomField[];
}

export function CustomFieldList({
  apiSchemaId,
  customFields,
}: CustomFieldListProps) {
  const router = useRouter();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  function handleCreate() {
    setEditingField(null);
    setEditorOpen(true);
  }

  function handleEdit(field: CustomField) {
    setEditingField(field);
    setEditorOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteCustomField(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("カスタムフィールドを削除しました");
    router.refresh();
  }

  function handleSaved() {
    setEditorOpen(false);
    setEditingField(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">カスタムフィールド</h2>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="size-4 mr-1" />
          追加
        </Button>
      </div>

      {customFields.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            カスタムフィールドはまだありません
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {customFields.map((cf) => (
            <Card key={cf.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <CardTitle className="text-sm font-medium">
                      {cf.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {cf.fieldId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleEdit(cf)}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleDelete(cf.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {cf.fields.map((sf) => (
                    <Badge key={sf.idValue} variant="secondary" className="text-xs">
                      {sf.name}
                      <span className="ml-1 text-muted-foreground">
                        ({FIELD_TYPES[sf.kind as FieldKind]?.label ?? sf.kind})
                      </span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CustomFieldEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        apiSchemaId={apiSchemaId}
        editingField={editingField}
        onSaved={handleSaved}
      />
    </div>
  );
}
