"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { createService } from "./action";
import { toast } from "sonner";

const createServiceSchema = z.object({
  name: z.string().min(1, "サービス名を入力してください"),
  slug: z
    .string()
    .min(1, "スラッグを入力してください")
    .regex(
      /^[a-z0-9-]+$/,
      "スラッグは半角英数字とハイフンのみ使用できます",
    ),
  description: z.string().optional(),
});

type CreateServiceValues = z.infer<typeof createServiceSchema>;

export function CreateServiceForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CreateServiceValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateServiceValues) {
    setIsPending(true);
    try {
      const result = await createService(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("サービスを作成しました");
      onSuccess?.();
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>サービス名</FormLabel>
              <FormControl>
                <Input placeholder="マイブログ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>スラッグ</FormLabel>
              <FormControl>
                <Input placeholder="my-blog" {...field} />
              </FormControl>
              <FormDescription>
                URLに使用される識別子です
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明（任意）</FormLabel>
              <FormControl>
                <Input placeholder="サービスの説明" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "作成中..." : "作成"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
