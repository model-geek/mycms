import { z } from "zod";

import { FIELD_KINDS } from "../field-types";

const subFieldSchema = z.object({
  idValue: z.string().min(1),
  fieldId: z
    .string()
    .min(1, "フィールドIDは必須です")
    .max(50, "フィールドIDは50文字以内です")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "フィールドIDは英字で始まり、英数字とアンダースコアのみ使用できます",
    ),
  name: z
    .string()
    .min(1, "フィールド名は必須です")
    .max(100, "フィールド名は100文字以内です"),
  kind: z.enum(FIELD_KINDS as [string, ...string[]], {
    message: "無効なフィールドタイプです",
  }),
  required: z.boolean(),
  description: z.string().max(500).nullable().optional(),
  validationRules: z.record(z.string(), z.unknown()).optional(),
});

export const createCustomFieldSchema = z.object({
  apiSchemaId: z.string().uuid("スキーマIDが不正です"),
  fieldId: z
    .string()
    .min(1, "フィールドIDは必須です")
    .max(50, "フィールドIDは50文字以内です")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "フィールドIDは英字で始まり、英数字とアンダースコアのみ使用できます",
    ),
  name: z
    .string()
    .min(1, "表示名は必須です")
    .max(100, "表示名は100文字以内です"),
  fields: z.array(subFieldSchema).min(1, "サブフィールドを1つ以上追加してください"),
  position: z.array(z.array(z.string())).nullable().optional(),
});

export const updateCustomFieldSchema = z.object({
  fieldId: z
    .string()
    .min(1, "フィールドIDは必須です")
    .max(50, "フィールドIDは50文字以内です")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "フィールドIDは英字で始まり、英数字とアンダースコアのみ使用できます",
    )
    .optional(),
  name: z
    .string()
    .min(1, "表示名は必須です")
    .max(100, "表示名は100文字以内です")
    .optional(),
  fields: z.array(subFieldSchema).min(1, "サブフィールドを1つ以上追加してください").optional(),
  position: z.array(z.array(z.string())).nullable().optional(),
});

export type CreateCustomFieldInput = z.infer<typeof createCustomFieldSchema>;
export type UpdateCustomFieldInput = z.infer<typeof updateCustomFieldSchema>;
