"use client";

import { useCallback, useState } from "react";
import { GripVertical, Pencil, Plus, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Switch } from "@/shared/ui/switch";
import { FIELD_TYPES, type FieldKind } from "@/features/content-hub/field-types";
import { FieldTypePicker } from "@/features/content-hub/manage-schema/components/field-type-picker";

import type { CustomField, CustomFieldSubField } from "../../model";
import { createCustomField, updateCustomField } from "../action";

interface CustomFieldEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiSchemaId: string;
  editingField: CustomField | null;
  onSaved: () => void;
}

interface SubFieldFormData {
  idValue: string;
  fieldId: string;
  name: string;
  kind: string;
  required: boolean;
  description?: string | null;
}

const EXCLUDED_KINDS = new Set(["repeater", "custom", "relation", "relationList"]);

function InlineSubFieldForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: SubFieldFormData | null;
  onSave: (sf: SubFieldFormData) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [fieldId, setFieldId] = useState(initial?.fieldId ?? "");
  const [kind, setKind] = useState(initial?.kind ?? "text");
  const [required, setRequired] = useState(initial?.required ?? false);

  const valid = name.trim() && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(fieldId);

  function handleSave() {
    if (!valid) return;
    onSave({
      idValue: initial?.idValue ?? crypto.randomUUID(),
      fieldId: fieldId.trim(),
      name: name.trim(),
      kind,
      required,
      description: initial?.description,
    });
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">表示名</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="画像"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">フィールドID</Label>
          <Input
            value={fieldId}
            onChange={(e) => setFieldId(e.target.value)}
            placeholder="image"
            className="h-8 text-sm"
            disabled={!!initial?.idValue && !!initial.fieldId}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 items-end">
        <div>
          <Label className="text-xs">型</Label>
          <FieldTypePicker
            value={kind}
            onChange={setKind}
            disabled={!!initial?.idValue}
            excludeKinds={EXCLUDED_KINDS}
          />
        </div>
        <div className="flex items-center gap-2 h-9">
          <Switch checked={required} onCheckedChange={setRequired} />
          <Label className="text-xs">必須</Label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="size-3 mr-1" />
          キャンセル
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={!valid}>
          <Check className="size-3 mr-1" />
          {initial?.idValue ? "更新" : "追加"}
        </Button>
      </div>
    </div>
  );
}

function SortableSubFieldItem({
  sf,
  onEdit,
  onDelete,
}: {
  sf: SubFieldFormData;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sf.idValue });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeLabel =
    FIELD_TYPES[sf.kind as FieldKind]?.label ?? sf.kind;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border p-2"
    >
      <button
        type="button"
        className="text-muted-foreground cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">{sf.name}</span>
        <span className="text-xs text-muted-foreground ml-2">{sf.fieldId}</span>
      </div>
      <Badge variant="secondary" className="text-xs">
        {typeLabel}
      </Badge>
      {sf.required && (
        <Badge variant="outline" className="text-xs">
          必須
        </Badge>
      )}
      <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onEdit}>
        <Pencil className="size-3" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onDelete}>
        <Trash2 className="size-3" />
      </Button>
    </div>
  );
}

export function CustomFieldEditor({
  open,
  onOpenChange,
  apiSchemaId,
  editingField,
  onSaved,
}: CustomFieldEditorProps) {
  const [fieldId, setFieldId] = useState("");
  const [name, setName] = useState("");
  const [subFields, setSubFields] = useState<SubFieldFormData[]>([]);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingField;

  // Reset form when opening
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && editingField) {
      setFieldId(editingField.fieldId);
      setName(editingField.name);
      setSubFields(
        editingField.fields.map((sf) => ({
          idValue: sf.idValue,
          fieldId: sf.fieldId,
          name: sf.name,
          kind: sf.kind,
          required: sf.required,
          description: sf.description,
        })),
      );
    } else if (nextOpen) {
      setFieldId("");
      setName("");
      setSubFields([]);
    }
    setEditingSubId(null);
    setIsAddingSub(false);
    onOpenChange(nextOpen);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = subFields.findIndex((sf) => sf.idValue === active.id);
      const newIndex = subFields.findIndex((sf) => sf.idValue === over.id);
      setSubFields(arrayMove(subFields, oldIndex, newIndex));
    },
    [subFields],
  );

  async function handleSave() {
    if (!fieldId.trim() || !name.trim() || subFields.length === 0) return;

    setSaving(true);
    try {
      const payload = {
        apiSchemaId,
        fieldId: fieldId.trim(),
        name: name.trim(),
        fields: subFields.map((sf) => ({
          idValue: sf.idValue,
          fieldId: sf.fieldId,
          name: sf.name,
          kind: sf.kind,
          required: sf.required,
          description: sf.description ?? null,
        })),
        position: null,
      };

      const result = isEditing
        ? await updateCustomField(editingField.id, payload)
        : await createCustomField(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isEditing
          ? "カスタムフィールドを更新しました"
          : "カスタムフィールドを作成しました",
      );
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const valid =
    fieldId.trim() &&
    /^[a-zA-Z][a-zA-Z0-9_]*$/.test(fieldId) &&
    name.trim() &&
    subFields.length > 0;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "カスタムフィールドを編集" : "カスタムフィールドを作成"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div>
              <Label>フィールドID</Label>
              <Input
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                placeholder="myCustomField"
                disabled={isEditing}
              />
            </div>
            <div>
              <Label>表示名</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="マイカスタムフィールド"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>サブフィールド</Label>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={subFields.map((sf) => sf.idValue)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5">
                  {subFields.map((sf) =>
                    editingSubId === sf.idValue ? (
                      <InlineSubFieldForm
                        key={sf.idValue}
                        initial={sf}
                        onSave={(updated) => {
                          setSubFields(
                            subFields.map((s) =>
                              s.idValue === updated.idValue ? updated : s,
                            ),
                          );
                          setEditingSubId(null);
                        }}
                        onCancel={() => setEditingSubId(null)}
                      />
                    ) : (
                      <SortableSubFieldItem
                        key={sf.idValue}
                        sf={sf}
                        onEdit={() => {
                          setEditingSubId(sf.idValue);
                          setIsAddingSub(false);
                        }}
                        onDelete={() =>
                          setSubFields(subFields.filter((s) => s.idValue !== sf.idValue))
                        }
                      />
                    ),
                  )}
                </div>
              </SortableContext>
            </DndContext>

            {isAddingSub ? (
              <InlineSubFieldForm
                onSave={(sf) => {
                  setSubFields([...subFields, sf]);
                  setIsAddingSub(false);
                }}
                onCancel={() => setIsAddingSub(false)}
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setIsAddingSub(true);
                  setEditingSubId(null);
                }}
              >
                <Plus className="size-3 mr-1" />
                サブフィールドを追加
              </Button>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={!valid || saving}
            >
              {saving ? "保存中..." : isEditing ? "更新" : "作成"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
