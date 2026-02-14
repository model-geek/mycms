"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/shared/ui/progress";

export interface MigrationProgress {
  phase: "schemas" | "content";
  currentEndpoint?: string;
  contentMigrated: number;
  contentTotal: number;
  mediaCount: number;
}

interface StepMigratingProps {
  progress: MigrationProgress;
}

export function StepMigrating({ progress }: StepMigratingProps) {
  const percent =
    progress.contentTotal > 0
      ? Math.round((progress.contentMigrated / progress.contentTotal) * 100)
      : 0;

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />

      {progress.phase === "schemas" ? (
        <>
          <p className="text-sm font-medium">
            スキーマを作成中...
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">
            コンテンツ移行中...
          </p>
          <div className="w-full max-w-xs space-y-2">
            <Progress value={percent} />
            <p className="text-center text-sm text-muted-foreground">
              {progress.contentMigrated} / {progress.contentTotal} 件
              {progress.mediaCount > 0 && (
                <span className="ml-2">
                  ({progress.mediaCount} メディア)
                </span>
              )}
            </p>
          </div>
          {progress.currentEndpoint && (
            <p className="text-xs text-muted-foreground">
              {progress.currentEndpoint}
            </p>
          )}
        </>
      )}
    </div>
  );
}
