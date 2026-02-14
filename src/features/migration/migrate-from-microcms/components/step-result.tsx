"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

interface StepResultProps {
  serviceId: string;
  serviceName: string;
  onClose: () => void;
}

export function StepResult({
  serviceId,
  serviceName,
  onClose,
}: StepResultProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>移行完了</DialogTitle>
        <DialogDescription>
          microCMS からのスキーマ移行が完了しました
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-3 py-6">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-sm text-muted-foreground">
          サービス「{serviceName}」が正常に作成されました
        </p>
      </div>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onClose}>
          閉じる
        </Button>
        <Button asChild>
          <Link href={`/services/${serviceId}`}>サービスを開く</Link>
        </Button>
      </DialogFooter>
    </>
  );
}
