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

interface IframeFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

export function IframeField({ field, control }: IframeFieldProps) {
  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => {
        const value = formField.value as string | null | undefined;
        let isValidUrl = false;
        try {
          if (value) {
            new URL(value);
            isValidUrl = true;
          }
        } catch {
          /* invalid */
        }

        return (
          <FormItem>
            <FormLabel>
              {field.name}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FormLabel>
            <FormControl>
              <div className="space-y-3">
                <Input
                  placeholder="https://example.com"
                  value={value ?? ""}
                  onChange={(e) => formField.onChange(e.target.value || null)}
                />
                {isValidUrl && value && (
                  <div className="rounded-lg border overflow-hidden">
                    <iframe
                      src={value}
                      title={field.name}
                      className="w-full h-[400px]"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
