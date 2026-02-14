"use client";

import { useState } from "react";

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
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";

interface SettingsFormProps {
  service: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
  error: string | null;
  onSave: (data: { name: string; slug: string; description: string }) => void;
  onDelete: () => void;
}

export function SettingsForm({
  service,
  error,
  onSave,
  onDelete,
}: SettingsFormProps) {
  const [name, setName] = useState(service.name);
  const [slug, setSlug] = useState(service.slug);
  const [description, setDescription] = useState(service.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, slug, description });
  };

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">一般</TabsTrigger>
        <TabsTrigger value="danger">危険な操作</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>サービス設定</CardTitle>
            <CardDescription>
              サービスの基本情報を編集します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="service-name">サービス名</Label>
                <Input
                  id="service-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="service-slug">スラッグ</Label>
                <Input
                  id="service-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="service-description">説明</Label>
                <Textarea
                  id="service-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit">保存</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="danger">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>サービスの削除</CardTitle>
            <CardDescription>
              この操作は取り消せません。すべてのコンテンツが削除されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">サービスを削除</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。サービスに関連するすべてのデータが完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
