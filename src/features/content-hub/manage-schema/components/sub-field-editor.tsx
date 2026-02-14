"use client";

import { useCallback, useState } from "react";
import { GripVertical, Pencil, Plus, Trash2, Check, X } from "lucide-react";
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
import { Switch } from "@/shared/ui/switch";
import { FIELD_TYPES, type FieldKind } from "@/features/content-hub/field-types";

import { FieldTypePicker } from "./field-type-picker";

export interface SubFieldDef {
  id: string;
  fieldId: string;
  name: string;
  kind: string;
  required?: boolean;
  description?: string | null;
  validationRules?: unknown;
}

interface SubFieldEditorProps {
  subFields: SubFieldDef[];
  onChange: (subFields: SubFieldDef[]) => void;
}

/** repeater 子フィールドの型で選べないもの */
const EXCLUDED_KINDS = new Set(["repeater", "custom", "relation", "relationList"]);

function InlineForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: SubFieldDef | null;
  onSave: (sf: SubFieldDef) => void;
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
      id: initial?.id ?? crypto.randomUUID(),
      fieldId: fieldId.trim(),
      name: name.trim(),
      kind,
      required,
      description: initial?.description,
      validationRules: initial?.validationRules,
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
            disabled={!!initial?.id && !!initial.fieldId}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 items-end">
        <div>
          <Label className="text-xs">型</Label>
          <FieldTypePicker
            value={kind}
            onChange={setKind}
            disabled={!!initial?.id}
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
          {initial?.id ? "更新" : "追加"}
        </Button>
      </div>
    </div>
  );
}

function SortableSubField({
  sf,
  onEdit,
  onDelete,
}: {
  sf: SubFieldDef;
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
  } = useSortable({ id: sf.id });

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

export function SubFieldEditor({ subFields, onChange }: SubFieldEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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
      const oldIndex = subFields.findIndex((sf) => sf.id === active.id);
      const newIndex = subFields.findIndex((sf) => sf.id === over.id);
      onChange(arrayMove(subFields, oldIndex, newIndex));
    },
    [subFields, onChange],
  );

  function handleAdd(sf: SubFieldDef) {
    onChange([...subFields, sf]);
    setIsAdding(false);
  }

  function handleUpdate(sf: SubFieldDef) {
    onChange(subFields.map((s) => (s.id === sf.id ? sf : s)));
    setEditingId(null);
  }

  function handleDelete(id: string) {
    onChange(subFields.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-2">
      <Label>子フィールド</Label>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={subFields.map((sf) => sf.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {subFields.map((sf) =>
              editingId === sf.id ? (
                <InlineForm
                  key={sf.id}
                  initial={sf}
                  onSave={handleUpdate}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <SortableSubField
                  key={sf.id}
                  sf={sf}
                  onEdit={() => {
                    setEditingId(sf.id);
                    setIsAdding(false);
                  }}
                  onDelete={() => handleDelete(sf.id)}
                />
              ),
            )}
          </div>
        </SortableContext>
      </DndContext>

      {isAdding ? (
        <InlineForm
          onSave={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
        >
          <Plus className="size-3 mr-1" />
          子フィールドを追加
        </Button>
      )}
    </div>
  );
}
