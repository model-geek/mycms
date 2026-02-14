/**
 * アプリケーション共通型定義
 */

/** API レスポンスのラッパー型 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

/** ページネーション付きレスポンス */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** microCMS 互換リストレスポンス */
export interface ContentListResponse<T> {
  contents: T[];
  totalCount: number;
  limit: number;
  offset: number;
}

/** Server Action の戻り値型 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
