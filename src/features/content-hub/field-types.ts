export const FIELD_TYPES = {
  text: { label: "テキスト", defaultValue: "" },
  textArea: { label: "テキストエリア", defaultValue: "" },
  richEditor: { label: "リッチエディタ", defaultValue: "" },
  media: { label: "画像", defaultValue: null },
  mediaList: { label: "画像リスト", defaultValue: [] },
  date: { label: "日時", defaultValue: null },
  boolean: { label: "真偽値", defaultValue: false },
  select: { label: "セレクト", defaultValue: "" },
  number: { label: "数値", defaultValue: null },
  relation: { label: "リレーション", defaultValue: null },
  relationList: { label: "リレーションリスト", defaultValue: [] },
  repeater: { label: "繰り返し", defaultValue: [] },
  custom: { label: "カスタム", defaultValue: null },
} as const;

export type FieldKind = keyof typeof FIELD_TYPES;
export const FIELD_KINDS = Object.keys(FIELD_TYPES) as FieldKind[];
