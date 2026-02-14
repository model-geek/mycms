import { z } from "zod/v4";

export const migrationCredentialsSchema = z.object({
  serviceId: z.string().min(1, "サービスIDは必須です"),
  apiKey: z.string().min(1, "APIキーは必須です"),
  endpoints: z
    .string()
    .min(1, "エンドポイント名は必須です")
    .transform((val) =>
      val
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().min(1)).min(1, "エンドポイントを1つ以上入力してください")),
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
});

export type MigrationCredentialsInput = z.infer<typeof migrationCredentialsSchema>;
