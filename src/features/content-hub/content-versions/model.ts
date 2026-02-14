/** コンテンツバージョン一覧用 */
export interface VersionListItem {
  id: string;
  contentId: string;
  version: number;
  createdAt: Date;
}

/** コンテンツバージョン詳細 */
export interface VersionDetail {
  id: string;
  contentId: string;
  data: Record<string, unknown>;
  version: number;
  createdAt: Date;
}
