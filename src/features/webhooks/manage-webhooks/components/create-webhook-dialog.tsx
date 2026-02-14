"use client";

import { useTransition, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

import type { Webhook, WebhookEvent } from "../../model";
import { WEBHOOK_EVENTS } from "../../model";
import { createWebhook, generateWebhookSecret } from "../action";

const EVENT_LABELS: Record<WebhookEvent, string> = {
  "content.created": "コンテンツ作成",
  "content.updated": "コンテンツ更新",
  "content.published": "コンテンツ公開",
  "content.unpublished": "コンテンツ非公開",
  "content.deleted": "コンテンツ削除",
  "media.created": "メディア作成",
  "media.deleted": "メディア削除",
};

interface CreateWebhookDialogProps {
  serviceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (webhook: Webhook) => void;
}

export function CreateWebhookDialog({
  serviceId,
  open,
  onOpenChange,
  onCreated,
}: CreateWebhookDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && (
          <CreateWebhookForm
            serviceId={serviceId}
            onCancel={() => onOpenChange(false)}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface CreateWebhookFormProps {
  serviceId: string;
  onCancel: () => void;
  onCreated: (webhook: Webhook) => void;
}

function CreateWebhookForm({
  serviceId,
  onCancel,
  onCreated,
}: CreateWebhookFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState(() => {
    // 同期的に初期値を生成（サーバー呼び出しは送信時に検証）
    const chars = "abcdef0123456789";
    return Array.from({ length: 64 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  });
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [active, setActive] = useState(true);

  function handleToggleEvent(event: WebhookEvent) {
    setEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event],
    );
  }

  function handleCopySecret() {
    navigator.clipboard.writeText(secret);
    toast.success("シークレットをコピーしました");
  }

  function handleRegenerateSecret() {
    startTransition(async () => {
      const s = await generateWebhookSecret();
      setSecret(s);
    });
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await createWebhook({
        serviceId,
        name,
        url,
        secret,
        events,
        active,
      });
      if (result.success) {
        toast.success("Webhookを作成しました");
        onCreated(result.data);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Webhook 新規作成</DialogTitle>
        <DialogDescription>
          コンテンツの変更を外部サービスに通知するWebhookを設定します
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-name">名前</Label>
          <Input
            id="webhook-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="本番デプロイ通知"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL</Label>
          <Input
            id="webhook-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/webhook"
            type="url"
          />
        </div>

        <div className="space-y-2">
          <Label>シークレット</Label>
          <div className="flex gap-2">
            <Input value={secret} readOnly className="font-mono text-xs" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopySecret}
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-xs underline"
              onClick={handleRegenerateSecret}
            >
              シークレットを再生成
            </button>
          </div>
          <p className="text-muted-foreground text-xs">
            HMAC-SHA256署名の検証に使用します。安全に保管してください。
          </p>
        </div>

        <div className="space-y-2">
          <Label>イベント</Label>
          <div className="grid grid-cols-2 gap-2">
            {WEBHOOK_EVENTS.map((event) => (
              <label
                key={event}
                className="flex items-center gap-2 rounded-md border p-2 text-sm"
              >
                <Checkbox
                  checked={events.includes(event)}
                  onCheckedChange={() => handleToggleEvent(event)}
                />
                {EVENT_LABELS[event]}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={active} onCheckedChange={setActive} />
          <Label>有効にする</Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "作成中..." : "作成"}
        </Button>
      </DialogFooter>
    </>
  );
}
