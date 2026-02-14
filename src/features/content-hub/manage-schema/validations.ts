import { z } from "zod/v4";

import { FIELD_KINDS } from "../field-types";

export const createApiSchemaSchema = z.object({
  serviceId: z.string().uuid("サービスIDが不正です"),
  name: z
    .string()
    .min(1, "API名は必須です")
    .max(100, "API名は100文字以内です"),
  endpoint: z
    .string()
    .min(1, "エンドポイントは必須です")
    .max(50, "エンドポイントは50文字以内です")
    .regex(
      /^[a-z0-9-]+$/,
      "エンドポイントは英小文字・数字・ハイフンのみ使用できます",
    ),
  type: z.enum(["list", "object"], {
    error: "タイプは list または object を指定してください",
  }),
});

export const updateApiSchemaSchema = z.object({
  name: z
    .string()
    .min(1, "API名は必須です")
    .max(100, "API名は100文字以内です")
    .optional(),
  endpoint: z
    .string()
    .min(1, "エンドポイントは必須です")
    .max(50, "エンドポイントは50文字以内です")
    .regex(
      /^[a-z0-9-]+$/,
      "エンドポイントは英小文字・数字・ハイフンのみ使用できます",
    )
    .optional(),
});

export const createSchemaFieldSchema = z.object({
  apiSchemaId: z.string().uuid("スキーマIDが不正です"),
  name: z
    .string()
    .min(1, "フィールド名は必須です")
    .max(100, "フィールド名は100文字以内です"),
  fieldId: z
    .string()
    .min(1, "フィールドIDは必須です")
    .max(50, "フィールドIDは50文字以内です")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "フィールドIDは英字で始まり、英数字とアンダースコアのみ使用できます",
    ),
  kind: z.enum(FIELD_KINDS as [string, ...string[]], {
    error: "無効なフィールドタイプです",
  }),
  description: z.string().max(500, "説明は500文字以内です").optional(),
  required: z.boolean().optional(),
  validationRules: z.record(z.string(), z.unknown()).optional(),
});

export const updateSchemaFieldSchema = z.object({
  name: z
    .string()
    .min(1, "フィールド名は必須です")
    .max(100, "フィールド名は100文字以内です")
    .optional(),
  fieldId: z
    .string()
    .min(1, "フィールドIDは必須です")
    .max(50, "フィールドIDは50文字以内です")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "フィールドIDは英字で始まり、英数字とアンダースコアのみ使用できます",
    )
    .optional(),
  kind: z
    .enum(FIELD_KINDS as [string, ...string[]], {
      error: "無効なフィールドタイプです",
    })
    .optional(),
  description: z.string().max(500, "説明は500文字以内です").optional(),
  required: z.boolean().optional(),
  validationRules: z.record(z.string(), z.unknown()).optional(),
});

export const reorderSchemaFieldsSchema = z.object({
  fields: z.array(
    z.object({
      id: z.string().uuid("フィールドIDが不正です"),
      position: z.number().int("位置は整数で指定してください").min(0),
    }),
  ),
});

export type CreateApiSchemaInput = z.infer<typeof createApiSchemaSchema>;
export type UpdateApiSchemaInput = z.infer<typeof updateApiSchemaSchema>;
export type CreateSchemaFieldInput = z.infer<typeof createSchemaFieldSchema>;
export type UpdateSchemaFieldInput = z.infer<typeof updateSchemaFieldSchema>;
export type ReorderSchemaFieldsInput = z.infer<typeof reorderSchemaFieldsSchema>;
