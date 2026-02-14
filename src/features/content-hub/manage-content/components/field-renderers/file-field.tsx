"use client";

import { useRef, useState } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { FileUp, X, File as FileIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import type { SchemaFieldDef } from "./types";

interface FileFieldProps {
  field: SchemaFieldDef;
  control: Control<FieldValues>;
}

export function FileField({ field, control }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <FormField
      control={control}
      name={field.fieldId}
      render={({ field: formField }) => {
        const value = formField.value as
          | { url: string; fileSize: number }
          | null
          | undefined;

        async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const { upload } = await import("@vercel/blob/client");
            const blob = await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/upload",
            });
            formField.onChange({ url: blob.url, fileSize: file.size });
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
                  className="hidden"
                  onChange={handleUpload}
                />
                {value?.url ? (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <FileIcon className="h-8 w-8 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {value.url.split("/").pop()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(value.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => formField.onChange(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    {uploading ? "アップロード中..." : "ファイルを選択"}
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
