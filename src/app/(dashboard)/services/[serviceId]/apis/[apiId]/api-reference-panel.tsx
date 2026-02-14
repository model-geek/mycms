"use client";

import { useMemo } from "react";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";

interface ApiReferencePanelProps {
  serviceId: string;
  endpoint: string;
  type: string;
  fields: { fieldId: string; name: string; kind: string }[];
  onClose: () => void;
}

function fieldKindToExample(kind: string): unknown {
  switch (kind) {
    case "text":
    case "textArea":
    case "select":
      return "string";
    case "richEditorV2":
      return "<p>HTML content</p>";
    case "file":
      return { url: "https://...", fileSize: 1024 };
    case "iframe":
      return "https://example.com";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "date":
      return "2026-01-01T00:00:00.000Z";
    case "media":
      return { url: "https://...", width: 800, height: 600 };
    case "mediaList":
      return [{ url: "https://...", width: 800, height: 600 }];
    case "relation":
      return { id: "content_id", ...({} as Record<string, unknown>) };
    case "relationList":
      return [{ id: "content_id" }];
    case "repeater":
      return [{}];
    default:
      return null;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("コピーしました");
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => copyToClipboard(code)}
      >
        <Copy className="size-3" />
      </Button>
    </div>
  );
}

export function ApiReferencePanel({
  serviceId,
  endpoint,
  type,
  fields,
  onClose,
}: ApiReferencePanelProps) {
  const baseUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/v1/${serviceId}`
    : `/api/v1/${serviceId}`;

  const listUrl = `${baseUrl}/${endpoint}`;
  const detailUrl = `${baseUrl}/${endpoint}/{contentId}`;

  const exampleResponse = useMemo(() => {
    const item: Record<string, unknown> = {
      id: "abc123",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      publishedAt: "2026-01-01T00:00:00.000Z",
      revisedAt: "2026-01-01T00:00:00.000Z",
    };
    for (const f of fields) {
      item[f.fieldId] = fieldKindToExample(f.kind);
    }

    if (type === "list") {
      return {
        contents: [item],
        totalCount: 1,
        offset: 0,
        limit: 10,
      };
    }
    return item;
  }, [fields, type]);

  return (
    <div className="w-80 shrink-0 lg:w-96">
      <div className="sticky top-0 space-y-4 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">APIリファレンス</h3>
          <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <Separator />

        {/* Endpoints */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">エンドポイント</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="shrink-0 font-mono text-xs">GET</Badge>
              <span className="text-xs text-muted-foreground">一覧取得</span>
            </div>
            <CodeBlock code={listUrl} />
          </div>
          {type === "list" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="shrink-0 font-mono text-xs">GET</Badge>
                <span className="text-xs text-muted-foreground">個別取得</span>
              </div>
              <CodeBlock code={detailUrl} />
            </div>
          )}
        </div>

        <Separator />

        {/* Auth */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">認証</h4>
          <p className="text-xs text-muted-foreground">
            リクエストヘッダーにAPIキーを含めてください
          </p>
          <CodeBlock code={`X-MYCMS-API-KEY: your_api_key`} />
        </div>

        <Separator />

        {/* Query params */}
        {type === "list" && (
          <>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">クエリパラメータ</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <code className="text-muted-foreground">limit</code>
                  <span className="text-muted-foreground">取得件数 (デフォルト: 10)</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-muted-foreground">offset</code>
                  <span className="text-muted-foreground">オフセット</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-muted-foreground">orders</code>
                  <span className="text-muted-foreground">ソート順</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-muted-foreground">q</code>
                  <span className="text-muted-foreground">全文検索</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-muted-foreground">fields</code>
                  <span className="text-muted-foreground">取得フィールド指定</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-muted-foreground">filters</code>
                  <span className="text-muted-foreground">フィルタ条件</span>
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Fields */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">フィールド</h4>
          <div className="space-y-1 text-xs">
            {fields.map((f) => (
              <div key={f.fieldId} className="flex items-center justify-between">
                <code>{f.fieldId}</code>
                <Badge variant="outline" className="text-[10px]">{f.kind}</Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Example response */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">レスポンス例</h4>
          <CodeBlock code={JSON.stringify(exampleResponse, null, 2)} />
        </div>

        {/* cURL example */}
        <Separator />
        <div className="space-y-3">
          <h4 className="text-sm font-medium">cURL</h4>
          <CodeBlock
            code={`curl "${listUrl}" \\\n  -H "X-MYCMS-API-KEY: your_api_key"`}
          />
        </div>
      </div>
    </div>
  );
}
