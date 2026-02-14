import type { FieldKind } from "./field-types";

/** API スキーマ */
export interface ApiSchema {
  id: string;
  serviceId: string;
  name: string;
  endpoint: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

/** スキーマフィールド */
export interface SchemaField {
  id: string;
  apiSchemaId: string;
  name: string;
  fieldId: string;
  kind: FieldKind;
  description: string | null;
  required: boolean | null;
  position: number;
  validationRules: unknown;
  createdAt: Date;
  updatedAt: Date;
}

/** コンテンツステータス */
export type ContentStatus = "draft" | "published";

/** コンテンツ */
export interface Content {
  id: string;
  apiSchemaId: string;
  serviceId: string;
  data: Record<string, unknown> | null;
  draftData: Record<string, unknown> | null;
  status: string;
  publishedAt: Date | null;
  revisedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** コンテンツバージョン */
export interface ContentVersion {
  id: string;
  contentId: string;
  data: Record<string, unknown>;
  version: number;
  createdAt: Date;
}
