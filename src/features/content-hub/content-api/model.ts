/** Content API のクエリパラメータ */
export interface ContentApiQuery {
  limit: number;
  offset: number;
  orders?: string;
  fields?: string[];
  q?: string;
  ids?: string[];
  depth?: number;
  draftKey?: string;
}

/** シリアライズ済みコンテンツ */
export interface SerializedContent {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  revisedAt: string | null;
  [key: string]: unknown;
}

/** コンテンツリストレスポンス */
export interface ContentListApiResponse {
  contents: SerializedContent[];
  totalCount: number;
  limit: number;
  offset: number;
}
