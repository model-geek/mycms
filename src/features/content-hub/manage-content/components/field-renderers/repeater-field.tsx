"use client";

import { useCallback, useMemo } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import { FieldRenderer } from "./index";
import type { SchemaFieldDef } from "./types";

interface SubFieldDef {
  fieldId: string;
  name: string;
  kind?: string;
  mycmsKind?: string;
  required?: boolean;
  description?: string | null;
  validationRules?: unknown;
}

interface RepeaterFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

interface SortableItemProps {
  id: string;
  index: number;
  onRemove: (index: number) => void;
  children: React.ReactNode;
}

function SortableRepeaterItem({
  id,
  index,
  onRemove,
  children,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="py-3">
        <CardContent className="flex items-start gap-2 px-3">
          <button
            type="button"
            className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 space-y-3">{children}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function RepeaterField({ field, control }: RepeaterFieldProps) {
  const { getValues, setValue } = useFormContext();
  const { fields: items, append, remove } = useFieldArray({
    control,
    name: field.fieldId,
  });

  const subFields = useMemo(() => {
    const rules = field.validationRules as {
      subFields?: SubFieldDef[];
    } | null;
    return (rules?.subFields ?? []).map((sf) => ({
      id: sf.fieldId,
      fieldId: sf.fieldId,
      name: sf.name,
      kind: sf.kind ?? sf.mycmsKind ?? "text",
      required: sf.required ?? false,
      description: sf.description ?? null,
      position: 0,
      validationRules: sf.validationRules,
    })) satisfies SchemaFieldDef[];
  }, [field.validationRules]);

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

      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const currentValues = getValues(field.fieldId) as unknown[];
      const newValues = arrayMove(currentValues, oldIndex, newIndex);
      setValue(field.fieldId, newValues, { shouldDirty: true });
    },
    [items, field.fieldId, getValues, setValue],
  );

  const handleAdd = useCallback(() => {
    const defaults: Record<string, unknown> = {};
    for (const sf of subFields) {
      defaults[sf.fieldId] = sf.kind === "boolean" ? false : sf.kind === "number" ? null : "";
    }
    append(defaults);
  }, [append, subFields]);

  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={() => (
        <FormItem>
          <FormLabel>
            {field.name}
            {field.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </FormLabel>
          <div className="space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item, index) => (
                  <SortableRepeaterItem
                    key={item.id}
                    id={item.id}
                    index={index}
                    onRemove={remove}
                  >
                    {subFields.length > 0 ? (
                      subFields.map((sf) => (
                        <FieldRenderer
                          key={sf.fieldId}
                          field={{
                            ...sf,
                            fieldId: `${field.fieldId}.${index}.${sf.fieldId}`,
                          }}
                          control={control}
                        />
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        項目 {index + 1}
                      </div>
                    )}
                  </SortableRepeaterItem>
                ))}
              </SortableContext>
            </DndContext>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleAdd}
            >
              <Plus className="mr-2 h-4 w-4" />
              項目を追加
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
