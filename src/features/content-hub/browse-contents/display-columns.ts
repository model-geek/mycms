export interface DisplayColumn {
  fieldId: string;
  name: string;
  kind: string;
}

const IMAGE_KINDS = new Set(["media", "mediaList"]);
const TEXT_KINDS = new Set([
  "text",
  "textArea",
  "richEditorV2",
  "number",
  "date",
  "boolean",
  "select",
]);

/** スキーマフィールドから表示カラムを最大 maxColumns 個選出。画像→テキスト系の順 */
export function buildDisplayColumns(
  fields: { fieldId: string; name: string; kind: string }[],
  maxColumns = 10,
): DisplayColumn[] {
  const imageFields = fields.filter((f) => IMAGE_KINDS.has(f.kind));
  const textFields = fields.filter((f) => TEXT_KINDS.has(f.kind));
  const rest = fields.filter(
    (f) => !IMAGE_KINDS.has(f.kind) && !TEXT_KINDS.has(f.kind),
  );
  return [...imageFields, ...textFields, ...rest].slice(0, maxColumns);
}
