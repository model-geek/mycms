"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { KeyRound, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import type { ApiKeyListItem } from "../../model";

interface ApiKeyListProps {
  keys: ApiKeyListItem[];
  onDelete: (id: string) => void;
}

function maskPrefix(prefix: string): string {
  return `${prefix}...`;
}

const permissionLabels: Record<string, string> = {
  read: "読み取り",
  write: "読み書き",
  admin: "管理者",
};

export function ApiKeyList({ keys, onDelete }: ApiKeyListProps) {
  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <KeyRound className="mb-4 size-12 text-muted-foreground" />
        <p className="text-muted-foreground">APIキーが作成されていません</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名前</TableHead>
          <TableHead>キー</TableHead>
          <TableHead className="w-[100px]">権限</TableHead>
          <TableHead className="w-[160px]">最終使用日</TableHead>
          <TableHead className="w-[60px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => (
          <TableRow key={key.id}>
            <TableCell className="font-medium">{key.name}</TableCell>
            <TableCell>
              <code className="rounded bg-muted px-2 py-1 text-sm">
                {maskPrefix(key.keyPrefix)}
              </code>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {permissionLabels[key.permission] ?? key.permission}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {key.lastUsedAt
                ? format(new Date(key.lastUsedAt), "yyyy/MM/dd HH:mm", {
                    locale: ja,
                  })
                : "未使用"}
            </TableCell>
            <TableCell>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-xs">
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>APIキーを削除</AlertDialogTitle>
                    <AlertDialogDescription>
                      「{key.name}」を削除しますか？この操作は取り消せません。
                      このキーを使用しているアプリケーションはアクセスできなくなります。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(key.id)}>
                      削除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
