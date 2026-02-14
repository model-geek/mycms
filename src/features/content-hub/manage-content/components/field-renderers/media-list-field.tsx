"use client";

import { useState } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { ImageIcon, Plus, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import type { SchemaFieldDef } from "./types";

interface MediaListFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
}

export function MediaListField({ field, control }: MediaListFieldProps) {
  const [, setPickerOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => {
        const items: MediaItem[] = formField.value ?? [];

        const handleRemove = (id: string) => {
          formField.onChange(items.filter((item) => item.id !== id));
        };

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
                {items.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {items.map((item) => (
                      <div key={item.id} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.fileName}
                          className="h-24 w-full rounded-lg border object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6"
                          onClick={() => handleRemove(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className={items.length === 0 ? "h-32 w-full" : "w-full"}
                  onClick={() => setPickerOpen(true)}
                >
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        メディアを選択
                      </span>
                    </div>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      メディアを追加
                    </>
                  )}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
