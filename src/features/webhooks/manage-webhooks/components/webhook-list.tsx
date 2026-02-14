"use client";

import { useTransition, useState } from "react";
import { MoreHorizontal, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Switch } from "@/shared/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import {
  updateWebhook,
  deleteWebhook,
  testWebhook,
} from "../action";
import type { Webhook } from "../../model";

import { CreateWebhookDialog } from "./create-webhook-dialog";

interface WebhookListProps {
  serviceId: string;
  webhooks: Webhook[];
}

export function WebhookList({ serviceId, webhooks: initialWebhooks }: WebhookListProps) {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleToggleActive(webhook: Webhook) {
    startTransition(async () => {
      const result = await updateWebhook(webhook.id, {
        active: !webhook.active,
      });
      if (result.success) {
        setWebhooks((prev) =>
          prev.map((wh) =>
            wh.id === webhook.id ? { ...wh, active: !wh.active } : wh,
          ),
        );
        toast.success("Webhookを更新しました");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteWebhook(id);
      if (result.success) {
        setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
        toast.success("Webhookを削除しました");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleTest(id: string) {
    startTransition(async () => {
      const result = await testWebhook(id);
      if (result.success) {
        toast.success(`テスト送信成功 (HTTP ${result.data.statusCode})`);
      } else {
        toast.error(`テスト送信失敗: ${result.error}`);
      }
    });
  }

  function handleCreated(webhook: Webhook) {
    setWebhooks((prev) => [webhook, ...prev]);
    setDialogOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook</CardTitle>
        <CardDescription>コンテンツの変更をリアルタイムに通知します</CardDescription>
        <CardAction>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            新規作成
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Send className="text-muted-foreground mb-4 size-12" />
            <p className="text-muted-foreground mb-4">
              Webhookが登録されていません
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              最初のWebhookを作成
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>イベント</TableHead>
                <TableHead>有効</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {webhook.url}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={webhook.active ?? true}
                      onCheckedChange={() => handleToggleActive(webhook)}
                      disabled={isPending}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTest(webhook.id)}>
                          <Send className="size-4" />
                          テスト送信
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(webhook.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CreateWebhookDialog
        serviceId={serviceId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreated}
      />
    </Card>
  );
}
