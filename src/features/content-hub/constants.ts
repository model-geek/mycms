/** デフォルトのリスト取得件数 */
export const DEFAULT_LIST_LIMIT = 10;

/** リスト取得の最大件数 */
export const MAX_LIST_LIMIT = 100;

/** コンテンツステータス */
export const CONTENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

/** API スキーマタイプ */
export const SCHEMA_TYPE = {
  LIST: "list",
  OBJECT: "object",
} as const;
