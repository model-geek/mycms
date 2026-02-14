"use client";

import { useState } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { ImageIcon, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import type { SchemaFieldDef } from "./types";

interface MediaFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

export function MediaField({ field, control }: MediaFieldProps) {
  const [, setPickerOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => {
        const value = formField.value as
          | { id: string; url: string; fileName: string }
          | null
          | undefined;

        return (
          <FormItem>
            <FormLabel>
              {field.name}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FormLabel>
            <FormControl>
              <div className="space-y-2">
                {value?.url ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={value.url}
                      alt={value.fileName}
                      className="h-32 w-32 rounded-lg border object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6"
                      onClick={() => formField.onChange(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 w-full"
                    onClick={() => setPickerOpen(true)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        メディアを選択
                      </span>
                    </div>
                  </Button>
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
