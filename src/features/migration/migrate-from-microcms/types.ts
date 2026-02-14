import type { FieldKind } from "@/features/content-hub/field-types";

/** microCMS Management API レスポンス */
export interface MicrocmsApiField {
  fieldId: string;
  name: string;
  kind: string;
  required: boolean;
  description?: string;
  selectItems?: { value: string }[];
  customFieldCrewId?: string;
  customFieldCreatedAtList?: string[];
}

export interface MicrocmsCustomField {
  createdAt: string;
  fieldId: string;
  name: string;
  fields: MicrocmsApiField[];
  customFieldCrewId?: string;
}

export interface MicrocmsApiResponse {
  apiFields: MicrocmsApiField[];
  customFields?: MicrocmsCustomField[];
}

/** プレビュー用 */
export interface PreviewField {
  fieldId: string;
  name: string;
  microcmsKind: string;
  mycmsKind: FieldKind | null;
  required: boolean;
  description: string | null;
  validationRules: Record<string, unknown> | null;
  warning?: string;
  subFields?: PreviewField[];
}

export interface PreviewSchema {
  endpoint: string;
  name: string;
  type: "list" | "object";
  fields: PreviewField[];
  error?: string;
  contentCount?: number;
}

export interface MigrationPreview {
  serviceName: string;
  serviceSlug: string;
  schemas: PreviewSchema[];
  includeContent?: boolean;
  microcmsServiceId?: string;
  microcmsApiKey?: string;
}

export interface MigrationResult {
  serviceId: string;
  contentCount: number;
  mediaCount: number;
  debugInfo?: string;
}

/** スキーマ移行結果（Phase 1） */
export interface SchemaMigrationResult {
  serviceId: string;
  schemas: {
    endpoint: string;
    schemaId: string;
    fields: PreviewField[];
    contentCount: number;
  }[];
}

/** コンテンツバッチ移行パラメータ */
export interface ContentBatchParams {
  microcmsServiceId: string;
  microcmsApiKey: string;
  dbServiceId: string;
  endpoint: string;
  schemaId: string;
  fields: PreviewField[];
  offset: number;
  limit: number;
}

/** コンテンツバッチ移行結果 */
export interface ContentBatchResult {
  migrated: number;
  mediaCount: number;
  totalCount: number;
  debugInfo?: string;
}
