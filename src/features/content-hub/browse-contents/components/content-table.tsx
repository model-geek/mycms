"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import type { DisplayColumn } from "../display-columns";

export type { DisplayColumn };

export interface ContentRow {
  id: string;
  data: Record<string, unknown>;
  status: string;
  updatedAt: string;
}

interface ContentTableProps {
  rows: ContentRow[];
  columns: DisplayColumn[];
  serviceId: string;
  apiId: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDelete: (id: string) => void;
}

const IMAGE_KINDS = new Set(["media", "mediaList"]);
const TEXT_KINDS = new Set([
  "text",
  "textArea",
  "richEditor",
  "number",
  "date",
  "boolean",
  "select",
]);

function CellValue({
  value,
  kind,
}: {
  value: unknown;
  kind: string;
}) {
  if (value == null || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  if (kind === "media") {
    const media = value as { url?: string; fileName?: string } | null;
    if (!media?.url) return <span className="text-muted-foreground">—</span>;
    return (
      <Image
        src={media.url}
        alt={media.fileName ?? ""}
        width={40}
        height={40}
        className="rounded object-cover"
        style={{ width: 40, height: 40 }}
      />
    );
  }

  if (kind === "mediaList") {
    const list = Array.isArray(value) ? value : [];
    if (list.length === 0)
      return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex gap-1">
        {(list as { url?: string; fileName?: string }[])
          .slice(0, 3)
          .map((m, i) =>
            m.url ? (
              <Image
                key={i}
                src={m.url}
                alt={m.fileName ?? ""}
                width={32}
                height={32}
                className="rounded object-cover"
                style={{ width: 32, height: 32 }}
              />
            ) : null,
          )}
        {list.length > 3 && (
          <span className="text-muted-foreground text-xs self-center">
            +{list.length - 3}
          </span>
        )}
      </div>
    );
  }

  if (kind === "boolean") {
    return <Badge variant="outline">{value ? "true" : "false"}</Badge>;
  }

  if (kind === "select") {
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {(value as string[]).map((v) => (
            <Badge key={v} variant="secondary" className="text-xs">
              {v}
            </Badge>
          ))}
        </div>
      );
    }
    return <Badge variant="secondary" className="text-xs">{String(value)}</Badge>;
  }

  const str = String(value);
  return (
    <span className="line-clamp-2 break-all" title={str}>
      {str.length > 60 ? `${str.slice(0, 60)}…` : str}
    </span>
  );
}

export function ContentTable({
  rows,
  columns,
  serviceId,
  apiId,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
}: ContentTableProps) {
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label="すべて選択"
              />
            </TableHead>
            {columns.map((col) => (
              <TableHead key={col.fieldId} className="whitespace-nowrap">
                {col.name}
              </TableHead>
            ))}
            <TableHead className="w-[100px]">ステータス</TableHead>
            <TableHead className="w-[160px]">更新日</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 4}
                className="h-24 text-center"
              >
                <p className="text-muted-foreground">
                  コンテンツがありません
                </p>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const firstTextCol = columns.find((c) => TEXT_KINDS.has(c.kind));
              const linkLabel = firstTextCol
                ? (String(row.data[firstTextCol.fieldId] ?? "") || row.id)
                : row.id;

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={() => onToggleSelect(row.id)}
                      aria-label={`${linkLabel}を選択`}
                    />
                  </TableCell>
                  {columns.map((col, i) => (
                    <TableCell key={col.fieldId} className="max-w-[200px]">
                      {i === 0 ||
                      (firstTextCol && col.fieldId === firstTextCol.fieldId) ? (
                        <Link
                          href={`/services/${serviceId}/apis/${apiId}/contents/${row.id}`}
                          className="font-medium hover:underline"
                        >
                          <CellValue
                            value={row.data[col.fieldId]}
                            kind={col.kind}
                          />
                        </Link>
                      ) : (
                        <CellValue
                          value={row.data[col.fieldId]}
                          kind={col.kind}
                        />
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge
                      variant={
                        row.status === "published" ? "default" : "secondary"
                      }
                    >
                      {row.status === "published" ? "公開" : "下書き"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(row.updatedAt), "yyyy/MM/dd HH:mm", {
                      locale: ja,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/services/${serviceId}/apis/${apiId}/contents/${row.id}`}
                          >
                            <Pencil className="size-4" />
                            編集
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="size-4" />
                          複製
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(row.id)}
                        >
                          <Trash2 className="size-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
