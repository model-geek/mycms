import type { FieldKind } from "@/features/content-hub/field-types";

import type {
  MicrocmsApiField,
  MicrocmsCustomField,
  PreviewField,
} from "./types";

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
};

/** customFieldCrewId → MicrocmsCustomField のマップを構築 */
export function buildCrewMap(
  customFields: MicrocmsCustomField[],
): Map<string, MicrocmsCustomField> {
  const map = new Map<string, MicrocmsCustomField>();
  for (const cf of customFields) {
    map.set(cf.customFieldCrewId, cf);
  }
  return map;
}

export function mapMicrocmsField(
  field: MicrocmsApiField,
  crewMap?: Map<string, MicrocmsCustomField>,
): PreviewField {
  const mycmsKind = KIND_MAP[field.kind] ?? null;

  let validationRules: Record<string, unknown> | null = null;
  let subFields: PreviewField[] | undefined;
  let warning: string | undefined;

  // select → options
  if (field.kind === "select" && field.selectItems) {
    validationRules = {
      options: field.selectItems.map((item) => item.value),
    };
  }

  // repeater / custom → 子フィールド解決
  if (
    (field.kind === "repeater" || field.kind === "custom") &&
    field.customFieldCrewId &&
    crewMap
  ) {
    const crew = crewMap.get(field.customFieldCrewId);
    if (crew && crew.fields.length > 0) {
      subFields = crew.fields.map((child) => mapMicrocmsField(child, crewMap));
      const mappable = subFields.filter((sf) => sf.mycmsKind !== null);
      validationRules = {
        subFields: mappable.map((sf) => ({
          fieldId: sf.fieldId,
          name: sf.name,
          kind: sf.mycmsKind,
          required: sf.required,
          description: sf.description,
          validationRules: sf.validationRules,
        })),
      };
    } else {
      warning =
        field.kind === "repeater"
          ? "子フィールド定義が見つかりません。手動で設定してください"
          : "詳細設定が見つかりません。手動で設定してください";
    }
  } else if (field.kind === "repeater" || field.kind === "custom") {
    warning =
      field.kind === "repeater"
        ? "子フィールドは移行されません。手動で設定してください"
        : "詳細設定は移行されません。手動で設定してください";
  }

  // relation 系の警告
  if (!warning) {
    warning =
      WARNINGS[field.kind] ??
      (mycmsKind === null
        ? `未対応のフィールドタイプ「${field.kind}」のためスキップされます`
        : undefined);
  }

  return {
    fieldId: field.fieldId,
    name: field.name,
    microcmsKind: field.kind,
    mycmsKind,
    required: field.required,
    description: field.description ?? null,
    validationRules,
    warning,
    subFields,
  };
}
