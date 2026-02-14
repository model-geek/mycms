"use client";

import { ArrowRight, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import type { MigrationPreview, PreviewField, PreviewSchema } from "../types";

interface StepPreviewProps {
  preview: MigrationPreview;
  isPending: boolean;
  onExecute: () => void;
  onBack: () => void;
}

export function StepPreview({
  preview,
  isPending,
  onExecute,
  onBack,
}: StepPreviewProps) {
  const validSchemas = preview.schemas.filter((s) => !s.error);
  const totalFields = validSchemas.reduce(
    (sum, s) => sum + s.fields.filter((f) => f.mycmsKind !== null).length,
    0,
  );
  const skippedFields = validSchemas.reduce(
    (sum, s) => sum + s.fields.filter((f) => f.mycmsKind === null).length,
    0,
  );
  const totalContents = validSchemas.reduce(
    (sum, s) => sum + (s.contentCount ?? 0),
    0,
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>移行プレビュー</DialogTitle>
        <DialogDescription>
          取得したスキーマの内容を確認してください
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        <div className="rounded-md bg-muted p-3 text-sm">
          <p>
            サービス「{preview.serviceName}」（{preview.serviceSlug}）に{" "}
            <strong>{validSchemas.length} 個の API</strong>、
            <strong>{totalFields} 個のフィールド</strong>が作成されます
            {skippedFields > 0 && (
              <span className="text-muted-foreground">
                （{skippedFields} 個スキップ）
              </span>
            )}
          </p>
          {preview.includeContent && totalContents > 0 && (
            <p className="mt-1">
              <strong>{totalContents} 件のコンテンツ</strong>
              も移行されます（メディアは Vercel Blob にアップロード）
            </p>
          )}
        </div>

        {preview.schemas.map((schema) => (
          <SchemaCard key={schema.endpoint} schema={schema} />
        ))}
      </div>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          戻る
        </Button>
        <Button
          onClick={onExecute}
          disabled={isPending || validSchemas.length === 0}
        >
          {isPending ? "移行中..." : "移行を実行"}
        </Button>
      </DialogFooter>
    </>
  );
}

function FieldRow({ field, indent = 0 }: { field: PreviewField; indent?: number }) {
  return (
    <>
      <div
        className="flex items-center gap-2 text-sm"
        style={indent > 0 ? { paddingLeft: `${indent * 16}px` } : undefined}
      >
        {indent > 0 && (
          <span className="text-muted-foreground">└</span>
        )}
        <code className="text-xs text-muted-foreground">
          {field.fieldId}
        </code>
        <span className="text-muted-foreground">{field.name}</span>
        <Badge variant="outline" className="text-xs">
          {field.microcmsKind}
        </Badge>
        {field.mycmsKind !== null ? (
          <>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge className="text-xs">{field.mycmsKind}</Badge>
          </>
        ) : (
          <Badge variant="destructive" className="text-xs">
            スキップ
          </Badge>
        )}
        {field.required && (
          <Badge variant="secondary" className="text-xs">
            必須
          </Badge>
        )}
        {field.warning && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            {field.warning}
          </span>
        )}
      </div>
      {field.subFields && field.subFields.length > 0 && (
        field.subFields.map((sub) => (
          <FieldRow key={sub.fieldId} field={sub} indent={indent + 1} />
        ))
      )}
    </>
  );
}

function SchemaCard({ schema }: { schema: PreviewSchema }) {
  if (schema.error) {
    return (
      <div className="rounded-md border border-destructive/50 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
          <XCircle className="h-4 w-4" />
          {schema.endpoint}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{schema.error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{schema.endpoint}</span>
        <Badge variant="secondary">{schema.type}</Badge>
        {schema.contentCount != null && schema.contentCount > 0 && (
          <Badge variant="outline" className="text-xs">
            {schema.contentCount} 件
          </Badge>
        )}
      </div>
      {schema.fields.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          フィールドがありません
        </p>
      ) : (
        <div className="mt-2 space-y-1">
          {schema.fields.map((field) => (
            <FieldRow key={field.fieldId} field={field} />
          ))}
        </div>
      )}
    </div>
  );
}
