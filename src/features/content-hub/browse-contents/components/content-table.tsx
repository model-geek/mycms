"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

export interface ContentRow {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

interface ContentTableProps {
  rows: ContentRow[];
  serviceId: string;
  apiId: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDelete: (id: string) => void;
}

export function ContentTable({
  rows,
  serviceId,
  apiId,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
}: ContentTableProps) {
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  return (
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
          <TableHead>タイトル</TableHead>
          <TableHead className="w-[100px]">ステータス</TableHead>
          <TableHead className="w-[160px]">更新日</TableHead>
          <TableHead className="w-[60px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              <p className="text-muted-foreground">
                コンテンツがありません
              </p>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(row.id)}
                  onCheckedChange={() => onToggleSelect(row.id)}
                  aria-label={`${row.title}を選択`}
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/services/${serviceId}/apis/${apiId}/contents/${row.id}`}
                  className="font-medium hover:underline"
                >
                  {row.title || "（タイトルなし）"}
                </Link>
              </TableCell>
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
          ))
        )}
      </TableBody>
    </Table>
  );
}
