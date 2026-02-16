"use client";

import { useRef, useState } from "react";
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
import { uploadFile } from "@/features/media/upload-media/action";

import type { SchemaFieldDef } from "./types";

interface MediaFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

export function MediaField({ field, control }: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => {
        const value = formField.value as
          | { url: string; fileName: string }
          | null
          | undefined;

        async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await uploadFile(formData);
            if (result) {
              formField.onChange({ url: result.url, fileName: file.name });
            }
          } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
          }
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
              <div className="space-y-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
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
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {uploading ? "アップロード中..." : "画像を選択"}
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
