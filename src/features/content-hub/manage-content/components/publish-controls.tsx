"use client";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface PublishControlsProps {
  status?: string;
  onSaveDraft: () => void;
  onPublish: () => void;
  isPending?: boolean;
}

export function PublishControls({
  status,
  onSaveDraft,
  onPublish,
  isPending,
}: PublishControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">公開設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">ステータス:</span>
          <Badge
            variant={status === "published" ? "default" : "secondary"}
          >
            {status === "published" ? "公開中" : "下書き"}
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={isPending}
          >
            下書き保存
          </Button>
          <Button onClick={onPublish} disabled={isPending}>
            {status === "published" ? "更新して公開" : "公開"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
