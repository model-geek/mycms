"use client";

import type { Control, FieldValues } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Switch } from "@/shared/ui/switch";

import type { SchemaFieldDef } from "./types";

interface BooleanFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

export function BooleanField({ field, control }: BooleanFieldProps) {
  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => (
        <FormItem className="flex items-center justify-between rounded-lg border p-3">
          <FormLabel className="cursor-pointer">
            {field.name}
            {field.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </FormLabel>
          <FormControl>
            <Switch
              checked={formField.value}
              onCheckedChange={formField.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
