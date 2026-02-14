"use client";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import { FIELD_TYPES, type FieldKind } from "@/features/content-hub/field-types";

export interface FieldItem {
  id: string;
  name: string;
  fieldId: string;
  kind: string;
  required?: boolean | null;
  validationRules?: unknown;
}

interface SortableFieldListProps {
  fields: FieldItem[];
  onReorder: (fields: FieldItem[]) => void;
  onEdit: (field: FieldItem) => void;
  onDelete: (id: string) => void;
}

export function SortableFieldList({
  fields,
  onReorder,
  onEdit,
  onDelete,
}: SortableFieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      onReorder(arrayMove(fields, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {fields.map((field) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableFieldItemProps {
  field: FieldItem;
  onEdit: (field: FieldItem) => void;
  onDelete: (id: string) => void;
}

function SortableFieldItem({ field, onEdit, onDelete }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeLabel =
    FIELD_TYPES[field.kind as FieldKind]?.label ?? field.kind;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border p-3"
    >
      <button
        type="button"
        className="text-muted-foreground cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{field.name}</p>
        <p className="text-muted-foreground text-sm truncate">
          {field.fieldId}
        </p>
      </div>
      <Badge variant="secondary">{typeLabel}</Badge>
      {field.required && <Badge variant="outline">必須</Badge>}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(field)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(field.id)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
