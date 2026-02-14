"use client";

import { useTransition, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import { revertToVersion } from "../action";
import type { VersionListItem } from "../model";

interface VersionListProps {
  contentId: string;
  versions: VersionListItem[];
  onVersionSelect?: (versionId: string) => void;
  selectedVersionId?: string;
}

export function VersionList({
  contentId,
  versions,
  onVersionSelect,
  selectedVersionId,
}: VersionListProps) {
  const [isPending, startTransition] = useTransition();
  const [revertedId, setRevertedId] = useState<string | null>(null);

  function handleRevert(versionId: string) {
    startTransition(async () => {
      const result = await revertToVersion(contentId, versionId);
      if (result.success) {
        setRevertedId(versionId);
        toast.success("バージョンを復元しました。下書きに反映されています。");
      } else {
        toast.error(result.error);
      }
    });
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>バージョン履歴</CardTitle>
        <CardDescription>コンテンツの変更履歴を確認・復元できます</CardDescription>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="text-muted-foreground mb-4 size-12" />
            <p className="text-muted-foreground">
              バージョン履歴がありません
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>バージョン</TableHead>
                <TableHead>日時</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow
                  key={version.id}
                  className={
                    selectedVersionId === version.id ? "bg-muted/50" : undefined
                  }
                  onClick={() => onVersionSelect?.(version.id)}
                  style={{ cursor: onVersionSelect ? "pointer" : undefined }}
                >
                  <TableCell className="font-medium">
                    v{version.version}
                    {revertedId === version.id && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        (復元済み)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(version.createdAt)}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                        >
                          <RotateCcw className="size-3" />
                          リバート
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            バージョン v{version.version} に復元しますか？
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            現在の下書きデータがこのバージョンのデータで上書きされます。
                            この操作は取り消せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevert(version.id)}
                          >
                            復元する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
