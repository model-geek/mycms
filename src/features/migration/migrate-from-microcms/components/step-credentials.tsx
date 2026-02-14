"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

const credentialsFormSchema = z.object({
  serviceId: z.string().min(1, "サービスIDは必須です"),
  apiKey: z.string().min(1, "APIキーは必須です"),
  endpoints: z.string().min(1, "エンドポイント名は必須です"),
  serviceName: z
    .string()
    .min(1, "サービス名は必須です")
    .max(100, "サービス名は100文字以内です"),
  serviceSlug: z
    .string()
    .min(1, "スラッグは必須です")
    .max(50, "スラッグは50文字以内です")
    .regex(
      /^[a-z0-9-]+$/,
      "スラッグは英小文字・数字・ハイフンのみ使用できます",
    ),
  includeContent: z.boolean(),
});

type CredentialsFormValues = z.infer<typeof credentialsFormSchema>;

interface StepCredentialsProps {
  isPending: boolean;
  onSubmit: (values: CredentialsFormValues) => void;
}

export function StepCredentials({ isPending, onSubmit }: StepCredentialsProps) {
  const form = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsFormSchema),
    defaultValues: {
      serviceId: "",
      apiKey: "",
      endpoints: "",
      serviceName: "",
      serviceSlug: "",
      includeContent: false,
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>microCMS から移行</DialogTitle>
        <DialogDescription>
          microCMS の認証情報とエンドポイントを入力してください
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>microCMS サービス ID</FormLabel>
                <FormControl>
                  <Input placeholder="your-service" {...field} />
                </FormControl>
                <FormDescription>
                  microCMS の管理画面 URL の https://your-service.microcms.io の
                  your-service 部分
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>microCMS API キー</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="APIキー" {...field} />
                </FormControl>
                <FormDescription>
                  管理画面の「サービス設定 &gt; APIキー」から取得できます
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endpoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>エンドポイント名</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={"blogs\nnews\ncategories"}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  移行するAPIのエンドポイント名をカンマまたは改行区切りで入力
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>mycms サービス名</FormLabel>
                  <FormControl>
                    <Input placeholder="マイブログ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>mycms スラッグ</FormLabel>
                  <FormControl>
                    <Input placeholder="my-blog" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="includeContent"
            render={({ field }) => (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Checkbox
                  id="includeContent"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="includeContent" className="text-sm font-normal">
                  コンテンツも移行する（画像は Vercel Blob にアップロードされます）
                </Label>
              </div>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "取得中..." : "スキーマを取得"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
