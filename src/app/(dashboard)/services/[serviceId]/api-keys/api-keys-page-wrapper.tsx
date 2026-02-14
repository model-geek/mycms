"use client";

import { Plus } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

import { CreateKeyDialog } from "@/features/api-keys/create-key/components/create-key-dialog";
import { ApiKeyList } from "@/features/api-keys/manage-keys/components/api-key-list";
import type { ApiKeyListItem, CreateApiKeyResult } from "@/features/api-keys/model";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface ApiKeysPageWrapperProps {
  serviceId: string;
  initialKeys: ApiKeyListItem[];
}

export function ApiKeysPageWrapper({
  serviceId,
  initialKeys,
}: ApiKeysPageWrapperProps) {
  const [keys, setKeys] = useState<ApiKeyListItem[]>(initialKeys);
  const [, startTransition] = useTransition();

  const handleCreateKey = useCallback(
    async (name: string, permission: string): Promise<CreateApiKeyResult | null> => {
      const { createApiKey } = await import("@/features/api-keys/create-key/action");
      const result = await createApiKey(serviceId, name, permission);
      if (result.success) {
        setKeys((prev) => [
          {
            id: result.data.id,
            name: result.data.name,
            keyPrefix: result.data.keyPrefix,
            permission: result.data.permission,
            lastUsedAt: null,
            createdAt: new Date(),
          },
          ...prev,
        ]);
        return result.data;
      }
      return null;
    },
    [serviceId],
  );

  const handleDelete = useCallback(
    (id: string) => {
      startTransition(async () => {
        const { deleteApiKey } = await import("@/features/api-keys/manage-keys/action");
        const result = await deleteApiKey(id, serviceId);
        if (result.success) {
          setKeys((prev) => prev.filter((k) => k.id !== id));
        }
      });
    },
    [serviceId],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>APIキー</CardTitle>
        <CardDescription>
          コンテンツAPIにアクセスするためのキーを管理します
        </CardDescription>
        <CardAction>
          <CreateKeyDialog
            onCreateKey={handleCreateKey}
            trigger={
              <Button>
                <Plus className="size-4" />
                新規作成
              </Button>
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ApiKeyList keys={keys} onDelete={handleDelete} />
      </CardContent>
    </Card>
  );
}
