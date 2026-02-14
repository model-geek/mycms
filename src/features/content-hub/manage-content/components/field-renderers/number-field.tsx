"use client";

import type { Control, FieldValues } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

import type { SchemaFieldDef } from "./types";

interface NumberFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

export function NumberField({ field, control }: NumberFieldProps) {
  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.name}
            {field.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              {...formField}
              onChange={(e) => formField.onChange(e.target.valueAsNumber)}
              placeholder={field.description ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
