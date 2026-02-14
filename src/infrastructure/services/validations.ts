import { z } from "zod/v4";

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, "サービス名は必須です")
    .max(100, "サービス名は100文字以内です"),
  slug: z
    .string()
    .min(1, "スラッグは必須です")
    .max(50, "スラッグは50文字以内です")
    .regex(
      /^[a-z0-9-]+$/,
      "スラッグは英小文字・数字・ハイフンのみ使用できます",
    ),
  description: z
    .string()
    .max(500, "説明は500文字以内です")
    .optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
