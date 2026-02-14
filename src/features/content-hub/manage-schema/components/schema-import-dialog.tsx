"use client";

import { Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";

import { FIELD_TYPES, type FieldKind } from "@/features/content-hub/field-types";

import { schemaImportSchema, type SchemaImportInput } from "../schema-import-validator";
import { importSchema } from "../import-action";

interface SchemaImportDialogProps {
  apiSchemaId: string;
  serviceId: string;
  onImported?: () => void;
}

export function SchemaImportDialog({
  apiSchemaId,
  serviceId,
  onImported,
}: SchemaImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [parsed, setParsed] = useState<SchemaImportInput | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tryParse = useCallback((text: string) => {
    setJsonText(text);
    setParseError(null);
    setParsed(null);
    setImportError(null);

    if (!text.trim()) return;

    try {
      const json = JSON.parse(text);
      const result = schemaImportSchema.safeParse(json);
      if (result.success) {
        setParsed(result.data);
      } else {
        setParseError(result.error.issues.map((e) => e.message).join(", "));
      }
    } catch {
      setParseError("無効なJSON形式です");
    }
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          tryParse(text);
        }
      };
      reader.readAsText(file);

      // Reset file input for re-uploading same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [tryParse],
  );

  const handleImport = useCallback(async () => {
    if (!parsed) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const result = await importSchema(apiSchemaId, serviceId, parsed);
      if (!result.success) {
        setImportError(result.error);
        return;
      }

      setOpen(false);
      setJsonText("");
      setParsed(null);
      onImported?.();
    } catch {
      setImportError("インポートに失敗しました");
    } finally {
      setIsImporting(false);
    }
  }, [parsed, apiSchemaId, serviceId, onImported]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        setJsonText("");
        setParsed(null);
        setParseError(null);
        setImportError(null);
      }
    },
    [],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" />
          JSONからインポート
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>スキーマインポート</DialogTitle>
          <DialogDescription>
            microCMS互換のJSON形式からスキーマフィールドをインポートします
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">ファイルアップロード</TabsTrigger>
            <TabsTrigger value="paste">テキスト貼り付け</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schema-file">JSONファイル</Label>
              <input
                ref={fileInputRef}
                id="schema-file"
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schema-json">JSON</Label>
              <Textarea
                id="schema-json"
                placeholder='{"apiFields": [...], "customFields": [...]}'
                rows={10}
                value={jsonText}
                onChange={(e) => tryParse(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>

        {parseError && (
          <p className="text-sm text-destructive">{parseError}</p>
        )}

        {importError && (
          <p className="text-sm text-destructive">{importError}</p>
        )}

        {parsed && (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">プレビュー</p>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">
                APIフィールド ({parsed.apiFields.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {parsed.apiFields.map((f) => (
                  <Badge key={f.fieldId} variant="secondary">
                    {f.name} ({FIELD_TYPES[f.kind as FieldKind]?.label ?? f.kind})
                  </Badge>
                ))}
              </div>
            </div>
            {parsed.customFields.length > 0 && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  カスタムフィールド ({parsed.customFields.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {parsed.customFields.map((cf) => (
                    <Badge key={cf.fieldId} variant="outline">
                      {cf.name} ({cf.fields.length} サブフィールド)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleImport}
            disabled={!parsed || isImporting}
          >
            {isImporting ? "インポート中..." : "インポート"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
