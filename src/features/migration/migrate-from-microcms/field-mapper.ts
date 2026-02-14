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

/**
 * customFields を検索用マップに変換する。
 * microCMS は customFieldCrewId または createdAt で紐付けるため両方をキーにする。
 */
export function buildCrewMap(
  customFields: MicrocmsCustomField[],
): Map<string, MicrocmsCustomField> {
  const map = new Map<string, MicrocmsCustomField>();
  for (const cf of customFields) {
    if (cf.customFieldCrewId) {
      map.set(cf.customFieldCrewId, cf);
    }
    map.set(cf.createdAt, cf);
  }
  return map;
}

/**
 * repeater/custom フィールドから紐付く customField を探す。
 * customFieldCrewId があればそれで、なければ customFieldCreatedAtList で検索。
 */
function resolveCrewFields(
  field: MicrocmsApiField,
  crewMap: Map<string, MicrocmsCustomField>,
): MicrocmsCustomField | undefined {
  if (field.customFieldCrewId) {
    return crewMap.get(field.customFieldCrewId);
  }
  if (field.customFieldCreatedAtList) {
    for (const ts of field.customFieldCreatedAtList) {
      const crew = crewMap.get(ts);
      if (crew) return crew;
    }
  }
  return undefined;
}

export function mapMicrocmsField(
  field: MicrocmsApiField,
  crewMap?: Map<string, MicrocmsCustomField>,
): PreviewField {
  const mycmsKind = KIND_MAP[field.kind] ?? null;

  let validationRules: Record<string, unknown> | null = null;
  let subFields: PreviewField[] | undefined;
  let warning: string | undefined;

  // select → options (microCMS select は常に複数選択)
  if (field.kind === "select" && field.selectItems) {
    validationRules = {
      options: field.selectItems.map((item) => item.value),
      multipleSelect: true,
    };
  }

  // repeater / custom → 子フィールド解決
  if (
    (field.kind === "repeater" || field.kind === "custom") &&
    crewMap
  ) {
    const crew = resolveCrewFields(field, crewMap);
    if (crew && crew.fields.length > 0) {
      subFields = crew.fields.map((child) => mapMicrocmsField(child, crewMap));
      const mappable = subFields.filter((sf) => sf.mycmsKind !== null);
      validationRules = {
        subFields: mappable.map((sf) => ({
          fieldId: sf.fieldId,
          name: sf.name,
          mycmsKind: sf.mycmsKind,
          microcmsKind: sf.microcmsKind,
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
