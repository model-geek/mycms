import type { FieldKind } from "@/features/content-hub/field-types";

/** microCMS Management API レスポンス */
export interface MicrocmsApiField {
  fieldId: string;
  name: string;
  kind: string;
  required: boolean;
  description?: string;
  selectItems?: { value: string }[];
}

export interface MicrocmsApiResponse {
  apiFields: MicrocmsApiField[];
  customFields?: unknown[];
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
}

export interface PreviewSchema {
  endpoint: string;
  name: string;
  type: "list" | "object";
  fields: PreviewField[];
  error?: string;
}

export interface MigrationPreview {
  serviceName: string;
  serviceSlug: string;
  schemas: PreviewSchema[];
}
