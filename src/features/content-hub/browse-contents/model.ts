import type { Content } from "../model";

/** コンテンツ一覧の検索条件 */
export interface ListContentsParams {
  apiSchemaId: string;
  serviceId: string;
  limit?: number;
  offset?: number;
  status?: string;
}

/** コンテンツ一覧レスポンス */
export interface ListContentsResult {
  contents: Content[];
  totalCount: number;
  limit: number;
  offset: number;
}
