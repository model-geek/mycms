import { z } from "zod";

import { FIELD_KINDS } from "../field-types";

const fieldKindEnum = z.enum(FIELD_KINDS as [string, ...string[]]);

const importSubFieldSchema = z.object({
  idValue: z.string().min(1),
  fieldId: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  kind: fieldKindEnum,
  required: z.boolean(),
  description: z.string().nullable().optional(),
}).passthrough();

const importApiFieldSchema = z.object({
  fieldId: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  kind: fieldKindEnum,
  required: z.boolean().optional().default(false),
  description: z.string().nullable().optional(),
  selectItems: z.array(z.object({ id: z.string(), value: z.string() })).optional(),
  multipleSelect: z.boolean().optional(),
  selectInitialValue: z.array(z.string()).optional(),
  referencedApiEndpoint: z.string().optional(),
  unique: z.boolean().optional(),
  patternMatch: z.string().optional(),
  textSizeLimit: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
  numberSizeLimit: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
  customFieldCreatedAt: z.string().optional(),
  customFieldIds: z.array(z.string()).optional(),
  minCount: z.number().optional(),
  maxCount: z.number().optional(),
}).passthrough();

const importCustomFieldSchema = z.object({
  createdAt: z.string(),
  fieldId: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  fields: z.array(importSubFieldSchema).min(1),
  position: z.array(z.array(z.string())).nullable().optional(),
  updatedAt: z.string(),
});

export const schemaImportSchema = z.object({
  apiFields: z.array(importApiFieldSchema).min(1, "apiFieldsには1つ以上のフィールドが必要です"),
  customFields: z.array(importCustomFieldSchema).optional().default([]),
});

export type SchemaImportInput = z.infer<typeof schemaImportSchema>;
export type ImportApiField = z.infer<typeof importApiFieldSchema>;
export type ImportCustomField = z.infer<typeof importCustomFieldSchema>;
