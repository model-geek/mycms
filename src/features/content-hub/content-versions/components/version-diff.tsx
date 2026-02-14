"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { ScrollArea } from "@/shared/ui/scroll-area";

import type { VersionDetail } from "../model";

interface VersionDiffProps {
  version: VersionDetail | null;
}

export function VersionDiff({ version }: VersionDiffProps) {
  if (!version) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>バージョン詳細</CardTitle>
          <CardDescription>
            左のリストからバージョンを選択してください
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>v{version.version} のデータ</CardTitle>
        <CardDescription>
          {new Date(version.createdAt).toLocaleString("ja-JP")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <pre className="bg-muted rounded-md p-4 text-sm">
            {JSON.stringify(version.data, null, 2)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
