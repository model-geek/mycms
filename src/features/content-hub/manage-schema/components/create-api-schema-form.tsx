"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const createApiSchemaSchema = z.object({
  name: z.string().min(1, "API名は必須です"),
  endpoint: z
    .string()
    .min(1, "エンドポイントは必須です")
    .regex(
      /^[a-z][a-z0-9-]*$/,
      "小文字英数字とハイフンのみ使用可能です"
    ),
  type: z.enum(["list", "object"]),
});

type CreateApiSchemaValues = z.infer<typeof createApiSchemaSchema>;

interface CreateApiSchemaFormProps {
  onSubmit: (values: CreateApiSchemaValues) => void;
  isPending?: boolean;
}

export function CreateApiSchemaForm({
  onSubmit,
  isPending,
}: CreateApiSchemaFormProps) {
  const form = useForm<CreateApiSchemaValues>({
    resolver: zodResolver(createApiSchemaSchema),
    defaultValues: {
      name: "",
      endpoint: "",
      type: "list",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API名</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ブログ記事" />
              </FormControl>
              <FormDescription>
                APIの表示名を入力してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>エンドポイント</FormLabel>
              <FormControl>
                <Input {...field} placeholder="blog-posts" />
              </FormControl>
              <FormDescription>
                APIのURLパスに使われます（例: /api/v1/blog-posts）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイプ</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="タイプを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="list">
                    リスト（複数コンテンツ）
                  </SelectItem>
                  <SelectItem value="object">
                    オブジェクト（単一コンテンツ）
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                リストは複数のコンテンツを管理し、オブジェクトは単一のコンテンツを管理します
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "作成中..." : "APIを作成"}
        </Button>
      </form>
    </Form>
  );
}
