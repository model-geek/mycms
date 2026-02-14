import { z } from "zod/v4";

import { WEBHOOK_EVENTS } from "../model";

export const createWebhookSchema = z.object({
  serviceId: z.string().uuid("サービスIDが不正です"),
  name: z.string().min(1, "Webhook名は必須です"),
  url: z.url("有効なURLを入力してください"),
  secret: z.string().min(1, "シークレットは必須です"),
  events: z
    .array(z.enum(WEBHOOK_EVENTS))
    .min(1, "少なくとも1つのイベントを選択してください"),
  active: z.boolean().default(true),
});

export const updateWebhookSchema = z.object({
  name: z.string().min(1, "Webhook名は必須です").optional(),
  url: z.url("有効なURLを入力してください").optional(),
  secret: z.string().min(1, "シークレットは必須です").optional(),
  events: z
    .array(z.enum(WEBHOOK_EVENTS))
    .min(1, "少なくとも1つのイベントを選択してください")
    .optional(),
  active: z.boolean().optional(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
