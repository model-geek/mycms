"use client";

import type { Control, FieldValues } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Textarea } from "@/shared/ui/textarea";

import type { SchemaFieldDef } from "./types";

interface TextareaFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

export function TextareaField({ field, control }: TextareaFieldProps) {
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
            <Textarea
              {...formField}
              placeholder={field.description ?? ""}
              rows={4}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
