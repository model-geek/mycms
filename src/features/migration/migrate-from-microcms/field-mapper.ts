import type { FieldKind } from "@/features/content-hub/field-types";

import type { MicrocmsApiField, PreviewField } from "./types";

const KIND_MAP: Record<string, FieldKind> = {
  text: "text",
  textArea: "textArea",
  richEditor: "richEditor",
  richEditorV2: "richEditor",
  media: "media",
  mediaList: "mediaList",
  date: "date",
  boolean: "boolean",
  select: "select",
  number: "number",
  relation: "relation",
  relationList: "relationList",
  repeater: "repeater",
  custom: "custom",
};

const WARNINGS: Record<string, string> = {
  relation: "リレーション先は移行後に手動で設定してください",
  relationList: "リレーション先は移行後に手動で設定してください",
  repeater: "子フィールドは移行されません。手動で設定してください",
  custom: "詳細設定は移行されません。手動で設定してください",
};

export function mapMicrocmsField(field: MicrocmsApiField): PreviewField {
  const mycmsKind = KIND_MAP[field.kind] ?? null;

  let validationRules: Record<string, unknown> | null = null;
  if (field.kind === "select" && field.selectItems) {
    validationRules = {
      options: field.selectItems.map((item) => item.value),
    };
  }

  return {
    fieldId: field.fieldId,
    name: field.name,
    microcmsKind: field.kind,
    mycmsKind,
    required: field.required,
    description: field.description ?? null,
    validationRules,
    warning:
      WARNINGS[field.kind] ??
      (mycmsKind === null
        ? `未対応のフィールドタイプ「${field.kind}」のためスキップされます`
        : undefined),
  };
}
