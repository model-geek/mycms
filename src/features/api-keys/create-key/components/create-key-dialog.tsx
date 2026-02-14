"use client";

import { Copy, Check } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import type { CreateApiKeyResult } from "../../model";

interface CreateKeyDialogProps {
  onCreateKey: (name: string, permission: string) => Promise<CreateApiKeyResult | null>;
  trigger: React.ReactNode;
}

export function CreateKeyDialog({ onCreateKey, trigger }: CreateKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [permission, setPermission] = useState("read");
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCreate = useCallback(() => {
    startTransition(async () => {
      const result = await onCreateKey(name, permission);
      if (result) {
        setCreatedKey(result);
      }
    });
  }, [name, permission, onCreateKey]);

  const handleCopy = useCallback(() => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [createdKey]);

  const handleClose = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setName("");
      setPermission("read");
      setCreatedKey(null);
      setCopied(false);
    }
    setOpen(nextOpen);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        {createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>APIキーが作成されました</DialogTitle>
              <DialogDescription>
                このキーは二度と表示されません。安全な場所に保存してください。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>APIキー</Label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded border bg-muted px-3 py-2 text-sm break-all">
                    {createdKey.key}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>閉じる</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>APIキーを作成</DialogTitle>
              <DialogDescription>
                コンテンツAPIにアクセスするためのキーを作成します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="key-name">キー名</Label>
                <Input
                  id="key-name"
                  placeholder="例: 本番環境用"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="key-permission">権限</Label>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">読み取り</SelectItem>
                    <SelectItem value="write">読み書き</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || isPending}
              >
                作成
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
