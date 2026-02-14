"use client";

import type { ComponentType } from "react";

import { BooleanField } from "./boolean-field";
import { DateField } from "./date-field";
import { NumberField } from "./number-field";
import { SelectField } from "./select-field";
import { TextField } from "./text-field";
import { TextareaField } from "./textarea-field";
import type { FieldRendererProps } from "./types";

export type { FieldRendererProps, SchemaFieldDef } from "./types";

export const FIELD_RENDERERS: Record<
  string,
  ComponentType<FieldRendererProps>
> = {
  text: TextField,
  textArea: TextareaField,
  boolean: BooleanField,
  number: NumberField,
  select: SelectField,
  date: DateField,
};

export function FieldRenderer({ field, control }: FieldRendererProps) {
  const Renderer = FIELD_RENDERERS[field.kind];
  if (!Renderer) {
    return (
      <div className="text-muted-foreground text-sm">
        未対応のフィールド型: {field.kind}
      </div>
    );
  }
  return <Renderer field={field} control={control} />;
}
